const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667 });

  console.log("Navigating to login...");
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle0' });

  console.log("Logging in...");
  const inputs = await page.$$('.van-field__control');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  }

  const buttons = await page.$$('.van-button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.toLowerCase().includes('log in') || text.toLowerCase().includes('login')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  
  // Scrape Recharge
  console.log("Navigating to recharge...");
  await page.goto('https://apex-king.com/#/recharge', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const rechargeHtml = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  fs.writeFileSync('recharge_dump.html', rechargeHtml);

  // Scrape Withdrawal
  console.log("Navigating to withdrawal...");
  await page.goto('https://apex-king.com/#/withdrawal', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const withdrawHtml = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  fs.writeFileSync('withdraw_dump.html', withdrawHtml);

  await browser.close();
  console.log("Scraping done!");
})();
