import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // IP limit: max 3 OTP requests per IP per minute
    const ipLimiter = await rateLimit("otp_ip", ip, 3, 60);
    if (!ipLimiter.success) {
      return NextResponse.json({ message: "Too many requests from this IP. Please try again after a minute." }, { status: 429 });
    }

    const { mobile } = await req.json();
    if (!mobile) {
      return NextResponse.json({ message: "Mobile number/email is required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).trim().toLowerCase();

    // Mobile number limit: max 1 OTP request per phone/email per minute
    const mobileLimiter = await rateLimit("otp_mobile", cleanMobile, 1, 60);
    if (!mobileLimiter.success) {
      return NextResponse.json({ message: "An OTP was already requested for this number. Please wait a minute." }, { status: 429 });
    }

    // Generate a secure 6-digit verification code
    const isProd = process.env.NODE_ENV === "production";
    const code = isProd
      ? String(crypto.randomInt(100000, 999999))
      : "123456";

    if (isProd) {
      console.log(`[OTP] Production OTP dispatch requested for ${cleanMobile}`);
      const hyperRes = await sendOtp(cleanMobile);
      if (!hyperRes.success) {
        return NextResponse.json({ message: hyperRes.message || "Failed to send verification SMS." }, { status: 500 });
      }

      await prisma.otp.upsert({
        where: { phone: cleanMobile },
        update: { code, sessionId: hyperRes.session_id || null, createdAt: new Date() },
        create: { phone: cleanMobile, code, sessionId: hyperRes.session_id || null },
      });

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully.",
      });
    } else {
      console.log(`[OTP] Dev mockup OTP code generated for ${cleanMobile}: ${code}`);

      await prisma.otp.upsert({
        where: { phone: cleanMobile },
        update: { code, sessionId: "mock_session", createdAt: new Date() },
        create: { phone: cleanMobile, code, sessionId: "mock_session" },
      });

      return NextResponse.json({
        success: true,
        message: `Verification code sent successfully `,
      });
    }
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
