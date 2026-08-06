import sharp from "sharp";

function escapeXml(str: string): string {
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

  const baseImageResized = await sharp(baseImageBuffer)
    .resize({ width, height: baseHeight, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const N = rows.length;
  const rowHeight = 60;
  const totalProfitHeight = isLast ? 80 : 0;
  const finalHeight = baseHeight + N * rowHeight + totalProfitHeight;

  // Build header text SVG elements
  const fields = template.fields || {};
  let headerSvgParts = "";

  for (const [key, field] of Object.entries(fields) as [string, any][]) {
    if (field.y >= 416) continue; // skip table-area fields

    const value = (headerValues[key] !== undefined && headerValues[key] !== "")
      ? headerValues[key]!
      : (field.text || "");
    if (!value) continue;

    const x = (field.x || 0) * 2;
    const y = (field.y || 0) * 2;
    const fontSize = (field.fontSize || 24) * 2;
    const color = field.color || "#ffffff";
    const fontWeight = field.fontWeight || "normal";
    const opacity = field.opacity !== undefined ? field.opacity : 1;
    const letterSpacing = (field.letterSpacing || 0) * 2;
    const align = field.align || "center";
    let textAnchor = "middle";
    if (align === "left") textAnchor = "start";
    else if (align === "right") textAnchor = "end";

    headerSvgParts += `
      <text
        x="${x}" y="${y}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${color}"
        text-anchor="${textAnchor}"
        dominant-baseline="central"
        opacity="${opacity}"
        letter-spacing="${letterSpacing}"
      >${escapeXml(value)}</text>
    `;
  }

  // Build table rows SVG
  let tableRowsSvg = "";
  const colWidths = [350, 322, 314, 316, 330, 340]; // total = 1972
  const tableLeft = 38;

  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const rowY = baseHeight + i * rowHeight;
    const bgFill = i % 2 === 0 ? "#ffffff" : "#f9f9f9";

    // Row background
    tableRowsSvg += `<rect x="${tableLeft}" y="${rowY}" width="1972" height="${rowHeight}" fill="${bgFill}" />`;

    // Row borders
    const bottomColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";
    tableRowsSvg += `<line x1="${tableLeft}" y1="${rowY + rowHeight}" x2="${tableLeft + 1972}" y2="${rowY + rowHeight}" stroke="${bottomColor}" stroke-width="2" />`;
    tableRowsSvg += `<line x1="${tableLeft}" y1="${rowY}" x2="${tableLeft}" y2="${rowY + rowHeight}" stroke="#e05307" stroke-width="2" />`;
    tableRowsSvg += `<line x1="${tableLeft + 1972}" y1="${rowY}" x2="${tableLeft + 1972}" y2="${rowY + rowHeight}" stroke="#e05307" stroke-width="2" />`;

    // Column separators
    let cx = tableLeft;
    for (let c = 0; c < colWidths.length - 1; c++) {
      cx += colWidths[c];
      tableRowsSvg += `<line x1="${cx}" y1="${rowY}" x2="${cx}" y2="${rowY + rowHeight}" stroke="#d3d3d3" stroke-width="1" />`;
    }

    // Cell data
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

    // Colour column background
    if (colourBg) {
      const colourColX = tableLeft + colWidths[0] + colWidths[1];
      tableRowsSvg += `<rect x="${colourColX}" y="${rowY}" width="${colWidths[2]}" height="${rowHeight}" fill="${colourBg}" />`;
    }

    const cellData = [
      { text: r.period || "", color: "#222222" },
      { text: r.project || "", color: "#222222" },
      { text: r.colour || "", color: colourBg ? "#ffffff" : "#222222" },
      { text: r.amount || "", color: "#222222" },
      { text: resultText, color: resultColor },
      { text: profitText, color: profitColor },
    ];

    let cellX = tableLeft;
    for (let c = 0; c < cellData.length; c++) {
      const centerX = cellX + colWidths[c] / 2;
      const centerY = rowY + rowHeight / 2;
      tableRowsSvg += `
        <text
          x="${centerX}" y="${centerY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="28"
          font-weight="bold"
          fill="${cellData[c].color}"
          text-anchor="middle"
          dominant-baseline="central"
        >${escapeXml(cellData[c].text)}</text>
      `;
      cellX += colWidths[c];
    }
  }

  // Total profit row
  let totalRowSvg = "";
  if (isLast) {
    let totalProfit = 0;
    rows.forEach((r) => { totalProfit += parseInt(r.profit) || 0; });

    const totalY = baseHeight + N * rowHeight;
    totalRowSvg += `<rect x="${tableLeft}" y="${totalY}" width="1972" height="80" fill="#ffffff" />`;
    totalRowSvg += `<rect x="${tableLeft}" y="${totalY}" width="1972" height="80" fill="none" stroke="#e05307" stroke-width="2" />`;

    const totalColor = totalProfit >= 0 ? "#0f9d58" : "#ef4444";
    totalRowSvg += `
      <text
        x="${tableLeft + 1972 - 40}" y="${totalY + 40}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="40"
        font-weight="bold"
        fill="${totalColor}"
        text-anchor="end"
        dominant-baseline="central"
      >Total Profit = ₹${totalProfit}</text>
    `;
  }

  // Assemble the full SVG overlay
  const svgOverlay = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${finalHeight}">
      ${headerSvgParts}
      ${tableRowsSvg}
      ${totalRowSvg}
    </svg>
  `;

  const svgBuffer = Buffer.from(svgOverlay);

  // Composite base image + SVG overlay
  return sharp({
    create: {
      width,
      height: finalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: baseImageResized, top: 0, left: 0 },
      { input: svgBuffer, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}
