import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { generateDisplayName, generateAvatarSeed, generateReferralCode } from "@/lib/auth/identity";
import { getBonusSettings } from "@/lib/settings/bonuses";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit("register", ip, 5, 60);
    if (!limiter.success) {
      return NextResponse.json({ message: "Too many registration attempts. Please try again after a minute." }, { status: 429 });
    }

    const { name, mobile, password, referralCode, code } = await req.json();

    if (!name || !mobile || !password || !code) {
      return NextResponse.json({ message: "Name, phone number, password, and OTP are required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Verify OTP code
    const storedOtp = await prisma.otp.findUnique({
      where: { phone: cleanMobile },
    });

    if (!storedOtp) {
      return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
    }

    // Check expiration (5 minutes)
    const expiresAt = new Date(storedOtp.createdAt.getTime() + 5 * 60 * 1000);
    if (new Date() > expiresAt) {
      await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});
      return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
    }

    // If it's a custom admin code or mock session
    const storedSessionId = storedOtp.sessionId || "";
    const isMock = storedSessionId === "admin_custom" || storedSessionId.startsWith("mock_session");

    if (isMock) {
      if (storedOtp.code !== cleanCode) {
        return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
      }
    } else {
      // Production HyperAPI verification
      const { verifyOtp } = await import("@/lib/otp");
      const cleanSessionId = storedSessionId.split(":")[0];
      const verifyRes = await verifyOtp(cleanSessionId, cleanCode);
      if (!verifyRes.success) {
        // Fallback: check if database code matches directly (allows admin custom overrides)
        if (storedOtp.code !== cleanCode) {
          return NextResponse.json({ message: "Verification Code is false" }, { status: 400 });
        }
      }
    }

    // Delete OTP on successful verification
    await prisma.otp.delete({ where: { phone: cleanMobile } }).catch(() => {});

    const isEmailRegistration = mobile.includes("@");

    const existingUser = await prisma.user.findUnique({
      where: isEmailRegistration ? { email: mobile.toLowerCase().trim() } : { phone: mobile.trim() },
    });

    if (existingUser) {
      return NextResponse.json({
        message: isEmailRegistration ? "Email is already registered." : "Phone number is already registered."
      }, { status: 400 });
    }

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json({ message: "Invite code is required." }, { status: 400 });
    }

    const parent = await prisma.user.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
    });

    if (!parent) {
      return NextResponse.json({ message: "Invalid invite code." }, { status: 400 });
    }

    const referredById = parent.id;

    const passwordHash = await hashPassword(password);
    const { signupBonus } = await getBonusSettings();

    let createdUser;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        createdUser = await prisma.$transaction(async (tx) => {
          // Generate a guaranteed unique referral code
          let referralCodeGenerated = generateReferralCode();
          while (await tx.user.findUnique({ where: { referralCode: referralCodeGenerated } })) {
            referralCodeGenerated = generateReferralCode();
          }

          let finalDisplayName = name || generateDisplayName();
          let nameExists = await tx.user.findFirst({ where: { displayName: finalDisplayName } });
          while (nameExists) {
            if (name) {
              finalDisplayName = `${name}${Math.floor(100 + Math.random() * 900)}`;
            } else {
              finalDisplayName = generateDisplayName();
            }
            nameExists = await tx.user.findFirst({ where: { displayName: finalDisplayName } });
          }

          // Check if there is already an existing user registered or logged in from the same IP address
          let isMultiple = false;
          if (ip && ip !== "127.0.0.1") {
            const sameIpUsers = await tx.user.findMany({
              where: {
                lastLoginIp: ip,
                role: "USER",
              },
            });
            if (sameIpUsers.length > 0) {
              isMultiple = true;
              for (const existing of sameIpUsers) {
                const updatedNote = existing.adminNote ? (existing.adminNote.includes("Multiple Account") ? existing.adminNote : `${existing.adminNote} | Multiple Account`) : "Multiple Account";
                await tx.user.update({
                  where: { id: existing.id },
                  data: {
                    adminNote: updatedNote,
                  },
                });
              }
            }
          }

          const user = await tx.user.create({
            data: {
              phone: isEmailRegistration ? null : mobile.trim(),
              email: isEmailRegistration ? mobile.toLowerCase().trim() : null,
              passwordHash,
              plainPassword: password,
              referredById,
              displayName: finalDisplayName,
              avatarSeed: generateAvatarSeed(),
              referralCode: referralCodeGenerated,
              lastLoginIp: ip,
              adminNote: isMultiple ? "Multiple Account" : null,
            },
          });

          const wallet = await tx.wallet.create({
            data: { userId: user.id, balance: signupBonus },
          });

          await tx.ledgerEntry.create({
            data: {
              walletId: wallet.id,
              type: "WELCOME_BONUS",
              amount: signupBonus,
              balanceAfter: signupBonus,
            },
          });

          return user;
        });
        break;
      } catch (err: any) {
        if (err.code === "P2002" && attempt < 4) continue;
        throw err;
      }
    }

    if (!createdUser) {
      return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 });
    }

    const token = await createSession(createdUser.id, false);
    const mappedRole = createdUser.role === "SUPER_ADMIN" ? "admin" : "player";

    // Set cookie for Server Action fallbacks
    const cookieStore = await cookies();
    cookieStore.set("luckynova_jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        role: mappedRole,
        profile: {
          id: createdUser.id,
          uid: createdUser.uid,
          name: createdUser.displayName,
          mobile: createdUser.phone,
          inviteCode: createdUser.referralCode,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
