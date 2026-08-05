const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  let firstOrangeY = -1;
  let lastOrangeY = -1;

  // Let's scan from top to bottom (y direction) for the orange table header.
  // The table header is a solid orange bar. We look for a row where many pixels are orange/reddish.
  for (let y = 0; y < height; y++) {
    let orangeCount = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Check if it's the table header orange color
      if (r > 200 && g > 50 && g < 120 && b < 40) {
        orangeCount++;
      }
    }

    // If more than 50% of the row is orange, it's part of the header!
    if (orangeCount > width * 0.5) {
      if (firstOrangeY === -1) {
        firstOrangeY = y;
      }
      lastOrangeY = y;
    }
  }

  console.log(`Orange table header start Y in HD image: ${firstOrangeY}`);
  console.log(`Orange table header end Y in HD image: ${lastOrangeY}`);
  console.log(`Total header height: ${lastOrangeY - firstOrangeY + 1}`);
}

main().catch(console.error);
