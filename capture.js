const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new"
    });
    const page = await browser.newPage();
    
    // Set viewport slightly larger than banner
    await page.setViewport({ width: 1250, height: 300, deviceScaleFactor: 1 });
    
    // Convert absolute path to file URL
    const filePath = `file:///${path.resolve(__dirname, 'banner_render.html').replace(/\\/g, '/')}`;
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Ensure fonts are loaded
    await page.evaluateHandle('document.fonts.ready');
    
    // Get the bounding box of the banner
    const element = await page.$('.banner');
    
    // Screenshot
    const outputPath = path.resolve(__dirname, 'jongtour_banner.png');
    await element.screenshot({ path: outputPath });
    
    console.log(`Saved screenshot to ${outputPath}`);
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
