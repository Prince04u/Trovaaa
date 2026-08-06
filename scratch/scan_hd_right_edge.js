const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 396; // inside the orange header

  console.log("Scanning right boundary (X = 990 to 1020)...");
  for (let x = 990; x < 1020; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    console.log(`X: ${x} | RGB: ${r}, ${g}, ${b}`);
  }
}

main().catch(console.error);
