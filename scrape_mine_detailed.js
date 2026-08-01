const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('input[type="text"]');
  const inputs = await page.$$('input');
  await inputs[0].type('9341225312');
  await inputs[1].type('467878');
  
  const buttons = await page.$$('button');
  await buttons[0].click();
  
  await new Promise(r => setTimeout(r, 4000));
  
  await page.goto('https://apex-king.com/#/mine', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const styles = await page.evaluate(() => {
    let result = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const rules = document.styleSheets[i].cssRules;
        if(rules) {
          for (let j = 0; j < rules.length; j++) {
            if (rules[j].selectorText && (
                rules[j].selectorText.includes('.info') || 
                rules[j].selectorText.includes('.notice') ||
                rules[j].selectorText.includes('.mine') ||
                rules[j].selectorText.includes('ul li')
                )) {
              result[rules[j].selectorText] = rules[j].cssText;
            }
          }
        }
      } catch (e) {}
    }
    return result;
  });
  
  require('fs').writeFileSync('mine_styles_all.json', JSON.stringify(styles, null, 2));
  console.log('Saved to mine_styles_all.json');
  await browser.close();
})();
