const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  console.log("Navigating to login...");
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('input', { timeout: 10000 });
  const inputs = await page.$$('input');
  
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  }

  console.log("Clicking login...");
  const buttons = await page.$$('button');
  for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.toLowerCase().includes('login')) {
          await btn.click();
          break;
      }
  }

  console.log("Waiting for navigation to home...");
  await new Promise(r => setTimeout(r, 5000));
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Extracting image URLs...");
  const images = await page.evaluate(() => {
     const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src && src.startsWith('http'));
     const bgs = Array.from(document.querySelectorAll('*')).map(el => {
         const bg = window.getComputedStyle(el).backgroundImage;
         if (bg && bg !== 'none' && bg.includes('url')) {
             return bg.match(/url\("?(.+?)"?\)/)[1];
         }
         return null;
     }).filter(src => src && src.startsWith('http'));
     return { imgs, bgs };
  });
  
  fs.writeFileSync('images.json', JSON.stringify(images, null, 2));
  console.log("Saved images.json!");
  
  await browser.close();
})();
