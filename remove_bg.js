const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <img id="logo" src="data:image/png;base64,${fs.readFileSync('public/logo.png', 'base64')}" />
      <canvas id="canvas"></canvas>
    </body>
    </html>
  `);

  // Wait for the image to load fully before drawing it
  await page.evaluate(() => {
    return new Promise(resolve => {
      const img = document.getElementById('logo');
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
      }
    });
  });

  const dataUrl = await page.evaluate(() => {
    const img = document.getElementById('logo');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Threshold to remove black/near-black pixels
    const threshold = 25; 
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      if (r < threshold && g < threshold && b < threshold) {
        data[i+3] = 0; // Transparent
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  });

  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync('public/logo.png', base64Data, 'base64');

  await browser.close();
  console.log("Background removed!");
})();
