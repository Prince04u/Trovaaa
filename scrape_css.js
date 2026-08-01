const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const rules = await page.evaluate(() => {
    let result = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const rules = document.styleSheets[i].cssRules;
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].selectorText && (
                    rules[j].selectorText.includes('.list_img_box') || 
                    rules[j].selectorText.includes('.list_img') || 
                    rules[j].selectorText.includes('.info') ||
                    rules[j].selectorText.includes('.list_li') ||
                    rules[j].selectorText.includes('.list_con')
                )) {
                    result[rules[j].selectorText] = rules[j].cssText;
                }
            }
        } catch (e) {}
    }
    return result;
  });
  
  console.log(JSON.stringify(rules, null, 2));
  await browser.close();
})();
