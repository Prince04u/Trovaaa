const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 300; // Inside the top card

  // The card has a white background and an orange border.
  // Let's scan from left to right. The background of the image is light gray/white,
  // but let's see where we find the orange border of the card.
  // The orange border has high R, low B.
  let borderX = [];
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Check for orange border color (R > 200, G in [50, 150], B < 100)
    if (r > 200 && g > 50 && g < 150 && b < 100) {
      borderX.push(x);
    }
  }

  console.log("Orange border pixels found at X coordinates:", borderX);
}

main().catch(console.error);
