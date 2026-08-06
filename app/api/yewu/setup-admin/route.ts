import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateDisplayName, generateAvatarSeed, generateReferralCode } from "@/lib/auth/identity";

export async function GET() {
  try {
    const phone = "9341225312";
    const password = "467878";
    const hash = await hashPassword(password);
    
    let user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "SUPER_ADMIN", passwordHash: hash }
      });
    } else {
      user = await prisma.user.create({
        data: {
          phone,
          passwordHash: hash,
          role: "SUPER_ADMIN",
          displayName: generateDisplayName(),
          avatarSeed: generateAvatarSeed(),
          referralCode: generateReferralCode(),
        }
      });
      await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Admin account setup successfully!`,
      details: `Phone: ${phone}, Password: ${password}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
