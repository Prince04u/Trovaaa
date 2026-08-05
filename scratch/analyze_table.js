const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  
  // Scan X = 100 vertically from Y = 350 to Y = 575
  const x = 100;
  console.log("Y | R | G | B | A");
  console.log("------------------");
  for (let y = 350; y < 576; y += 2) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    console.log(`${y} | ${r} | ${g} | ${b} | ${a}`);
  }
}

main().catch(console.error);
