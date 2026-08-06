import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { getTemplateById } from "@/lib/admin/templates";
import { generatePredictionImage } from "@/lib/admin/imageGenerator";
import { sendPhotoToTelegram } from "@/lib/admin/telegram";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const { templateId, headerValues, rows, isLast, caption, chatId } = await req.json();
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    const template = await getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const origin = url.origin;
    const imageBuffer = await generatePredictionImage(template, headerValues || {}, rows || [], !!isLast, origin);

    // Send it directly to Telegram
    await sendPhotoToTelegram(imageBuffer, caption, chatId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Send prediction to Telegram error:", error);
    return NextResponse.json({ error: error.message || "Failed to send image to Telegram" }, { status: 500 });
  }
}
