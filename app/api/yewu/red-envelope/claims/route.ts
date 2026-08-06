import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "results.view"))) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Find user first
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: q.trim() },
          { phone: q.trim() },
          { phone: `+91${q.trim()}` }
        ]
      }
    });

    if (!targetUser) {
      return NextResponse.json({ success: true, data: [] });
    }

    const claims = await prisma.redEnvelopeClaim.findMany({
      where: { userId: targetUser.id },
      include: {
        redEnvelope: {
          select: { code: true, amount: true, createdAt: true }
        },
        user: {
          select: { id: true, displayName: true, phone: true }
        }
      },
      orderBy: { claimedAt: "desc" }
    });

    return NextResponse.json({ success: true, data: claims });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
