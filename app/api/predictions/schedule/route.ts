import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const scheduled = await prisma.scheduledPrediction.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: [
        { scheduledAt: "asc" },
        { priority: "desc" },
      ],
      include: {
        createdBy: {
          select: { displayName: true },
        },
      },
    });

    // We fetch a list of prediction templates so the client can display template names
    const templates = await prisma.predictionTemplate.findMany({
      select: { id: true, name: true },
    });
    const templateMap = new Map(templates.map((t) => [t.id, t.name]));

    const formatted = scheduled.map((p) => ({
      id: p.id,
      templateId: p.templateId,
      templateName: p.messageText ? "Text Message" : (templateMap.get(p.templateId || "") || "Unknown Template"),
      headerValues: p.headerValues ? JSON.parse(p.headerValues) : {},
      rows: p.rows ? JSON.parse(p.rows) : [],
      isLast: p.isLast,
      chatId: p.chatId,
      messageText: p.messageText,
      scheduledAt: p.scheduledAt.toISOString(),
      priority: p.priority,
      autoOverrideWingo: p.autoOverrideWingo,
      createdBy: p.createdBy.displayName,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET scheduled predictions error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch scheduled predictions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const {
      templateId,
      headerValues,
      rows,
      isLast,
      chatId,
      messageText,
      scheduledAt,
      priority,
      autoOverrideWingo,
    } = await req.json();

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
    }

    if (!templateId && !messageText) {
      return NextResponse.json({ error: "Either templateId or messageText must be provided" }, { status: 400 });
    }

    const scheduledTime = new Date(scheduledAt);
    if (isNaN(scheduledTime.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled time format" }, { status: 400 });
    }

    if (scheduledTime.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }

    // Save scheduled prediction/text message to db
    await prisma.scheduledPrediction.create({
      data: {
        templateId: templateId || null,
        headerValues: headerValues ? JSON.stringify(headerValues) : null,
        rows: rows ? JSON.stringify(rows) : null,
        isLast: !!isLast,
        chatId: chatId || null,
        messageText: messageText || null,
        scheduledAt: scheduledTime,
        priority: Number(priority || 0),
        autoOverrideWingo: autoOverrideWingo !== false,
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST scheduled prediction error:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule prediction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 });
    }

    const item = await prisma.scheduledPrediction.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Scheduled prediction not found" }, { status: 404 });
    }

    await prisma.scheduledPrediction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE scheduled prediction error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel scheduled prediction" }, { status: 500 });
  }
}
