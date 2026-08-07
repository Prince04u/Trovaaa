import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Authenticate staff
    await requireStaff();

    const setting = await prisma.setting.findUnique({
      where: { key: "systemNotice" },
    });
    return NextResponse.json({ success: true, data: setting?.value || "" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate staff
    await requireStaff();

    const { content } = await req.json();

    const setting = await prisma.setting.upsert({
      where: { key: "systemNotice" },
      create: { key: "systemNotice", value: content || "" },
      update: { value: content || "" },
    });

    return NextResponse.json({ success: true, data: setting.value });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
