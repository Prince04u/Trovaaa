const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  console.log("Y | Orange pixel count");
  console.log("----------------------");
  for (let y = 350; y < 576; y++) {
    let orangeCount = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Check for orange
      if (r > 200 && g > 50 && g < 120 && b < 40) {
        orangeCount++;
      }
    }
    if (orangeCount > 10) {
      console.log(`${y} | ${orangeCount}`);
    }
  }
}

main().catch(console.error);
