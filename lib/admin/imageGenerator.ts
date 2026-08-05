import sharp from "sharp";
import fs from "fs";
import path from "path";

function escapeHtml(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getImageBuffer(urlOrPath: string): Promise<Buffer> {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const res = await fetch(urlOrPath);
    if (!res.ok) throw new Error(`Failed to fetch remote image: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  } else {
    const relativePath = urlOrPath.startsWith("/") ? urlOrPath.slice(1) : urlOrPath;
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Local file not found: ${absolutePath}`);
    }
    return fs.readFileSync(absolutePath);
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
  isLast: boolean
): Promise<Buffer> {
  const baseImageBuffer = await getImageBuffer(template.imageUrl);
  
  // Load base image metadata to get dimensions
  const baseMetadata = await sharp(baseImageBuffer).metadata();
  const width = baseMetadata.width || 1024;
  const baseHeight = baseMetadata.height || 404;

  const N = rows.length;
  const rowHeight = 30;
  const totalProfitHeight = isLast ? 40 : 0;
  const finalHeight = baseHeight + N * rowHeight + totalProfitHeight;

  // Compute total profit
  let totalProfit = 0;
  rows.forEach((r) => {
    totalProfit += parseInt(r.profit) || 0;
  });

  // 1. Build SVG for Header Text Fields (only fields with coordinates)
  let svgHeaderTexts = "";
  const fields = template.fields || {};
  for (const [key, field] of Object.entries(fields) as [string, any][]) {
    // If the field is in the table area (Y >= baseHeight), skip it
    if (field.y >= baseHeight) continue;

    const value = headerValues[key] !== undefined && headerValues[key] !== "" ? headerValues[key]! : (field.text || "");
    const x = field.x;
    const y = field.y;
    const size = field.fontSize || 24;
    const font = field.fontFamily || "Inter";
    const color = field.color || "#ffffff";
    const weight = field.fontWeight || "normal";
    const style = field.fontStyle || "normal";
    const align = field.align || "center";
    const rotation = field.rotation || 0;
    const opacity = field.opacity !== undefined ? field.opacity : 1;
    const letterSpacing = field.letterSpacing || 0;

    let textAnchor = "middle";
    if (align === "left") textAnchor = "start";
    else if (align === "right") textAnchor = "end";

    let shadowStyle = "";
    if (field.shadowColor) {
      const ox = field.shadowOffsetX !== undefined ? field.shadowOffsetX : 2;
      const oy = field.shadowOffsetY !== undefined ? field.shadowOffsetY : 2;
      const blur = field.shadowBlur !== undefined ? field.shadowBlur : 4;
      shadowStyle = `text-shadow: ${ox}px ${oy}px ${blur}px ${field.shadowColor};`;
    }

    svgHeaderTexts += `
      <text
        x="${x}"
        y="${y}"
        font-family="${font}, system-ui, -apple-system, sans-serif"
        font-size="${size}px"
        fill="${color}"
        font-weight="${weight}"
        font-style="${style}"
        text-anchor="${textAnchor}"
        opacity="${opacity}"
        letter-spacing="${letterSpacing}px"
        transform="rotate(${rotation}, ${x}, ${y})"
        style="${shadowStyle} dominant-baseline: alphabetic;"
      >${escapeHtml(value)}</text>
    `;
  }

  // 2. Build SVG for Table Rows
  let svgTableContent = "";
  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const rowY = baseHeight + i * rowHeight;
    const textY = rowY + 20;
    const bgFill = (i % 2 === 0) ? "#ffffff" : "#f9f9f9";

    // Row background rectangle (stretches from X=16 to X=1005, width = 989)
    svgTableContent += `<rect x="16" y="${rowY}" width="989" height="30" fill="${bgFill}" />`;

    // Colour cell background
    let colourBg = "";
    const colVal = (r.colour || "").toLowerCase();
    if (colVal === "red") colourBg = "#e50914";
    else if (colVal === "green") colourBg = "#0f9d58";
    else if (colVal === "violet") colourBg = "#673ab7";

    if (colourBg) {
      // Colour column is from X=363 to X=514 (width 151)
      svgTableContent += `<rect x="364" y="${rowY + 1}" width="149" height="28" fill="${colourBg}" />`;
    }

    // Grid lines
    svgTableContent += `
      <!-- Left and right orange borders -->
      <line x1="16" y1="${rowY}" x2="16" y2="${rowY + 30}" stroke="#e05307" stroke-width="1" />
      <line x1="1005" y1="${rowY}" x2="1005" y2="${rowY + 30}" stroke="#e05307" stroke-width="1" />
      
      <!-- Inner column separators -->
      <line x1="190" y1="${rowY}" x2="190" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="363" y1="${rowY}" x2="363" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="514" y1="${rowY}" x2="514" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="665" y1="${rowY}" x2="665" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
      <line x1="831" y1="${rowY}" x2="831" y2="${rowY + 30}" stroke="#d3d3d3" stroke-width="1" />
    `;

    // Bottom horizontal grid line
    const bottomLineColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";
    svgTableContent += `<line x1="16" y1="${rowY + 30}" x2="1005" y2="${rowY + 30}" stroke="${bottomLineColor}" stroke-width="1" />`;

    // Cell Texts
    const resVal = (r.result || "").toUpperCase();
    const isNull = resVal === "NULL";
    const isPending = resVal === "PENDING";

    const profitVal = parseInt(r.profit) || 0;
    const profitColor = profitVal >= 0 ? "#0f9d58" : "#ef4444";
    
    let resultText = "";
    let resultColor = "#222222";
    
    if (resVal === "WON") {
      resultText = "WON";
      resultColor = "#0f9d58";
    } else if (resVal === "LOSS") {
      resultText = "LOSS";
      resultColor = "#ef4444";
    } else if (resVal === "PENDING") {
      resultText = "PENDING";
      resultColor = "#e67e22";
    }

    let profitText = "";
    if (!isNull && !isPending && r.profit) {
      profitText = `${profitVal >= 0 ? "+" : ""}${r.profit}`;
    }

    // Centered coordinates for texts:
    // Period: 103, Project: 276.5, Colour: 438.5, Amount: 589.5, Result: 748, Profit: 918
    svgTableContent += `
      <text x="103" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.period)}</text>
      <text x="276.5" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.project)}</text>
      <text x="438.5" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="#ffffff" font-weight="bold" text-anchor="middle">${escapeHtml(r.colour)}</text>
      <text x="589.5" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.amount)}</text>
      <text x="748" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="${resultColor}" font-weight="bold" text-anchor="middle">${escapeHtml(resultText)}</text>
      <text x="918" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14px" fill="${profitColor}" font-weight="bold" text-anchor="middle">${escapeHtml(profitText)}</text>
    `;
  }

  // 3. Draw Total Profit Row
  if (isLast) {
    const totalY = baseHeight + N * rowHeight;
    const textY = totalY + 26;

    svgTableContent += `
      <rect x="16" y="${totalY}" width="989" height="40" fill="#ffffff" />
      <line x1="16" y1="${totalY}" x2="16" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />
      <line x1="1005" y1="${totalY}" x2="1005" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />
      <line x1="16" y1="${totalY + 40}" x2="1005" y2="${totalY + 40}" stroke="#e05307" stroke-width="1" />

      <text x="810" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18px" font-weight="bold" fill="#222222" text-anchor="end">Total Profit = </text>
      <text x="825" y="${textY}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22px" font-weight="bold" fill="${totalProfit >= 0 ? "#0f9d58" : "#ef4444"}" text-anchor="start">₹${totalProfit}</text>
    `;
  }

  // Compile final SVG with high fidelity rendering hints
  const svgString = `
    <svg width="${width}" height="${finalHeight}" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg">
      ${svgHeaderTexts}
      ${svgTableContent}
    </svg>
  `;

  // Composite base template at the top of the blank extended canvas
  return sharp({
    create: {
      width: width,
      height: finalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([
      { input: baseImageBuffer, top: 0, left: 0 },
      { input: Buffer.from(svgString), top: 0, left: 0 }
    ])
    .png({
      quality: 100,
      compressionLevel: 9,
      palette: false
    })
    .toBuffer();
}
