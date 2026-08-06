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

    const otps = await prisma.otp.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: otps });
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

    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ message: "Phone and code are required" }, { status: 400 });
    }

    const cleanMobile = String(phone).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const otp = await prisma.otp.upsert({
      where: { phone: cleanMobile },
      update: { code: cleanCode, sessionId: "admin_custom", createdAt: new Date() },
      create: { phone: cleanMobile, code: cleanCode, sessionId: "admin_custom" },
    });

    return NextResponse.json({ success: true, data: otp });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
