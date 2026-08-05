const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const startY = 380;
  const endY = 400;
  const height = endY - startY;

  console.log("Searching for vertical white divider lines in the orange header:");
  
  for (let x = 0; x < width; x++) {
    let isWhiteLine = true;
    for (let y = startY; y < endY; y++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Divider line is white/light
      if (r < 220 || g < 220 || b < 220) {
        isWhiteLine = false;
        break;
      }
    }

    if (isWhiteLine) {
      console.log(`X coordinate: ${x}`);
    }
  }
}

main().catch(console.error);
