const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full.png");
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  
  // Let's analyze X coordinates of divider lines.
  // The table goes from Y=404 to Y=504.
  // Let's check X coordinates from 100 to 950.
  // A divider line is a vertical line of color around #d3d3d3 (R, G, B ~ 190-210) that is solid.
  console.log("Scanning for precise grid line X-coordinates:");
  for (let x = 100; x < 950; x++) {
    let grayPixels = 0;
    let totalPixels = 0;
    for (let y = 405; y < 500; y += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      totalPixels++;
      // Check if pixel is gray
      if (r > 180 && r < 225 && Math.abs(r - g) < 5 && Math.abs(g - b) < 5) {
        grayPixels++;
      }
    }
    
    // If most pixels at this X coordinate are gray, this is a vertical grid line!
    if (grayPixels > totalPixels * 0.8) {
      console.log(`X: ${x} (Gray pixels: ${grayPixels}/${totalPixels})`);
    }
  }
}

main().catch(console.error);
