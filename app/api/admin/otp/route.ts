import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
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
    const user = await getAuthUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
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
