import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { getTemplateById } from "@/lib/admin/templates";
import { generatePredictionImage } from "@/lib/admin/imageGenerator";
import { uploadImage } from "@/lib/storage/supabase";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const { templateId, headerValues, rows, isLast } = await req.json();
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    const template = await getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const imageBuffer = await generatePredictionImage(template, headerValues || {}, rows || [], !!isLast);

    // Upload generated PNG to storage
    const publicUrl = await uploadImage(imageBuffer, "image/png", "png");

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error: any) {
    console.error("Generate prediction error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
