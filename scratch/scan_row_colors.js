const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 420; // Row 1 white background

  console.log("X | R | G | B");
  console.log("--------------");
  // Let's print pixel colors where they are not white (i.e. R, G, B are less than 240)
  for (let x = 15; x < 1010; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    if (r < 235 || g < 235 || b < 235) {
      console.log(`${x} | ${r} | ${g} | ${b}`);
    }
  }
}

main().catch(console.error);
