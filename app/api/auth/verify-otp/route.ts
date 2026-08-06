import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { mobile, code } = await req.json();
    if (!mobile || !code) {
      return NextResponse.json({ message: "Mobile number/email and verification code are required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const storedOtp = await prisma.otp.findUnique({
      where: { phone: cleanMobile },
    });

    if (!storedOtp) {
      return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
    }

    // Check expiration (5 minutes / 300 seconds)
    const expiresAt = new Date(storedOtp.createdAt.getTime() + 5 * 60 * 1000);
    if (new Date() > expiresAt) {
      await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});
      return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
    }

    // If it's a custom admin code or mock session
    if (storedOtp.sessionId === "admin_custom" || storedOtp.sessionId === "mock_session") {
      if (storedOtp.code !== cleanCode) {
        return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
      }
    } else {
      // Production HyperAPI verification
      const verifyRes = await verifyOtp(storedOtp.sessionId || "", cleanCode);
      if (!verifyRes.success) {
        // Fallback: check if the database code matches directly (allows admin custom overrides)
        if (storedOtp.code !== cleanCode) {
          return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
        }
      }
    }

    // Delete OTP on successful verification to prevent reuse
    await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
