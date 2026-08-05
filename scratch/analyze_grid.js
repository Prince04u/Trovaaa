const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const y = 390; // Inside the orange table header
  
  console.log("X-coordinates of non-orange separator pixels in the header:");
  let count = 0;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // If it's white or light color instead of orange:
    // Orange has high R, low G, low B.
    // White separator will have high G and high B as well.
    if (r > 200 && g > 200 && b > 200) {
      console.log(`X: ${x} | Color: ${r}, ${g}, ${b}`);
      count++;
    }
  }
}

main().catch(console.error);
