const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const styles = await page.evaluate(() => {
    const box = document.querySelector('.list_li ol');
    if (!box) return null;
    
    const info = box.querySelector('.info');
    const price = box.querySelector('.price');
    const imgBox = box.querySelector('.list_img_box');
    const img = box.querySelector('.list_img');
    
    const getS = (el) => {
        if (!el) return null;
        const s = window.getComputedStyle(el);
        return {
            padding: s.padding,
            margin: s.margin,
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            color: s.color,
            width: s.width,
            height: s.height,
            background: s.background
        }
    };
    
    return {
        info: getS(info),
        price: getS(price),
        imgBox: getS(imgBox),
        img: getS(img)
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
