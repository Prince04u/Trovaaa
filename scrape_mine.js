const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle2' });
  
  // wait for input fields
  await page.waitForSelector('input[type="text"]');
  const inputs = await page.$$('input');
  await inputs[0].type('9341225312');
  await inputs[1].type('467878');
  
  // click login button
  const buttons = await page.$$('button');
  await buttons[0].click();
  
  // wait for navigation to home or mine
  await new Promise(r => setTimeout(r, 4000));
  
  // now go to mine page
  await page.goto('https://apex-king.com/#/mine', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const structure = await page.evaluate(() => {
    let result = {
      html: document.body.innerHTML
    };
    try {
      result.css = {};
      for (let i = 0; i < document.styleSheets.length; i++) {
        const rules = document.styleSheets[i].cssRules;
        if(rules) {
          for (let j = 0; j < rules.length; j++) {
            if (rules[j].selectorText && rules[j].selectorText.includes('.mine')) {
              result.css[rules[j].selectorText] = rules[j].cssText;
            }
          }
        }
      }
    } catch(e) {}
    
    // Also extract specific styles of the top banner
    const topBanner = document.querySelector('.mine_top, .top');
    if (topBanner) {
       result.topBanner = window.getComputedStyle(topBanner).cssText;
    }
    
    // extract generic container styles (like menu items)
    const listItems = Array.from(document.querySelectorAll('div, li, ol')).filter(d => d.innerText.includes('Sign In') || d.innerText.includes('Wallet'));
    if(listItems.length > 0) {
        result.menuItem = window.getComputedStyle(listItems[0]).cssText;
        result.menuItemHtml = listItems[0].outerHTML;
    }

    return result;
  });
  
  require('fs').writeFileSync('mine_structure.json', JSON.stringify(structure, null, 2));
  console.log('Saved to mine_structure.json');
  await browser.close();
})();
