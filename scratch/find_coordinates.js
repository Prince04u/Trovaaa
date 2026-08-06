const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's scan from top to bottom (y direction) for the orange table header.
  // The table header is a solid orange bar. Let's look for a row where many pixels are orange/reddish.
  // In the image, orange color has high R (e.g. > 200), medium G (e.g. 50-100), low B (e.g. < 50).
  let tableHeaderY = -1;
  let tableHeaderHeight = 0;

  for (let y = 0; y < height; y++) {
    let orangeCount = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Check if it's the table header orange color
      // e.g. R in [200, 255], G in [50, 120], B in [0, 40]
      if (r > 200 && g > 60 && g < 120 && b < 40) {
        orangeCount++;
      }
    }

    // If more than 50% of the row width is orange, this is part of the table header!
    if (orangeCount > width * 0.5) {
      if (tableHeaderY === -1) {
        tableHeaderY = y;
      }
      tableHeaderHeight = y - tableHeaderY + 1;
    }
  }

  console.log("Detected orange table header start Y:", tableHeaderY, "Height:", tableHeaderHeight);
}

main().catch(console.error);
