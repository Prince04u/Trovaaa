const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  
  const fonts = await page.evaluate(() => {
    return {
      bodyFont: window.getComputedStyle(document.body).fontFamily,
      rootFont: window.getComputedStyle(document.documentElement).fontFamily,
    };
  });
  
  console.log(JSON.stringify(fonts, null, 2));
  await browser.close();
})();
