import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

// GET details of a red envelope by code
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ message: "Code is required" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    const envelope = await prisma.redEnvelope.findUnique({
      where: { code: code.trim() },
      include: {
        claims: {
          select: { userId: true }
        }
      }
    });

    if (!envelope) {
      return NextResponse.json({ message: "Red Envelope not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: envelope.id,
        code: envelope.code,
        amount: envelope.amount,
        maxClaims: envelope.maxClaims,
        claimedCount: envelope.claimedCount,
        specificUserId: envelope.specificUserId,
      }
    });
  } catch (error: any) {
    console.error("GET red-envelope/claim error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

// POST claim a red envelope by code
export async function POST(req: NextRequest) {
  try {
    let user = await getAuthUser(req);
    if (!user) {
      const { getCurrentUser } = await import("@/lib/auth/session");
      user = await getCurrentUser();
    }
    if (!user) {
      return NextResponse.json({ message: "Please log in first" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ message: "Code is required" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    const envelope = await prisma.redEnvelope.findUnique({
      where: { code: code.trim() }
    });

    if (!envelope) {
      return NextResponse.json({ message: "Red Envelope not found" }, { status: 404 });
    }

    // 1. Check user restriction
    if (envelope.specificUserId && envelope.specificUserId !== user.id) {
      return NextResponse.json({ message: "Invalid parameter" }, { status: 403 });
    }

    // 2. Check if already claimed by this user
    const existingClaim = await prisma.redEnvelopeClaim.findUnique({
      where: {
        redEnvelopeId_userId: {
          redEnvelopeId: envelope.id,
          userId: user.id
        }
      }
    });

    if (existingClaim) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        amount: envelope.amount,
        message: "Already claimed"
      }, { status: 400 });
    }

    // 3. Check claims limit
    if (envelope.claimedCount >= envelope.maxClaims) {
      return NextResponse.json({ message: "This red envelope has already been claimed" }, { status: 400 });
    }

    // 4. Perform atomic claim transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Increment claimedCount in RedEnvelope
        const updatedEnv = await tx.redEnvelope.update({
          where: { id: envelope.id },
          data: { claimedCount: { increment: 1 } }
        });

        if (updatedEnv.claimedCount > updatedEnv.maxClaims) {
          throw new Error("EXCEEDED_LIMIT");
        }

        // Create RedEnvelopeClaim record
        await tx.redEnvelopeClaim.create({
          data: {
            redEnvelopeId: envelope.id,
            userId: user.id,
            amount: envelope.amount
          }
        });

        // Get/Create user wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId: user.id }
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: user.id, balance: 0 }
          });
        }

        // Update Wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: envelope.amount } }
        });

        // Log LedgerEntry
        await tx.ledgerEntry.create({
          data: {
            walletId: updatedWallet.id,
            type: "RED_ENVELOPE_CLAIMED",
            amount: envelope.amount,
            balanceAfter: updatedWallet.balance,
            meta: { code: envelope.code }
          }
        });
      });

      return NextResponse.json({
        success: true,
        amount: envelope.amount,
        message: "success"
      });
    } catch (txError: any) {
      if (txError.message === "EXCEEDED_LIMIT") {
        return NextResponse.json({ message: "This red envelope has already been claimed" }, { status: 400 });
      }
      throw txError;
    }
  } catch (error: any) {
    console.error("POST red-envelope/claim error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
