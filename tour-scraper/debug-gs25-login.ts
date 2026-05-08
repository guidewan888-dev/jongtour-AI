import { chromium } from 'playwright';
import * as fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  
  // Login
  await page.goto('https://gs25travel.com/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input[name="username"]', 'patchatravel246');
  await page.fill('input[name="password"]', 'patchatravel');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());

  // Try different URL patterns
  const urls = [
    'https://gs25travel.com/programs',
    'https://gs25travel.com/programs/all',
    'https://gs25travel.com/programs/all/2026/05/All/20949',
    'https://gs25travel.com/programs/all/2026/5/All/20949',
  ];

  for (const url of urls) {
    console.log(`\n=== Testing: ${url} ===`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    console.log('Final URL:', page.url());
    
    // Check for table
    const tableCount = await page.$$eval('table', els => els.length);
    console.log('Tables found:', tableCount);
    
    const rowCount = await page.$$eval('table tbody tr', rows => rows.length);
    console.log('Table rows:', rowCount);
    
    const tdCount = await page.$$eval('td', tds => tds.length);
    console.log('TD cells:', tdCount);

    if (rowCount > 0) {
      // Get first row cells
      const firstRow = await page.$$eval('table tbody tr:first-child td', cells => 
        cells.map(c => c.textContent?.trim() || '')
      );
      console.log('First row:', firstRow);
    }

    // Check page title/heading
    const heading = await page.$eval('h1, h2, h3', el => el.textContent?.trim() || '').catch(() => 'none');
    console.log('Heading:', heading);
    
    // Save HTML for first working URL
    if (rowCount > 0) {
      const html = await page.content();
      fs.writeFileSync('gs25-page.html', html);
      console.log('Saved HTML!');
      break;
    }
  }

  // Also check if nav links exist
  const navLinks = await page.$$eval('a[href*="programs"]', els => 
    els.slice(0, 10).map(el => ({
      href: el.getAttribute('href') || '',
      text: el.textContent?.trim()?.slice(0, 30) || '',
    }))
  );
  console.log('\n=== Nav links with "programs" ===');
  navLinks.forEach(l => console.log(`${l.text}: ${l.href}`));

  await browser.close();
})();
