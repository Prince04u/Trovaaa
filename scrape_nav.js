const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('https://apex-king.com/#/', { waitUntil: 'networkidle2' });
  
  const navStyles = await page.evaluate(() => {
    // Assuming bottom nav is a flex/grid container at the bottom
    const nav = document.querySelector('.van-tabbar') || Array.from(document.querySelectorAll('div, nav')).find(el => {
       const style = window.getComputedStyle(el);
       return style.position === 'fixed' && style.bottom === '0px' && el.offsetHeight > 30 && el.offsetHeight < 80;
    });

    if (!nav) return "Nav not found";

    const getStyles = (el) => {
        const style = window.getComputedStyle(el);
        return {
            height: style.height,
            padding: style.padding,
            margin: style.margin,
            display: style.display,
            alignItems: style.alignItems,
            justifyContent: style.justifyContent
        };
    };

    const styles = { nav: getStyles(nav) };
    
    // get an icon img and text span
    const img = nav.querySelector('img');
    if (img) styles.img = getStyles(img);
    
    // look for a span with text
    const textEl = Array.from(nav.querySelectorAll('span, div')).find(el => el.textContent.trim() === 'Home' || el.textContent.trim() === 'My');
    if (textEl) {
        const ts = window.getComputedStyle(textEl);
        styles.text = {
            fontSize: ts.fontSize,
            lineHeight: ts.lineHeight,
            marginTop: ts.marginTop,
            color: ts.color
        };
    }
    
    return styles;
  });
  
  console.log(JSON.stringify(navStyles, null, 2));
  await browser.close();
})();
