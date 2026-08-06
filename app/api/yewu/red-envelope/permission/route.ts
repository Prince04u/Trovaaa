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

    const permittedUsers = await prisma.user.findMany({
      where: { canCreateRedEnvelope: true },
      select: {
        id: true,
        uid: true,
        displayName: true,
        phone: true,
        createdAt: true
      },
      orderBy: { uid: "asc" }
    });

    return NextResponse.json({ success: true, data: permittedUsers });
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

    const { phone, canCreate } = await req.json();

    if (!phone || phone.trim().length === 0) {
      return NextResponse.json({ message: "Phone number is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { phone: phone.trim() }
    });

    if (!targetUser) {
      return NextResponse.json({ message: `User with phone ${phone} not found.` }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { canCreateRedEnvelope: !!canCreate },
      select: { id: true, phone: true, canCreateRedEnvelope: true }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
