const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's scan from Y = 410 to Y = 500 (the table rows)
  // A vertical grid line will have the same X coordinate with gray color in multiple rows.
  // Let's count how many pixels are gray for each X coordinate.
  console.log("Analyzing vertical grid lines:");
  
  for (let x = 0; x < width; x++) {
    let grayCount = 0;
    let totalScan = 0;
    for (let y = 410; y < 500; y++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      totalScan++;
      // Check if it's gray (R, G, B are similar and not pure white or pure black)
      if (r > 170 && r < 230 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8) {
        grayCount++;
      }
    }

    // If more than 60% of the scanned vertical line is gray, this is a vertical grid line!
    if (grayCount > totalScan * 0.6) {
      console.log(`X: ${x} | Gray count: ${grayCount}/${totalScan}`);
    }
  }
}

main().catch(console.error);
