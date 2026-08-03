const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 667 });

  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle0' });

  // Type login details
  const inputs = await page.$$('.van-field__control');
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  }

  // Find and click the login button
  const buttons = await page.$$('.van-button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.toLowerCase().includes('log in') || text.toLowerCase().includes('login')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(() => {
    const box = document.querySelector('.logo_box');
    const img = document.querySelector('.logo_box img');
    if (!box || !img) return "Not found";
    const boxStyle = window.getComputedStyle(box);
    const imgStyle = window.getComputedStyle(img);
    return {
      box: {
        width: boxStyle.width,
        height: boxStyle.height,
        display: boxStyle.display,
        alignItems: boxStyle.alignItems,
        justifyContent: boxStyle.justifyContent,
        margin: boxStyle.margin,
        padding: boxStyle.padding,
        position: boxStyle.position
      },
      img: {
        width: imgStyle.width,
        height: imgStyle.height,
        objectFit: imgStyle.objectFit,
        maxWidth: imgStyle.maxWidth,
        maxHeight: imgStyle.maxHeight
      }
    };
  });

  console.log(JSON.stringify(result, null, 2));

  await browser.close();
})();
