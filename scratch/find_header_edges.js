const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 390; // Inside the table header orange row

  let firstOrangeX = -1;
  let lastOrangeX = -1;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Orange color check
    if (r > 200 && g > 50 && g < 120 && b < 40) {
      if (firstOrangeX === -1) {
        firstOrangeX = x;
      }
      lastOrangeX = x;
    }
  }

  console.log(`Table Header left edge (first orange X): ${firstOrangeX}`);
  console.log(`Table Header right edge (last orange X): ${lastOrangeX}`);
  console.log(`Total width: ${lastOrangeX - firstOrangeX + 1}`);
}

main().catch(console.error);
