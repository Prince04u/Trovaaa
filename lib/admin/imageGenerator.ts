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
  
  // Scale the base image template buffer to 2x (2048 width) dynamically using high-quality Lanczos3 interpolation!
  const baseImageResized = await sharp(baseImageBuffer)
    .resize({ width: 2048, height: 832, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const width = 2048;
  const baseHeight = 832;

  const N = rows.length;
  const rowHeight = 60; // 30 * 2
  const totalProfitHeight = isLast ? 80 : 0; // 40 * 2
  const finalHeight = baseHeight + N * rowHeight + totalProfitHeight;

  // Compute total profit
  let totalProfit = 0;
  rows.forEach((r) => {
    totalProfit += parseInt(r.profit) || 0;
  });

  // 1. Build SVG for Header Text Fields (if any exist, scaled to 2x)
  let svgHeaderTexts = "";
  const fields = template.fields || {};
  for (const [key, field] of Object.entries(fields) as [string, any][]) {
    // If Y is in table area (original Y >= 416), skip
    if (field.y >= 416) continue;

    const value = headerValues[key] !== undefined && headerValues[key] !== "" ? headerValues[key]! : (field.text || "");
    const x = field.x * 2;
    const y = field.y * 2;
    const size = (field.fontSize || 24) * 2;
    const font = field.fontFamily || "Arial";
    const color = field.color || "#ffffff";
    const weight = field.fontWeight || "normal";
    const style = field.fontStyle || "normal";
    const align = field.align || "center";
    const rotation = field.rotation || 0;
    const opacity = field.opacity !== undefined ? field.opacity : 1;
    const letterSpacing = (field.letterSpacing || 0) * 2;

    let textAnchor = "middle";
    if (align === "left") textAnchor = "start";
    else if (align === "right") textAnchor = "end";

    let shadowStyle = "";
    if (field.shadowColor) {
      const ox = (field.shadowOffsetX !== undefined ? field.shadowOffsetX : 2) * 2;
      const oy = (field.shadowOffsetY !== undefined ? field.shadowOffsetY : 2) * 2;
      const blur = (field.shadowBlur !== undefined ? field.shadowBlur : 4) * 2;
      shadowStyle = `text-shadow: ${ox}px ${oy}px ${blur}px ${field.shadowColor};`;
    }

    svgHeaderTexts += `
      <text
        x="${x}"
        y="${y}"
        font-family="${font}, Arial, sans-serif"
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

  // 2. Build SVG for Table Rows (coordinates scaled to 2x)
  let svgTableContent = "";
  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const rowY = baseHeight + i * rowHeight;
    const textY = rowY + 40; // baseline at rowY + 40 centers 28px text inside 60px row
    const bgFill = (i % 2 === 0) ? "#ffffff" : "#f9f9f9";

    // Row background rectangle
    svgTableContent += `<rect x="38" y="${rowY}" width="1972" height="60" fill="${bgFill}" />`;

    // Colour cell background
    let colourBg = "";
    const colVal = (r.colour || "").toLowerCase();
    if (colVal === "red") colourBg = "#e50914";
    else if (colVal === "green") colourBg = "#0f9d58";
    else if (colVal === "violet") colourBg = "#673ab7";

    if (colourBg) {
      // Colour column is from X=710 to X=1024 (width 314, cell padding = 2px)
      svgTableContent += `<rect x="712" y="${rowY + 2}" width="310" height="56" fill="${colourBg}" />`;
    }

    // Grid lines (X coordinates scaled to 2x: left = 38, right = 2010, dividers = 388, 710, 1024, 1340, 1670)
    svgTableContent += `
      <!-- Left and right orange borders -->
      <line x1="38" y1="${rowY}" x2="38" y2="${rowY + 60}" stroke="#e05307" stroke-width="2" />
      <line x1="2010" y1="${rowY}" x2="2010" y2="${rowY + 60}" stroke="#e05307" stroke-width="2" />
      
      <!-- Inner column separators -->
      <line x1="388" y1="${rowY}" x2="388" y2="${rowY + 60}" stroke="#d3d3d3" stroke-width="2" />
      <line x1="710" y1="${rowY}" x2="710" y2="${rowY + 60}" stroke="#d3d3d3" stroke-width="2" />
      <line x1="1024" y1="${rowY}" x2="1024" y2="${rowY + 60}" stroke="#d3d3d3" stroke-width="2" />
      <line x1="1340" y1="${rowY}" x2="1340" y2="${rowY + 60}" stroke="#d3d3d3" stroke-width="2" />
      <line x1="1670" y1="${rowY}" x2="1670" y2="${rowY + 60}" stroke="#d3d3d3" stroke-width="2" />
    `;

    // Bottom horizontal grid line
    const bottomLineColor = (i === N - 1 && !isLast) ? "#e05307" : "#d3d3d3";
    svgTableContent += `<line x1="38" y1="${rowY + 60}" x2="2010" y2="${rowY + 60}" stroke="${bottomLineColor}" stroke-width="2" />`;

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

    // Centered coordinates for texts (scaled to 2x):
    // Period: 213, Project: 549, Colour: 867, Amount: 1182, Result: 1505, Profit: 1840
    svgTableContent += `
      <text x="213" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.period)}</text>
      <text x="549" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.project)}</text>
      <text x="867" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="#ffffff" font-weight="bold" text-anchor="middle">${escapeHtml(r.colour)}</text>
      <text x="1182" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="#222222" font-weight="bold" text-anchor="middle">${escapeHtml(r.amount)}</text>
      <text x="1505" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="${resultColor}" font-weight="bold" text-anchor="middle">${escapeHtml(resultText)}</text>
      <text x="1840" y="${textY}" font-family="Arial, sans-serif" font-size="28px" fill="${profitColor}" font-weight="bold" text-anchor="middle">${escapeHtml(profitText)}</text>
    `;
  }

  // 3. Draw Total Profit Row (scaled to 2x)
  if (isLast) {
    const totalY = baseHeight + N * rowHeight;
    const textY = totalY + 52; // baseline for 36px/44px text inside 80px row

    svgTableContent += `
      <rect x="38" y="${totalY}" width="1972" height="80" fill="#ffffff" />
      <line x1="38" y1="${totalY}" x2="38" y2="${totalY + 80}" stroke="#e05307" stroke-width="2" />
      <line x1="2010" y1="${totalY}" x2="2010" y2="${totalY + 80}" stroke="#e05307" stroke-width="2" />
      <line x1="38" y1="${totalY + 80}" x2="2010" y2="${totalY + 80}" stroke="#e05307" stroke-width="2" />

      <text x="1640" y="${textY}" font-family="Arial, sans-serif" font-size="36px" font-weight="bold" fill="#222222" text-anchor="end">Total Profit = </text>
      <text x="1665" y="${textY}" font-family="Arial, sans-serif" font-size="44px" font-weight="bold" fill="${totalProfit >= 0 ? "#0f9d58" : "#ef4444"}" text-anchor="start">₹${totalProfit}</text>
    `;
  }

  // Compile final SVG with high fidelity rendering hints
  const svgString = `
    <svg width="${width}" height="${finalHeight}" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg">
      ${svgHeaderTexts}
      ${svgTableContent}
    </svg>
  `;

  // Composite 2x scaled base template with 2x SVG layout
  return sharp({
    create: {
      width: width,
      height: finalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([
      { input: baseImageResized, top: 0, left: 0 },
      { input: Buffer.from(svgString), top: 0, left: 0 }
    ])
    .png({
      quality: 100,
      compressionLevel: 3,
      palette: false
    })
    .toBuffer();
}
