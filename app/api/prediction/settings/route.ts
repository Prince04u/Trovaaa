import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.view"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const setting = await prisma.setting.findUnique({
      where: { key: "telegram_channel_username" },
    });

    return NextResponse.json({ 
      channelUsername: setting ? setting.value : "@mason81631" 
    });
  } catch (error: any) {
    console.error("GET telegram settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const { channelUsername } = await req.json();
    if (channelUsername === undefined) {
      return NextResponse.json({ error: "channelUsername is required" }, { status: 400 });
    }

    // Clean up channel name (ensure it starts with @ if it's a handle, or is a numeric ID)
    let formatted = channelUsername.trim();
    if (formatted && !formatted.startsWith("@") && !formatted.startsWith("-")) {
      formatted = `@${formatted}`;
    }

    await prisma.setting.upsert({
      where: { key: "telegram_channel_username" },
      update: { value: formatted },
      create: { key: "telegram_channel_username", value: formatted },
    });

    return NextResponse.json({ success: true, channelUsername: formatted });
  } catch (error: any) {
    console.error("POST telegram settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
