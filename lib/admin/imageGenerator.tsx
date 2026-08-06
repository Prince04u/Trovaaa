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

export async function generatePredictionImage(
  template: { imageUrl: string; fields: any },
  headerValues: Record<string, string>,
  rows: TableRow[],
  isLast: boolean,
  origin: string
): Promise<Buffer> {
  // Construct absolute URL for the image
  let baseImageUrl = template.imageUrl;
  if (!baseImageUrl.startsWith("http")) {
    baseImageUrl = new URL(baseImageUrl, origin).toString();
  }
  
  // We need to fetch the image ourselves first to get its dimensions via sharp
  const res = await fetch(baseImageUrl);
  if (!res.ok) throw new Error("Failed to fetch template image");
  const baseImageBuffer = Buffer.from(await res.arrayBuffer());
  const metadata = await sharp(baseImageBuffer).metadata();
  const width = 2048;
  const baseHeight = Math.round((metadata.height! * width) / metadata.width!);
  
  const N = rows.length;
  const rowHeight = 60;
  const totalProfitHeight = isLast ? 80 : 0;
  const finalHeight = baseHeight + (N * rowHeight) + totalProfitHeight;

  let totalProfit = 0;
  rows.forEach(r => { totalProfit += parseInt(r.profit) || 0; });

  const ogRes = new ImageResponse(
    (
      <div style={{ display: 'flex', width: 2048, height: finalHeight, backgroundColor: '#fff', position: 'relative' }}>
        <img src={baseImageUrl} width={2048} height={baseHeight} style={{ position: 'absolute', top: 0, left: 0 }} />
        
        {/* Header fields */}
        {Object.entries(template.fields || {}).map(([key, field]: [string, any]) => {
          if (field.y >= 416) return null;
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

            const bottomLineColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";

            return (
              <div key={i} style={{ display: 'flex', width: 1972, height: 60, marginLeft: 38, backgroundColor: bgFill, borderLeft: '2px solid #e05307', borderRight: '2px solid #e05307', borderBottom: `2px solid ${bottomLineColor}` }}>
                <div style={{ display: 'flex', width: 350, borderRight: '2px solid #d3d3d3', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{r.period}</div>
                <div style={{ display: 'flex', width: 322, borderRight: '2px solid #d3d3d3', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{r.project}</div>
                <div style={{ display: 'flex', width: 314, borderRight: '2px solid #d3d3d3', backgroundColor: colourBg, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: colourBg ? '#ffffff' : '#222222' }}>{r.colour}</div>
                <div style={{ display: 'flex', width: 316, borderRight: '2px solid #d3d3d3', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#222222' }}>{r.amount}</div>
                <div style={{ display: 'flex', width: 330, borderRight: '2px solid #d3d3d3', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: resultColor }}>{resultText}</div>
                <div style={{ display: 'flex', width: 340, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: profitColor }}>{profitText}</div>
              </div>
            );
          })}
          
          {isLast && (
            <div style={{ display: 'flex', width: 1972, height: 80, marginLeft: 38, backgroundColor: '#ffffff', borderLeft: '2px solid #e05307', borderRight: '2px solid #e05307', borderBottom: '2px solid #e05307', alignItems: 'center', justifyItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 35 }}>
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
