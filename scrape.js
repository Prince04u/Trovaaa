const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  await page.goto('https://bruzoo.games/#/login');
  await page.waitForSelector('input[type="tel"]');
  await page.type('input[type="tel"]', '9341225312');
  await page.type('input[type="password"]', '952316');
  await page.click('button.one_btn');
  await page.waitForNavigation({waitUntil: 'networkidle2'});
  await page.goto('https://bruzoo.games/#/win');
  await page.waitForSelector('.mine_top');
  const data = await page.evaluate(() => {
    return document.querySelector('.mine_top').outerHTML;
  });
  console.log(data);
  await browser.close();
})();
