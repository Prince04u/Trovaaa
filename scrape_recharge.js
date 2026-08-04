const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667 });

  console.log("Navigating to login...");
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle0' });

  console.log("Typing credentials...");
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  }

  const buttons = await page.$$('.login_btn');
  if (buttons.length > 0) {
    await buttons[0].click();
  }

  console.log("Waiting for login to complete...");
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log("Timeout waiting for nav, continuing..."));
  await new Promise(r => setTimeout(r, 2000));

  console.log("Navigating to recharge...");
  await page.goto('https://apex-king.com/#/recharge', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  
  const rechargeData = await page.evaluate(() => {
    return {
      html: document.body.innerHTML,
      styles: Array.from(document.styleSheets).map(s => {
        try {
          return Array.from(s.cssRules).map(r => r.cssText).join('\n');
        } catch(e) { return ""; }
      }).join('\n')
    };
  });
  fs.writeFileSync('recharge_data.json', JSON.stringify(rechargeData));

  console.log("Navigating to withdrawal...");
  await page.goto('https://apex-king.com/#/withdrawal', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  
  const withdrawData = await page.evaluate(() => {
    return {
      html: document.body.innerHTML
    };
  });
  fs.writeFileSync('withdraw_data.json', JSON.stringify(withdrawData));

  await browser.close();
  console.log("Scraping done!");
})();
