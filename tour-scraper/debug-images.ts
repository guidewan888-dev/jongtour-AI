import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  
  await page.goto('https://itravels.center/programs/TJX39', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Find ALL img tags
  const imgs = await page.$$eval('img', els => els.map(el => ({
    src: el.getAttribute('src') || '',
    srcset: el.getAttribute('srcset') || '',
    dataSrc: el.getAttribute('data-src') || '',
    alt: el.getAttribute('alt') || '',
    width: el.naturalWidth,
    height: el.naturalHeight,
    className: el.className?.slice(0, 80) || '',
  })));
  
  console.log(`\n=== Found ${imgs.length} img tags ===\n`);
  imgs.forEach((img, i) => {
    if (img.src && !/svg|data:|flag|logo|icon/i.test(img.src)) {
      console.log(`[${i}] src: ${img.src}`);
      console.log(`    srcset: ${img.srcset?.slice(0, 120)}`);
      console.log(`    alt: ${img.alt}`);
      console.log(`    size: ${img.width}x${img.height}`);
      console.log(`    class: ${img.className}\n`);
    }
  });
  
  // Check for background images
  const bgImgs = await page.$$eval('[style]', els => els
    .map(el => el.getAttribute('style') || '')
    .filter(s => s.includes('background-image') && /url/i.test(s))
    .map(s => s.match(/url\(['"]?([^'")]+)/)?.[1] || '')
    .filter(Boolean)
  );
  console.log(`\n=== Background images: ${bgImgs.length} ===`);
  bgImgs.forEach(u => console.log(u));

  // Check for next/image
  const nextImgs = await page.$$eval('img[data-nimg]', els => els.map(el => ({
    src: el.getAttribute('src') || '',
    dataNimg: el.getAttribute('data-nimg') || '',
  })));
  console.log(`\n=== next/image: ${nextImgs.length} ===`);
  nextImgs.forEach(n => console.log(n));

  // Try looking for the poster/hero image via OG meta
  const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content')).catch(() => 'none');
  console.log(`\n=== OG Image: ${ogImage} ===`);

  await browser.close();
})();
