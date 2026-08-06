import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "results.view"))) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { prisma } = await import("@/lib/prisma");

    const envelopes = await prisma.redEnvelope.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, displayName: true, phone: true }
        },
        claims: {
          include: {
            user: {
              select: { id: true, displayName: true, phone: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: envelopes });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "results.view"))) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { code, amount, maxClaims, specificUserPhone } = await req.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
    }
    if (!maxClaims || isNaN(maxClaims) || maxClaims <= 0) {
      return NextResponse.json({ message: "Invalid max claims." }, { status: 400 });
    }
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ message: "Code is required." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    let specificUserId: string | null = null;
    if (specificUserPhone && specificUserPhone.trim().length > 0) {
      const targetUser = await prisma.user.findUnique({
        where: { phone: specificUserPhone.trim() }
      });
      if (!targetUser) {
        return NextResponse.json({ message: `User with phone ${specificUserPhone} not found.` }, { status: 400 });
      }
      specificUserId = targetUser.id;
    }

    // Check unique code
    const existing = await prisma.redEnvelope.findUnique({
      where: { code: code.trim() }
    });
    if (existing) {
      return NextResponse.json({ message: "This code is already in use. Please enter a different code." }, { status: 400 });
    }

    const newEnvelope = await prisma.redEnvelope.create({
      data: {
        code: code.trim(),
        amount: parseInt(amount),
        maxClaims: parseInt(maxClaims),
        specificUserId,
        creatorId: user.id
      }
    });

    return NextResponse.json({ success: true, data: newEnvelope });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "results.view"))) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ message: "Envelope ID is required." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    // Delete in transaction
    await prisma.$transaction([
      prisma.redEnvelopeClaim.deleteMany({
        where: { redEnvelopeId: id.trim() }
      }),
      prisma.redEnvelope.delete({
        where: { id: id.trim() }
      })
    ]);

    return NextResponse.json({ success: true, message: "Red Envelope deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
