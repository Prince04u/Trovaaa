const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
    const buttons = await page.$$('button');
    if (buttons.length > 0) await buttons[0].click();
    await new Promise(r => setTimeout(r, 4000));
  }
  
  await page.goto('https://apex-king.com/#/win', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => {
    // try to click My Record if it is a tab
    const tabs = Array.from(document.querySelectorAll('.van-tab'));
    for (let t of tabs) {
      if (t.innerText && t.innerText.includes('My Record')) t.click();
    }
    return document.body.innerHTML;
  });
  
  await new Promise(r => setTimeout(r, 1000));
  const finalHtml = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('win_my_record.html', finalHtml);
  console.log('Saved win_my_record.html');
  await browser.close();
})();
