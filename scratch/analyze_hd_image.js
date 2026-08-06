const sharp = require("sharp");
const path = require("path");

async function main() {
  const imagePath = path.join(__dirname, "../public/design/prediction_template_full_hd.png");
  const metadata = await sharp(imagePath).metadata();
  console.log("HD Image metadata:", metadata);
}

main().catch(console.error);
