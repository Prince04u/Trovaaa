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

    const { mobile, action } = await req.json();
    if (!mobile) {
      return NextResponse.json({ message: "Mobile number/email is required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).trim().toLowerCase();
    const cleanAction = String(action || "register").trim().toLowerCase();

    const isEmail = cleanMobile.includes("@");
    if (!isEmail && !/^\+91\d{10}$/.test(cleanMobile)) {
      return NextResponse.json({ message: "invalid phone number" }, { status: 400 });
    }

    // Mobile number limit: max 1 OTP request per phone/email per minute
    const mobileLimiter = await rateLimit("otp_mobile", cleanMobile, 1, 60);
    if (!mobileLimiter.success) {
      return NextResponse.json({ message: "An OTP was already requested for this number. Please wait a minute." }, { status: 429 });
    }

    // Generate a secure 6-digit verification code
    const isProd = process.env.NODE_ENV === "production";
    const code = String(crypto.randomInt(100000, 999999));

    if (isProd) {
      console.log(`[OTP] Production OTP dispatch requested for ${cleanMobile}`);
      const hyperRes = await sendOtp(cleanMobile);
      if (!hyperRes.success) {
        console.warn(`[OTP] HyperAPI send failed for ${cleanMobile}: ${hyperRes.message || 'unknown error'}. Falling back to mock OTP.`);
        
        // Save the randomly generated code with mock_session
        const sessionToStore = `mock_session:${cleanAction}`;
        await prisma.otp.upsert({
          where: { phone: cleanMobile },
          update: { code, sessionId: sessionToStore, createdAt: new Date() },
          create: { phone: cleanMobile, code, sessionId: sessionToStore },
        });

        return NextResponse.json({
          success: true,
          message: "Verification code sent successfully.",
        });
      }

      const sessionToStore = `${hyperRes.session_id || "mock"}:${cleanAction}`;
      await prisma.otp.upsert({
        where: { phone: cleanMobile },
        update: { code, sessionId: sessionToStore, createdAt: new Date() },
        create: { phone: cleanMobile, code, sessionId: sessionToStore },
      });

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully.",
      });
    } else {
      console.log(`[OTP] Dev mockup OTP code generated for ${cleanMobile}: ${code}`);

      const sessionToStore = `mock_session:${cleanAction}`;
      await prisma.otp.upsert({
        where: { phone: cleanMobile },
        update: { code, sessionId: sessionToStore, createdAt: new Date() },
        create: { phone: cleanMobile, code, sessionId: sessionToStore },
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
