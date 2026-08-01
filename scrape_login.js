const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  
  const html = await page.evaluate(() => document.body.innerHTML);
  require('fs').writeFileSync('login.html', html);
  
  console.log('Saved login html');
  await browser.close();
})();
