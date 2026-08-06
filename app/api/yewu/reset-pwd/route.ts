import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function GET(req: Request) {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (!admin) {
      return NextResponse.json({ error: "No super admin found in database" }, { status: 404 });
    }

    const newHash = await hashPassword("467878");

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: `Password for ${admin.phone} reset to 467878 successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
