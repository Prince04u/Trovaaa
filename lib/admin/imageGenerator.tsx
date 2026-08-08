import { ImageResponse } from "next/og";
import sharp from "sharp";
import React from "react";

export interface TableRow {
  period: string;
  project: string;
  colour: string;
  amount: string;
  result: string;
  profit: string;
}

function formatPeriodId(id: string | bigint | number): string {
  if (!id) return "";
  const str = String(id).trim();
  if (str.length > 11) return str.substring(0, 8) + str.substring(str.length - 3);
  return str;
}

export async function generatePredictionImage(
  template: { imageUrl: string; fields: any },
  headerValues: Record<string, string>,
  rows: TableRow[],
  isLast: boolean,
  origin?: string
): Promise<Buffer> {
  const resolvedOrigin = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let baseImageBuffer: Buffer;
  let imageSrc = template.imageUrl;

  let mime = "image/png";
  if (template.imageUrl.endsWith(".jpg") || template.imageUrl.endsWith(".jpeg")) {
    mime = "image/jpeg";
  } else if (template.imageUrl.endsWith(".webp")) {
    mime = "image/webp";
  } else if (template.imageUrl.endsWith(".svg")) {
    mime = "image/svg+xml";
  }

  if (template.imageUrl.startsWith("data:")) {
    const matches = template.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 Data URL format for template image");
    mime = matches[1];
    baseImageBuffer = Buffer.from(matches[2], "base64");
  } else if (template.imageUrl.startsWith("http")) {
    const res = await fetch(template.imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch template image: ${res.statusText}`);
    baseImageBuffer = Buffer.from(await res.arrayBuffer());
  } else {
    const fs = await import("fs");
    const path = await import("path");
    const relativePath = template.imageUrl.startsWith("/") ? template.imageUrl.slice(1) : template.imageUrl;
    const localPath = path.join(process.cwd(), "public", relativePath);
    try {
      baseImageBuffer = fs.readFileSync(localPath);
    } catch (fsError: any) {
      throw new Error(`Failed to read template image from local path "${localPath}": ${fsError.message}`);
    }
  }

  imageSrc = `data:${mime};base64,${baseImageBuffer.toString("base64")}`;

  const metadata = await sharp(baseImageBuffer).metadata();
  const width = 2048;
  const baseHeight = Math.round((metadata.height! * width) / metadata.width!);
  
  const N = rows.length;
  const rowHeight = 60;
  const totalProfitHeight = isLast ? 80 : 0;
  const finalHeight = baseHeight + (N * rowHeight) + totalProfitHeight;

  let totalProfit = 0;
  rows.forEach(r => { totalProfit += parseInt(r.profit) || 0; });

  const fields = template.fields as any || {};
  const tableConfig = fields.tableConfig || {};
  const marginLeft = tableConfig.marginLeft !== undefined ? Number(tableConfig.marginLeft) : 38;
  const tableWidth = tableConfig.width !== undefined ? Number(tableConfig.width) : 1972;
  const colWidths = tableConfig.colWidths || [350, 322, 314, 316, 330, 340];
  const borderColor = tableConfig.borderColor || "#e05307";
  const innerBorderColor = tableConfig.innerBorderColor || "#d3d3d3";

  const ogRes = new ImageResponse(
    (
      <div style={{ display: 'flex', width: 2048, height: finalHeight, backgroundColor: '#fff', position: 'relative' }}>
        <img src={imageSrc} width={2048} height={baseHeight} style={{ position: 'absolute', top: 0, left: 0 }} />
        
        {/* Header fields */}
        {Object.entries(template.fields || {}).map(([key, field]: [string, any]) => {
          if (field.y >= 416 || key === "tableConfig") return null;
          
          // For history charts (where table rows are present), do NOT render single-round prediction overlay fields
          // unless they are explicitly customized in headerValues.
          const isSingleRoundField = ["period", "prediction", "bigSmall", "confidence"].includes(key);
          if (isSingleRoundField && (headerValues[key] === undefined || headerValues[key] === "")) {
            return null;
          }

          const value = headerValues[key] !== undefined && headerValues[key] !== "" ? headerValues[key] : (field.text || "");
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: (field.x * 2) - 1000,
                top: (field.y * 2) - 100,
                width: 2000,
                height: 200,
                display: "flex",
                justifyContent: field.align === "left" ? "flex-start" : field.align === "right" ? "flex-end" : "center",
                alignItems: "center",
                fontSize: (field.fontSize || 24) * 2,
                color: field.color || "#ffffff",
                fontWeight: field.fontWeight === "bold" ? 700 : 400,
                fontStyle: field.fontStyle || "normal",
                letterSpacing: (field.letterSpacing || 0) * 2,
                opacity: field.opacity !== undefined ? field.opacity : 1,
              }}
            >
              {value}
            </div>
          );
        })}

        {/* Table Rows */}
        <div style={{ position: 'absolute', top: baseHeight, left: 0, width: 2048, display: 'flex', flexDirection: 'column' }}>
          
          {/* Dynamic Native Header Row (guarantees perfect alignment) */}
          {template.imageUrl.includes("luvo_base_cropped") && (
            <div style={{ display: 'flex', width: tableWidth, height: 80, marginLeft: marginLeft, backgroundColor: '#ffffff', borderTop: `2px solid ${borderColor}`, borderLeft: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}` }}>
              {["PERIOD", "PROJECT", "COLOUR", "AMOUNT", "RESULT", "PROFIT"].map((title, idx) => (
                <div key={idx} style={{ display: 'flex', width: colWidths[idx], borderRight: idx < 5 ? `2px solid ${borderColor}` : 'none', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: borderColor }}>
                  {title}
                </div>
              ))}
            </div>
          )}

          {/* Explicit Top Border Line for the Table (for non-native headers to close the box) */}
          {!template.imageUrl.includes("luvo_base_cropped") && (
            <div style={{ display: 'flex', width: tableWidth, height: 2, backgroundColor: borderColor, marginLeft: marginLeft }} />
          )}
          
          {rows.map((r, i) => {
            const bgFill = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
            const colVal = (r.colour || "").toLowerCase();
            let colourBg = "";
            if (colVal === "red") colourBg = "#e50914";
            else if (colVal === "green") colourBg = "#0f9d58";
            else if (colVal === "violet") colourBg = "#673ab7";

            const resVal = (r.result || "").toUpperCase();
            let resultText = "";
            let resultColor = "#222222";
            if (resVal === "WON") { resultText = "WON"; resultColor = "#0f9d58"; }
            else if (resVal === "LOSS") { resultText = "LOSS"; resultColor = "#ef4444"; }
            else if (resVal === "PENDING") { resultText = "PENDING"; resultColor = "#e67e22"; }

            const profitVal = parseInt(r.profit) || 0;
            const profitColor = profitVal >= 0 ? "#0f9d58" : "#ef4444";
            const isNull = resVal === "NULL";
            const isPending = resVal === "PENDING";
            let profitText = "";
            if (!isNull && !isPending && r.profit) {
              profitText = `${profitVal >= 0 ? "+" : ""}${r.profit}`;
            }

            const bottomLineColor = (i === N - 1 && !isLast) ? borderColor : innerBorderColor;

            return (
              <div key={i} style={{ display: 'flex', width: tableWidth, height: 60, marginLeft: marginLeft, backgroundColor: bgFill, borderLeft: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderBottom: `2px solid ${bottomLineColor}` }}>
                <div style={{ display: 'flex', width: colWidths[0], borderRight: `2px solid ${innerBorderColor}`, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{formatPeriodId(r.period)}</div>
                <div style={{ display: 'flex', width: colWidths[1], borderRight: `2px solid ${innerBorderColor}`, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{r.project}</div>
                <div style={{ display: 'flex', width: colWidths[2], borderRight: `2px solid ${innerBorderColor}`, backgroundColor: colourBg, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: colourBg ? '#ffffff' : '#222222' }}>{r.colour}</div>
                <div style={{ display: 'flex', width: colWidths[3], borderRight: `2px solid ${innerBorderColor}`, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{r.amount}</div>
                <div style={{ display: 'flex', width: colWidths[4], borderRight: `2px solid ${innerBorderColor}`, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: resultColor }}>{resultText}</div>
                <div style={{ display: 'flex', width: colWidths[5], alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: profitColor }}>{profitText}</div>
              </div>
            );
          })}
          
          {isLast && (
            <div style={{ display: 'flex', width: tableWidth, height: 80, marginLeft: marginLeft, backgroundColor: '#ffffff', borderLeft: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, alignItems: 'center', justifyItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 35 }}>
              <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#222222', marginRight: 15 }}>Total Profit = </div>
              <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: totalProfit >= 0 ? '#0f9d58' : '#ef4444' }}>₹{totalProfit}</div>
            </div>
          )}
        </div>
      </div>
    ),
    { width, height: finalHeight }
  );

  return Buffer.from(await ogRes.arrayBuffer());
}
