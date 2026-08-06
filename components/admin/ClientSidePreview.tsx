import React from "react";

export interface TableRow {
  period: string;
  project: string;
  colour: string;
  amount: string;
  result: string;
  profit: string;
}

interface ClientSidePreviewProps {
  template: { imageUrl: string; fields: any } | null;
  headerValues: Record<string, string>;
  rows: TableRow[];
  isLastPrediction: boolean;
}

export default function ClientSidePreview({
  template,
  headerValues,
  rows,
  isLastPrediction,
}: ClientSidePreviewProps) {
  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted">
        <p>No template selected.</p>
      </div>
    );
  }

  const N = rows.length;
  const rowHeight = 60;
  const totalProfitHeight = isLastPrediction ? 80 : 0;
  const baseHeight = 404; // Assuming approx 404 for standard template; ideally we'd load the image and calculate, but we can use CSS aspect ratio
  
  // Calculate total profit
  let totalProfit = 0;
  rows.forEach((r) => {
    totalProfit += parseInt(r.profit) || 0;
  });

  // Calculate scaling for CSS to fit into container
  // We use a fixed logical coordinate system matching our API (2048x?)
  // and scale it down with CSS container queries or simple CSS transform.
  const logicalWidth = 2048;
  const logicalHeight = baseHeight + (N * rowHeight) + totalProfitHeight;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#222]">
      {/* We use a container that scales its content to fit while preserving aspect ratio */}
      <div
        style={{
          width: logicalWidth,
          height: logicalHeight,
          transform: `scale(min(1, 100% / ${logicalWidth}))`, // This is just a fallback, we'll use a better scale approach via CSS
          transformOrigin: "center center",
          position: "relative",
          backgroundColor: "#fff",
        }}
        className="preview-scale-container"
      >
        {/* Base Image */}
        <img
          src={template.imageUrl}
          alt="Template Base"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: baseHeight,
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* Header Elements */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: baseHeight, zIndex: 2 }}>
          {Object.entries(template.fields || {}).map(([key, field]: [string, any]) => {
            if (field.y >= 416) return null; // skip table-area fields
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
                  fontFamily: "Arial, Helvetica, sans-serif"
                }}
              >
                {value}
              </div>
            );
          })}
        </div>

        {/* Table Rows */}
        <div style={{ position: "absolute", top: baseHeight, left: 0, width: "100%", zIndex: 2 }}>
          {rows.map((r, i) => {
            const rowY = i * rowHeight;
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

            const bottomLineColor = (i === N - 1 && !isLastPrediction) ? "#e05307" : "#d3d3d3";

            return (
              <div
                key={`row-${i}`}
                style={{
                  position: "absolute", top: rowY, left: 38, width: 1972, height: 60, display: "flex", backgroundColor: bgFill,
                  borderLeft: "2px solid #e05307", borderRight: "2px solid #e05307", borderBottom: `2px solid ${bottomLineColor}`,
                  boxSizing: "border-box"
                }}
              >
                <div style={{ display: "flex", width: 350, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222", fontFamily: "Arial, sans-serif" }}>{r.period}</div>
                <div style={{ display: "flex", width: 322, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222", fontFamily: "Arial, sans-serif" }}>{r.project}</div>
                <div style={{ display: "flex", width: 314, borderRight: "2px solid #d3d3d3", backgroundColor: colourBg, alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: colourBg ? "#ffffff" : "#222222", fontFamily: "Arial, sans-serif" }}>{r.colour}</div>
                <div style={{ display: "flex", width: 316, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#222222", fontFamily: "Arial, sans-serif" }}>{r.amount}</div>
                <div style={{ display: "flex", width: 330, borderRight: "2px solid #d3d3d3", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: resultColor, fontFamily: "Arial, sans-serif" }}>{resultText}</div>
                <div style={{ display: "flex", width: 340, alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: profitColor, fontFamily: "Arial, sans-serif" }}>{profitText}</div>
              </div>
            );
          })}

          {/* Total Row */}
          {isLastPrediction && (
            <div
              style={{
                position: "absolute", top: N * rowHeight, left: 38, width: 1972, height: 80, display: "flex", backgroundColor: "#ffffff",
                borderLeft: "2px solid #e05307", borderRight: "2px solid #e05307", borderBottom: "2px solid #e05307",
                alignItems: "center", justifyContent: "flex-end", paddingRight: 35, boxSizing: "border-box"
              }}
            >
              <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#222222", marginRight: 15, fontFamily: "Arial, sans-serif" }}>Total Profit = </div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: totalProfit >= 0 ? "#0f9d58" : "#ef4444", fontFamily: "Arial, sans-serif" }}>₹{totalProfit}</div>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .preview-scale-container {
          transform: scale(0.12);
        }
        @media (min-width: 1500px) {
           .preview-scale-container {
              transform: scale(0.15);
           }
        }
      `}} />
    </div>
  );
}
