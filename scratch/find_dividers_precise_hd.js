const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  // Orange header is at Y = 391 to 415. Let's scan at Y = 396 (inside the header).
  const y = 396;

  console.log("X | R | G | B (scanning horizontal line at Y = 396 for white separator lines)");
  console.log("-----------------------------------------------------------------------------");
  
  // Dividers are white, so R, G, B should all be very high (> 240)
  for (let x = 16; x < 1005; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Check for white/light color pixels inside the orange bar
    if (r > 230 && g > 230 && b > 230) {
      console.log(`X: ${x} | Color: ${r}, ${g}, ${b}`);
    }
  }
}

main().catch(console.error);
