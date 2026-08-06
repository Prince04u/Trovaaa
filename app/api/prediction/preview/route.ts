import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { getTemplateById } from "@/lib/admin/templates";
import { generatePredictionImage } from "@/lib/admin/imageGenerator";

export async function POST(req: NextRequest) {
  try {
    // const token = await verifyAdmin();
    // if (!token) {
    //   return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    // }

    const { templateId, headerValues, rows, isLast } = await req.json();
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

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Preview prediction error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate preview" }, { status: 500 });
  }
}
