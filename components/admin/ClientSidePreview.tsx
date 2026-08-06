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
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#222]">
      <svg
        viewBox={`0 0 ${logicalWidth} ${logicalHeight}`}
        className="w-full h-full max-w-full max-h-full drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
        style={{ backgroundColor: "#ffffff" }}
      >
        <defs>
          <clipPath id="template-clip">
            <rect x="0" y="0" width={logicalWidth} height={baseHeight} />
          </clipPath>
        </defs>
        
        {/* Base Image */}
        <image
          href={template.imageUrl}
          x="0"
          y="0"
          width="100%"
          height={baseHeight}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#template-clip)"
        />

        {/* Header Elements */}
        {Object.entries(template.fields || {}).map(([key, field]: [string, any]) => {
          if (field.y >= 416) return null; // skip table-area fields
          const value = headerValues[key] !== undefined && headerValues[key] !== "" ? headerValues[key] : (field.text || "");
          if (!value) return null;
          
          const align = field.align || "center";
          let textAnchor = "middle";
          if (align === "left") textAnchor = "start";
          else if (align === "right") textAnchor = "end";

          return (
            <text
              key={key}
              x={(field.x || 0) * 2}
              y={(field.y || 0) * 2}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={(field.fontSize || 24) * 2}
              fontWeight={field.fontWeight === "bold" ? "bold" : "normal"}
              fill={field.color || "#ffffff"}
              textAnchor={textAnchor}
              dominantBaseline="central"
              opacity={field.opacity !== undefined ? field.opacity : 1}
              letterSpacing={(field.letterSpacing || 0) * 2}
            >
              {value}
            </text>
          );
        })}

        {/* Table Rows */}
        <g transform={`translate(0, ${baseHeight})`}>
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
              <g key={`row-${i}`}>
                {/* Row Background */}
                <rect x="38" y={rowY} width="1972" height={rowHeight} fill={bgFill} />
                
                {/* Colour Column Background */}
                {colourBg && (
                  <rect x={38 + 350 + 322} y={rowY} width="314" height={rowHeight} fill={colourBg} />
                )}

                {/* Borders */}
                <line x1="38" y1={rowY + rowHeight} x2="2010" y2={rowY + rowHeight} stroke={bottomLineColor} strokeWidth="2" />
                <line x1="38" y1={rowY} x2="38" y2={rowY + rowHeight} stroke="#e05307" strokeWidth="2" />
                <line x1="2010" y1={rowY} x2="2010" y2={rowY + rowHeight} stroke="#e05307" strokeWidth="2" />
                
                {/* Column Dividers */}
                <line x1={38 + 350} y1={rowY} x2={38 + 350} y2={rowY + rowHeight} stroke="#d3d3d3" strokeWidth="2" />
                <line x1={38 + 350 + 322} y1={rowY} x2={38 + 350 + 322} y2={rowY + rowHeight} stroke="#d3d3d3" strokeWidth="2" />
                <line x1={38 + 350 + 322 + 314} y1={rowY} x2={38 + 350 + 322 + 314} y2={rowY + rowHeight} stroke="#d3d3d3" strokeWidth="2" />
                <line x1={38 + 350 + 322 + 314 + 316} y1={rowY} x2={38 + 350 + 322 + 314 + 316} y2={rowY + rowHeight} stroke="#d3d3d3" strokeWidth="2" />
                <line x1={38 + 350 + 322 + 314 + 316 + 330} y1={rowY} x2={38 + 350 + 322 + 314 + 316 + 330} y2={rowY + rowHeight} stroke="#d3d3d3" strokeWidth="2" />

                {/* Text Elements */}
                <text x={38 + 175} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#222222" textAnchor="middle" dominantBaseline="central">{r.period}</text>
                <text x={38 + 350 + 161} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#222222" textAnchor="middle" dominantBaseline="central">{r.project}</text>
                <text x={38 + 350 + 322 + 157} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill={colourBg ? "#ffffff" : "#222222"} textAnchor="middle" dominantBaseline="central">{r.colour}</text>
                <text x={38 + 350 + 322 + 314 + 158} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#222222" textAnchor="middle" dominantBaseline="central">{r.amount}</text>
                <text x={38 + 350 + 322 + 314 + 316 + 165} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill={resultColor} textAnchor="middle" dominantBaseline="central">{resultText}</text>
                <text x={38 + 350 + 322 + 314 + 316 + 330 + 170} y={rowY + 30} fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill={profitColor} textAnchor="middle" dominantBaseline="central">{profitText}</text>
              </g>
            );
          })}

          {/* Total Row */}
          {isLastPrediction && (
            <g transform={`translate(0, ${N * rowHeight})`}>
              <rect x="38" y="0" width="1972" height="80" fill="#ffffff" />
              <rect x="38" y="0" width="1972" height="80" fill="none" stroke="#e05307" strokeWidth="2" />
              
              <text x="1900" y="40" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#222222" textAnchor="end" dominantBaseline="central">Total Profit = </text>
              <text x="1980" y="40" fontFamily="Arial, sans-serif" fontSize="44" fontWeight="bold" fill={totalProfit >= 0 ? "#0f9d58" : "#ef4444"} textAnchor="end" dominantBaseline="central">₹{totalProfit}</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
