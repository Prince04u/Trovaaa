import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Please log in first" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    // Check if the user has permission to create envelopes
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallet: true }
    });

    if (!dbUser || !dbUser.canCreateRedEnvelope) {
      return NextResponse.json({ message: "You do not have permission to send red envelopes." }, { status: 403 });
    }

    const { amount, password } = await req.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const numericAmount = Math.floor(parseFloat(amount));

    // Verify password
    const isPasswordCorrect = await verifyPassword(password, dbUser.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect login password." }, { status: 400 });
    }

    // Verify wallet balance
    const balance = dbUser.wallet?.balance ?? 0;
    if (balance < numericAmount) {
      return NextResponse.json({ message: "Insufficient wallet balance." }, { status: 400 });
    }

    // Generate random 8-character code
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create envelope and deduct wallet balance
    const newEnvelope = await prisma.$transaction(async (tx) => {
      // Deduct balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: dbUser.id },
        data: { balance: { decrement: numericAmount } }
      });

      // Log Ledger entry
      await tx.ledgerEntry.create({
        data: {
          walletId: updatedWallet.id,
          type: "ADMIN_ADJUST", // custom adjust / deduct
          amount: -numericAmount,
          balanceAfter: updatedWallet.balance,
          meta: { action: "create_red_envelope", code }
        }
      });

      // Create RedEnvelope
      const env = await tx.redEnvelope.create({
        data: {
          code,
          amount: numericAmount,
          maxClaims: 1,
          creatorId: dbUser.id
        }
      });

      return env;
    });

    return NextResponse.json({
      success: true,
      data: {
        code: newEnvelope.code,
        amount: newEnvelope.amount
      },
      message: "Red envelope launched successfully!"
    });
  } catch (error: any) {
    console.error("POST wallet/red-envelope/create error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
