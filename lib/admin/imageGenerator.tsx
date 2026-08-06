import sharp from "sharp";
import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import React from "react";

function escapeHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getImageBuffer(urlOrPath: string, origin: string): Promise<Buffer> {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const res = await fetch(urlOrPath);
    if (!res.ok) throw new Error(`Failed to fetch remote image: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  } else {
    const fullUrl = new URL(urlOrPath, origin).toString();
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Failed to fetch local image via URL: ${fullUrl}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

export interface TableRow {
  period: string;
  project: string;
  colour: string;
  amount: string;
  result: string;
  profit: string;
}

export async function generatePredictionImage(
  template: { imageUrl: string; fields: any },
  headerValues: Record<string, string>,
  rows: TableRow[],
  isLast: boolean,
  origin: string
): Promise<Buffer> {
  const baseImageBuffer = await getImageBuffer(template.imageUrl, origin);
  
  const metadata = await sharp(baseImageBuffer).metadata();
  const width = 2048;
  const baseHeight = Math.round((metadata.height! * width) / metadata.width!);

  // Scale the base image template buffer dynamically using high-quality Lanczos3 interpolation!
  const baseImageResized = await sharp(baseImageBuffer)
    .resize({ width, height: baseHeight, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const N = rows.length;
  const rowHeight = 60; // 30 * 2
  const totalProfitHeight = isLast ? 80 : 0; // 40 * 2
  const finalHeight = baseHeight + N * rowHeight + totalProfitHeight;

  // Compute total profit
  let totalProfit = 0;
  rows.forEach((r) => {
    totalProfit += parseInt(r.profit) || 0;
  });

  const fields = template.fields || {};
  
  const headerElements = Object.entries(fields).map(([key, field]: [string, any]) => {
    // If Y is in table area (original Y >= 416), skip
    if (field.y >= 416) return null;

    const value = headerValues[key] !== undefined && headerValues[key] !== "" ? headerValues[key]! : (field.text || "");
    return (
      <div key={key} style={{
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
      }}>
        {value}
      </div>
    );
  });

  const rowElements = rows.map((r, i) => {
    const rowY = baseHeight + i * rowHeight;
    const bgFill = (i % 2 === 0) ? "#ffffff" : "#f9f9f9";
    
    const colVal = (r.colour || "").toLowerCase();
    let colourBg = "";
    if (colVal === "red") colourBg = "#e50914";
    else if (colVal === "green") colourBg = "#0f9d58";
    else if (colVal === "violet") colourBg = "#673ab7";

    const resVal = (r.result || "").toUpperCase();
    const isNull = resVal === "NULL";
    const isPending = resVal === "PENDING";
    let resultText = "";
    let resultColor = "#222222";
    if (resVal === "WON") { resultText = "WON"; resultColor = "#0f9d58"; }
    else if (resVal === "LOSS") { resultText = "LOSS"; resultColor = "#ef4444"; }
    else if (resVal === "PENDING") { resultText = "PENDING"; resultColor = "#e67e22"; }

    const profitVal = parseInt(r.profit) || 0;
    const profitColor = profitVal >= 0 ? "#0f9d58" : "#ef4444";
    let profitText = "";
    if (!isNull && !isPending && r.profit) {
      profitText = `${profitVal >= 0 ? "+" : ""}${r.profit}`;
    }
    
    const bottomLineColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";

    return (
      <div key={`row-${i}`} style={{
        position: "absolute", top: rowY, left: 38, width: 1972, height: 60, display: "flex", backgroundColor: bgFill,
        borderLeft: "2px solid #e05307", borderRight: "2px solid #e05307", borderBottom: `2px solid ${bottomLineColor}`
      }}>
        <div style={{ display: "flex", width: 350, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222" }}>{r.period}</div>
        <div style={{ display: "flex", width: 322, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222" }}>{r.project}</div>
        <div style={{ display: "flex", width: 314, borderRight: "2px solid #d3d3d3", backgroundColor: colourBg, alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#ffffff" }}>{r.colour}</div>
        <div style={{ display: "flex", width: 316, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222" }}>{r.amount}</div>
        <div style={{ display: "flex", width: 330, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: resultColor }}>{resultText}</div>
        <div style={{ display: "flex", width: 340, alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: profitColor }}>{profitText}</div>
      </div>
    );
  });

  const totalRow = isLast ? (
    <div style={{
      position: "absolute", top: baseHeight + N * rowHeight, left: 38, width: 1972, height: 80, display: "flex", backgroundColor: "#ffffff",
      borderLeft: "2px solid #e05307", borderRight: "2px solid #e05307", borderBottom: "2px solid #e05307",
      alignItems: "center", justifyContent: "flex-end", paddingRight: 35
    }}>
      <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#222222", marginRight: 15 }}>Total Profit = </div>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: totalProfit >= 0 ? "#0f9d58" : "#ef4444" }}>₹{totalProfit}</div>
    </div>
  ) : null;

  // Render the overlay using ImageResponse to ensure perfect font rendering and SVG layout on Vercel
  const overlayRes = new ImageResponse(
    (
      <div style={{ display: "flex", width, height: finalHeight, position: "relative" }}>
        {headerElements}
        {rowElements}
        {totalRow}
      </div>
    ),
    { width, height: finalHeight }
  );

  const overlayBuffer = Buffer.from(await overlayRes.arrayBuffer());

  // Composite the overlay onto the resized base template
  return sharp({
    create: { width, height: finalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } }
  })
    .composite([
      { input: baseImageResized, top: 0, left: 0 },
      { input: overlayBuffer, top: 0, left: 0 }
    ])
    .png({ quality: 100, compressionLevel: 3, palette: false })
    .toBuffer();
}
