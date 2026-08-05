const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  
  // Let's crop at Y = 404 (which is approximately the bottom of the orange table header row)
  // Let's check the result.
  const croppedPath = path.join(__dirname, "../public/design/prediction_template_base.png");
  await sharp(imagePath)
    .extract({ left: 0, top: 0, width: 1024, height: 416 })
    .png()
    .toFile(croppedPath);

  console.log("Cropped image saved to:", croppedPath);
}

main().catch(console.error);
