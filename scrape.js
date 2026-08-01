const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // iPhone 12 layout
  
  console.log("Navigating to login...");
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  
  console.log("Typing credentials...");
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

  console.log("Waiting 5s for login...");
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Navigating to win page...");
  await page.goto('https://apex-king.com/#/win', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Dumping HTML...");
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('scraped.html', html);

  console.log("Extracting computed styles...");
  const computed = await page.evaluate(() => {
     function getStyles(selector) {
         const el = document.querySelector(selector);
         if (!el) return null;
         const comp = window.getComputedStyle(el);
         return {
             fontSize: comp.fontSize,
             fontWeight: comp.fontWeight,
             color: comp.color,
             background: comp.background,
             padding: comp.padding,
             margin: comp.margin,
             width: comp.width,
             height: comp.height,
             borderRadius: comp.borderRadius,
             boxShadow: comp.boxShadow,
             display: comp.display,
             flexDirection: comp.flexDirection,
             alignItems: comp.alignItems,
             justifyContent: comp.justifyContent
         };
     }
     
     // Also get the outer HTML of some key elements to see the exact structure
     function getHTML(selector) {
        const el = document.querySelector(selector);
        return el ? el.outerHTML : null;
     }

     return {
         styles: {
             center_top: getStyles('.center_top'),
             periodTitleWrapper: getStyles('.center_top li:first-child .top_ol'),
             periodTitleText: getStyles('.center_top li:first-child .top_ol span'),
             periodIdWrapper: getStyles('.center_top li:first-child .bot_ol'),
             periodIdText: getStyles('.center_top li:first-child .bot_ol span'),
             countDownTitle: getStyles('.right_li .top_ol'),
             countDownWrapper: getStyles('.right_li .bot_ol .countdown'),
             countDownDigit: getStyles('.van-count-down .span'),
             countDownColon: getStyles('.van-count-down span:not(.span)'),
             tab: getStyles('.main_nav li'),
             joinBtn: getStyles('.btn_center button'),
             numBtn: getStyles('.center_notes li button'),
             historyTitle: getStyles('.content_title'),
             historyHead: getStyles('.list_head li')
         },
         html: {
             center_text: getHTML('.center_text'),
             main_nav: getHTML('.main_nav'),
             content: getHTML('.content')
         }
     };
  });
  
  fs.writeFileSync('computed.json', JSON.stringify(computed, null, 2));
  console.log("Done!");
  await browser.close();
})();
