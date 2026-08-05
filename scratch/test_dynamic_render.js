const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  const baseImagePath = path.join(__dirname, "../public/design/prediction_template_base.png");
  const baseImageBuffer = fs.readFileSync(baseImagePath);
  
  const rows = [
    { period: "20220216431", project: "emerd", colour: "Red", amount: "100", result: "WON", profit: "100" },
    { period: "20220216432", project: "emerd", colour: "Red", amount: "100", result: "LOSS", profit: "-100" },
    { period: "20220216433", project: "saphire", colour: "Green", amount: "200", result: "WON", profit: "200" },
    { period: "20220216434", project: "saphire", colour: "Violet", amount: "300", result: "WON", profit: "600" },
  ];

  const isLast = true;
  const N = rows.length;
  const rowHeight = 30;
  const baseHeight = 404;
  const totalProfitHeight = isLast ? 40 : 0;
  const finalHeight = baseHeight + N * rowHeight + totalProfitHeight;

  // Let's compute total profit
  let totalProfit = 0;
  rows.forEach((r) => {
    totalProfit += parseInt(r.profit) || 0;
  });

  // Build SVG overlay
  let svgContent = "";

  // Draw background and text for each row
  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const rowY = baseHeight + i * rowHeight;
    const textY = rowY + 20;
    const bgFill = (i % 2 === 0) ? "#ffffff" : "#f9f9f9";

    // Row background rectangle
    svgContent += `<rect x="15" y="${rowY}" width="994" height="30" fill="${bgFill}" />`;

    // Colour cell background
    let colourBg = "";
    const colVal = r.colour.toLowerCase();
    if (colVal === "red") colourBg = "#e50914";
    else if (colVal === "green") colourBg = "#0f9d58";
    else if (colVal === "violet") colourBg = "#673ab7";

    if (colourBg) {
      svgContent += `<rect x="354" y="${rowY + 1}" width="166" height="28" fill="${colourBg}" />`;
    }

    // Grid lines
    svgContent += `
      <!-- Left and right orange borders -->
      <line x1="15" y1="${rowY}" x2="15" y2="${rowY + 30}" stroke="#e05307" stroke-width="1" />
      <line x1="1009" y1="${rowY}" x2="1009" y2="${rowY + 30}" stroke="#e05307" stroke-width="1" />
      
      <!-- Inner column separators -->
      <line x1="186" y1="${rowY}" x2="186" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="353" y1="${rowY}" x2="353" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="520" y1="${rowY}" x2="520" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="687" y1="${rowY}" x2="687" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="854" y1="${rowY}" x2="854" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
    `;

    // Bottom horizontal grid line
    const bottomLineColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";
    svgContent += `<line x1="15" y1="${rowY + 30}" x2="1009" y2="${rowY + 30}" stroke="${bottomLineColor}" stroke-width="1" />`;

    // Cell Texts
    const profitVal = parseInt(r.profit) || 0;
    const profitColor = profitVal >= 0 ? "#0f9d58" : "#ef4444";
    const resultColor = r.result.toUpperCase() === "WON" ? "#0f9d58" : "#ef4444";

    svgContent += `
      <text x="100.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.period)}</text>
      <text x="269.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.project)}</text>
      <text x="436.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="#ffffff" font-weight="bold" text-anchor="middle">${escapeHtml(r.colour)}</text>
      <text x="603.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.amount)}</text>
      <text x="770.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="${resultColor}" font-weight="bold" text-anchor="middle">${escapeHtml(r.result)}</text>
      <text x="931.5" y="${textY}" font-family="Inter, sans-serif" font-size="14px" fill="${profitColor}" font-weight="bold" text-anchor="middle">${profitVal >= 0 ? "+" : ""}${r.profit}</text>
    `;
  }

  // Draw Total Profit Row
  if (isLast) {
    const totalY = baseHeight + N * rowHeight;
    const textY = totalY + 26;

    svgContent += `
      <!-- Background white rect -->
      <rect x="15" y="${totalY}" width="994" height="40" fill="#ffffff" />
      
      <!-- Left and right orange borders -->
      <line x1="15" y1="${totalY}" x2="15" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />
      <line x1="1009" y1="${totalY}" x2="1009" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />
      
      <!-- Bottom orange border -->
      <line x1="15" y1="${totalY + 40}" x2="1009" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />

      <!-- Total Profit Texts -->
      <text x="820" y="${textY}" font-family="Inter, sans-serif" font-size="18px" font-weight="bold" fill="#222222" text-anchor="end">Total Profit = </text>
      <text x="830" y="${textY}" font-family="Inter, sans-serif" font-size="22px" font-weight="bold" fill="${totalProfit >= 0 ? "#0f9d58" : "#ef4444"}" text-anchor="start">₹${totalProfit}</text>
    `;
  }

  const svgWrapper = `
    <svg width="1024" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap');
      </style>
      ${svgContent}
    </svg>
  `;

  // Create a blank image of width 1024 and finalHeight, then composite base template at the top and SVG on top of that!
  const canvas = sharp({
    create: {
      width: 1024,
      height: finalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  });

  const outputPath = path.join(__dirname, "../public/design/prediction_chart_test_output.png");
  await canvas
    .composite([
      { input: baseImageBuffer, top: 0, left: 0 },
      { input: Buffer.from(svgWrapper), top: 0, left: 0 }
    ])
    .png()
    .toFile(outputPath);

  console.log("Test render successful! File saved to:", outputPath);
}

main().catch(console.error);
