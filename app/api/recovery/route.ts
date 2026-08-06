import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  try {
    const passwordHash = await hashPassword("admin123");
    
    // Create or update a known admin account
    const admin = await prisma.user.upsert({
      where: { phone: "8888888888" },
      update: {
        passwordHash,
        role: "SUPER_ADMIN",
      },
      create: {
        phone: "8888888888",
        passwordHash,
        role: "SUPER_ADMIN",
        displayName: "Recovery Admin",
        avatarSeed: "recovery",
        referralCode: "RECOVERY123",
      }
    });

    // Ensure wallet exists
    const wallet = await prisma.wallet.findUnique({ where: { userId: admin.id } });
    if (!wallet) {
      await prisma.wallet.create({ data: { userId: admin.id, balance: 0 } });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Recovery admin account ready.",
      credentials: {
        phone: "8888888888",
        password: "admin123"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
