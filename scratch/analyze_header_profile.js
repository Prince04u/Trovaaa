const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 396; // inside the orange header

  console.log("Analyzing peaks of Green channel (> 130) inside the orange header...");
  for (let x = 16; x < 1005; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Orange background usually has G around 70-100.
    // Lighter lines will have higher G.
    if (g > 130) {
      console.log(`X: ${x} | RGB: ${r}, ${g}, ${b}`);
    }
  }
}

main().catch(console.error);
