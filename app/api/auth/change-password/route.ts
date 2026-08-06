import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  try {
    const { mobile, code, password } = await req.json();

    if (!mobile || !code || !password) {
      return NextResponse.json(
        { message: "Mobile number, verification code, and new password are required." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).trim().toLowerCase();
    const cleanCode = String(code).trim();

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Find the user by phone number
    const user = await prisma.user.findFirst({
      where: { phone: cleanMobile },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this mobile number." },
        { status: 404 }
      );
    }

    // Verify OTP from database
    const storedOtp = await prisma.otp.findUnique({
      where: { phone: cleanMobile },
    });

    if (!storedOtp) {
      return NextResponse.json(
        { message: "Please request a verification code first." },
        { status: 400 }
      );
    }

    // Check expiration (5 minutes)
    const expiresAt = new Date(storedOtp.createdAt.getTime() + 5 * 60 * 1000);
    if (new Date() > expiresAt) {
      await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify code matches
    if (storedOtp.code !== cleanCode) {
      return NextResponse.json(
        { message: "Verification Code is false" },
        { status: 400 }
      );
    }

    // Delete OTP to prevent reuse
    await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});

    // Hash the new password and update user
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
