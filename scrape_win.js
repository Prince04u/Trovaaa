const puppeteer = require('puppeteer');
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
  
  // Try to click the first record to expand it
  try {
    const records = await page.$$('.record-item, .record-list > div, [class*="record"]');
    for (let r of records) {
        const text = await page.evaluate(el => el.innerText, r);
        if (text && (text.includes('Fail') || text.includes('Success'))) {
            await r.click();
            break;
        }
    }
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'apex_win_record.png' });
  console.log('Saved apex_win_record.png');
  await browser.close();
})();
