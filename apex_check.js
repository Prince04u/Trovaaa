const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set viewport to a typical mobile size, since it's a mobile web app
  await page.setViewport({ width: 375, height: 667 });

  console.log("Navigating to https://apex-king.com/#/login");
  await page.goto('https://apex-king.com/#/login', { waitUntil: 'networkidle0' });

  console.log("Typing login details...");
  // Assuming standard inputs, we'll wait for the input fields and type
  await page.waitForSelector('input[type="text"], input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="phone" i], .van-field__control');
  const inputs = await page.$$('.van-field__control'); // Assuming Vant UI based on previous insights
  if (inputs.length >= 2) {
    await inputs[0].type('9341225312');
    await inputs[1].type('467878');
  } else {
    console.log("Could not find login inputs");
    await page.screenshot({ path: 'login_error.png' });
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

  console.log("Waiting for navigation after login...");
  await new Promise(r => setTimeout(r, 3000));

  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  console.log("Taking screenshot of home...");
  await page.screenshot({ path: 'apex_home.png' });

  // Get outerHTML of the header
  const headerHtml = await page.evaluate(() => {
    // Attempt to find the header element.
    const header = document.querySelector('.van-nav-bar') || document.querySelector('.header') || document.querySelector('#app > div > div:first-child');
    if (header) {
      return {
        html: header.outerHTML,
        computedStyles: {
          boxShadow: window.getComputedStyle(header).boxShadow,
          height: window.getComputedStyle(header).height,
          backgroundColor: window.getComputedStyle(header).backgroundColor,
          color: window.getComputedStyle(header).color,
          display: window.getComputedStyle(header).display,
          alignItems: window.getComputedStyle(header).alignItems,
          justifyContent: window.getComputedStyle(header).justifyContent,
          position: window.getComputedStyle(header).position,
          zIndex: window.getComputedStyle(header).zIndex,
        }
      };
    }
    return { html: document.body.innerHTML.substring(0, 500) };
  });

  console.log(JSON.stringify(headerHtml, null, 2));

  await browser.close();
})();
