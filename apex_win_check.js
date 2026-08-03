const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });

  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle0' });

  // Type login details
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  }

  // Click login
  const buttons = await page.$$('.van-button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.toLowerCase().includes('log in') || text.toLowerCase().includes('login')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  await page.goto('https://apex-king.com/#/win', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));

  // Get outerHTML of the header / wallet box
  const result = await page.evaluate(() => {
    // find buttons
    const btns = Array.from(document.querySelectorAll('.mine_info_btn button, .mine_info button'));
    let ret = "";
    btns.forEach(b => {
      ret += b.outerHTML + "\n";
      const style = window.getComputedStyle(b);
      ret += "backgroundColor: " + style.backgroundColor + ", color: " + style.color + ", fontSize: " + style.fontSize + ", borderRadius: " + style.borderRadius + ", width: " + style.width + ", height: " + style.height + ", boxShadow: " + style.boxShadow + ", padding: " + style.padding + ", margin: " + style.margin + "\n\n";
    });
    return ret || document.body.innerHTML.substring(0, 1000);
  });

  console.log(result);
  await browser.close();
})();
