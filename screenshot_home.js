const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  
  await page.screenshot({ path: 'home_screenshot.png', fullPage: true });
  console.log('Saved home_screenshot.png');
  
  const layout = await page.evaluate(() => {
    // Extract everything inside the main body
    return document.body.innerHTML;
  });
  
  fs.writeFileSync('home_layout.html', layout);
  
  await browser.close();
})();
