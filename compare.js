const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  // Scrape bruzoo
  await page.goto('https://bruzoo.games/#/login', { waitUntil: 'networkidle2' });
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
    const buttons = await page.$$('button');
    if (buttons.length > 0) await buttons[0].click();
    await new Promise(r => setTimeout(r, 4000));
  }
  await page.goto('https://bruzoo.games/#/mine', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'bruzoo_mine.png' });
  console.log('Saved bruzoo_mine.png');
  await browser.close();
})();
