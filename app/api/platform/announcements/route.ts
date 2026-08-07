import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "systemNotice" },
    });
    const content = setting?.value || "Welcome to Luvomall!";
    return NextResponse.json({ success: true, data: content });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
