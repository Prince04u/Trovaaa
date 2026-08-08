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

    // Read image metadata and raw pixels to dynamically place coordinates and detect table alignment
    const rawImage = sharp(buffer);
    const metadata = await rawImage.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const { data: rawData } = await rawImage.raw().toBuffer({ resolveWithObject: true });

    // Auto-detect tableConfig from the uploaded PNG background image
    let detectedTableConfig = null;
    try {
      const scanX = 50; // far left to avoid center figures/overlays
      let orangeBottomY = -1;
      let orangeTopY = -1;

      for (let y = height - 1; y >= Math.max(0, height - 100); y--) {
        const idx = (y * width + scanX) * 4;
        const r = rawData[idx];
        const g = rawData[idx + 1];
        const b = rawData[idx + 2];

        // Orange/Red detection (high red, low blue)
        const isOrange = r > 140 && g < 130 && b < 100;

        if (isOrange) {
          if (orangeBottomY === -1) orangeBottomY = y;
          orangeTopY = y;
        } else {
          if (orangeBottomY !== -1) break;
        }
      }

      if (orangeTopY !== -1 && orangeBottomY !== -1) {
        const y1 = orangeTopY + 2;
        const y2 = orangeTopY + 4;
        const y3 = orangeBottomY - 4;
        const y4 = orangeBottomY - 2;

        let leftBorder = -1;
        for (let x = 0; x < width; x++) {
          let orangeCount = 0;
          for (const yVal of [y1, y2, y3, y4]) {
            const idx = (yVal * width + x) * 4;
            if (rawData[idx] > 140 && rawData[idx + 1] < 130 && rawData[idx + 2] < 100) {
              orangeCount++;
            }
          }
          if (orangeCount >= 3) {
            leftBorder = x;
            break;
          }
        }

        let rightBorder = -1;
        for (let x = width - 1; x >= 0; x--) {
          let orangeCount = 0;
          for (const yVal of [y1, y2, y3, y4]) {
            const idx = (yVal * width + x) * 4;
            if (rawData[idx] > 140 && rawData[idx + 1] < 130 && rawData[idx + 2] < 100) {
              orangeCount++;
            }
          }
          if (orangeCount >= 3) {
            rightBorder = x;
            break;
          }
        }

        if (leftBorder !== -1 && rightBorder !== -1) {
          const separators: number[] = [];
          let inSeparator = false;
          let currentSepStart = -1;

          for (let x = leftBorder + 10; x < rightBorder - 10; x++) {
            const b_top1 = rawData[(y1 * width + x) * 4 + 2];
            const b_top2 = rawData[(y2 * width + x) * 4 + 2];
            const b_bot1 = rawData[(y3 * width + x) * 4 + 2];
            const b_bot2 = rawData[(y4 * width + x) * 4 + 2];

            const hasTop = b_top1 > 60 || b_top2 > 60;
            const hasBottom = b_bot1 > 60 || b_bot2 > 60;
            const isWhiteLine = hasTop && hasBottom;

            if (isWhiteLine) {
              if (!inSeparator) {
                inSeparator = true;
                currentSepStart = x;
              }
            } else {
              if (inSeparator) {
                inSeparator = false;
                const center = Math.round((currentSepStart + x - 1) / 2);
                separators.push(center);
              }
            }
          }

          if (separators.length === 5) {
            const widths: number[] = [];
            let lastX = leftBorder;
            for (const sep of separators) {
              widths.push(sep - lastX);
              lastX = sep;
            }
            widths.push(rightBorder - lastX);

            const scaleFactor = 2048 / width;
            const scaledLeft = Math.round(leftBorder * scaleFactor);
            const scaledWidths = widths.map(w => Math.round(w * scaleFactor));
            const totalWidth = scaledWidths.reduce((a, b) => a + b, 0);

            detectedTableConfig = {
              marginLeft: scaledLeft,
              width: totalWidth,
              colWidths: scaledWidths,
              borderColor: "#fe7741",
              innerBorderColor: "#ffebe0"
            };
          }
        }
      }
    } catch (detectErr) {
      console.error("Auto tableConfig detection failed, falling back:", detectErr);
    }

    const scale = 2048 / width;
    const fallbackTableConfig = {
      marginLeft: Math.round(39 * scale),
      width: 1972,
      colWidths: [350, 322, 314, 316, 330, 340].map(w => Math.round(w * scale)),
      borderColor: "#fe7741",
      innerBorderColor: "#ffebe0"
    };

    const tableConfig = detectedTableConfig || fallbackTableConfig;

    // Convert template background image to Base64 data URL directly
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Responsive default placements for fields based on image size
    const defaultFields = {
      tableConfig,
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
