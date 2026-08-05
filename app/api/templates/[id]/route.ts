import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { getTemplateById, updateTemplate, deleteTemplate } from "@/lib/admin/templates";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.view"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const template = await getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("GET template by ID error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch template" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const body = await req.json();
    const template = await updateTemplate(params.id, body);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error("PUT template error:", error);
    return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    await deleteTemplate(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE template error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
