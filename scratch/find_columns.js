const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 450; // Row 3
  
  console.log("X-coordinates of vertical grid lines:");
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Grid lines are gray (e.g. R, G, B in [180, 220], with low variance)
    if (r > 180 && r < 220 && Math.abs(r - g) < 5 && Math.abs(g - b) < 5) {
      console.log(`X: ${x} | Color: ${r}, ${g}, ${b}`);
    }
  }
}

main().catch(console.error);
