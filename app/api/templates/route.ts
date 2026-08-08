import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, isStaffUser } from "@/lib/admin/permissions";
import { getAllTemplates, createTemplate, duplicateTemplate } from "@/lib/admin/templates";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.view"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const templates = await getAllTemplates();
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("GET templates error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffUser(user) || !(await hasPermission(user, "cms.manage"))) {
      return new Response("Not authorized", { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Handle JSON requests (Duplication)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.action === "duplicate" && body.id) {
        const duplicated = await duplicateTemplate(body.id);
        return NextResponse.json(duplicated);
      }
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // 2. Handle Multipart form-data requests (Upload new template)
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;

    if (!name || !file) {
      return NextResponse.json({ error: "Name and image file are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";

    // Read image metadata to dynamically place default coordinates
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Convert template background image to Base64 data URL directly
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Responsive default placements for fields based on image size
    const defaultFields = {
      period: {
        text: "20260805001",
        x: Math.round(width / 2),
        y: Math.round(height * 0.22),
        fontSize: Math.round(height * 0.04),
        fontFamily: "Inter",
        color: "#E2E8F0",
        fontWeight: "bold",
        fontStyle: "normal",
        align: "center",
        rotation: 0,
        opacity: 1,
        letterSpacing: 0,
        shadowColor: "rgba(0,0,0,0.6)",
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      prediction: {
        text: "Green",
        x: Math.round(width / 2),
        y: Math.round(height * 0.38),
        fontSize: Math.round(height * 0.06),
        fontFamily: "Inter",
        color: "#10B981",
        fontWeight: "bold",
        fontStyle: "normal",
        align: "center",
        rotation: 0,
        opacity: 1,
        letterSpacing: 1,
        shadowColor: "rgba(0,0,0,0.6)",
        shadowBlur: 5,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      bigSmall: {
        text: "Big",
        x: Math.round(width / 2),
        y: Math.round(height * 0.48),
        fontSize: Math.round(height * 0.045),
        fontFamily: "Inter",
        color: "#F59E0B",
        fontWeight: "bold",
        fontStyle: "normal",
        align: "center",
        rotation: 0,
        opacity: 1,
        letterSpacing: 0,
        shadowColor: "rgba(0,0,0,0.6)",
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      confidence: {
        text: "95%",
        x: Math.round(width / 2),
        y: Math.round(height * 0.58),
        fontSize: Math.round(height * 0.05),
        fontFamily: "Outfit",
        color: "#FBBF24",
        fontWeight: "bold",
        fontStyle: "normal",
        align: "center",
        rotation: 0,
        opacity: 1,
        letterSpacing: 0,
        shadowColor: "rgba(0,0,0,0.6)",
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      manager: {
        text: "@LuvomallOfficial",
        x: Math.round(width / 2),
        y: Math.round(height * 0.72),
        fontSize: Math.round(height * 0.035),
        fontFamily: "Inter",
        color: "#94A3B8",
        fontWeight: "normal",
        fontStyle: "normal",
        align: "center",
        rotation: 0,
        opacity: 0.9,
        letterSpacing: 0,
        shadowColor: "rgba(0,0,0,0.5)",
        shadowBlur: 3,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      },
      caption: {
        text: "Join daily for continuous profit!",
        x: Math.round(width / 2),
        y: Math.round(height * 0.82),
        fontSize: Math.round(height * 0.03),
        fontFamily: "Inter",
        color: "#CBD5E1",
        fontWeight: "normal",
        fontStyle: "italic",
        align: "center",
        rotation: 0,
        opacity: 0.85,
        letterSpacing: 0,
        shadowColor: "rgba(0,0,0,0.5)",
        shadowBlur: 3,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      }
    };

    const template = await createTemplate(name, imageUrl, defaultFields);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error("POST templates error:", error);
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
  }
}
