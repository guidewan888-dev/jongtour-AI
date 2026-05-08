// ─── GS25 Travel Scraper ────────────────────────
// Site: https://gs25travel.com/programs
// Structure: Table-based listing, requires Playwright
// Columns: เดินทาง | วัน | โปรแกรม | สายการบิน | ราคา | คอมมิชชั่น | ...

import * as cheerio from 'cheerio';
import { chromium, Browser } from 'playwright';
import { BaseScraper } from './base.js';
import type { TourData, TourPeriod, SiteConfig } from '../types.js';

const COUNTRY_MAP: Record<string, string> = {
  'vietnam': 'เวียดนาม', 'เวียดนาม': 'เวียดนาม',
  'japan': 'ญี่ปุ่น', 'ญี่ปุ่น': 'ญี่ปุ่น', 'hokkaido': 'ญี่ปุ่น', 'osaka': 'ญี่ปุ่น',
  'tokyo': 'ญี่ปุ่น', 'fukuoka': 'ญี่ปุ่น', 'narita': 'ญี่ปุ่น', 'nagoya': 'ญี่ปุ่น',
  'europe': 'ยุโรป', 'ยุโรป': 'ยุโรป',
  'taiwan': 'ไต้หวัน', 'ไต้หวัน': 'ไต้หวัน',
  'china': 'จีน', 'จีน': 'จีน', 'kunming': 'จีน', 'xinjiang': 'จีน',
  'kashmir': 'อินเดีย', 'india': 'อินเดีย',
  'georgia': 'จอร์เจีย', 'จอร์เจีย': 'จอร์เจีย',
  'egypt': 'อียิปต์', 'อียิปต์': 'อียิปต์',
  'turkey': 'ตุรกี', 'ตุรกี': 'ตุรกี',
  'kazakhstan': 'คาซัคสถาน',
  'korea': 'เกาหลี', 'เกาหลี': 'เกาหลี',
};

function detectCountry(programTitle: string, navSection: string): string {
  const combined = (programTitle + ' ' + navSection).toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (combined.includes(key.toLowerCase())) return val;
  }
  return '';
}

// GS25 data is table-based — we scrape rows directly, no individual detail pages
interface GS25Row {
  departDate: string;
  duration: string;
  programTitle: string;
  airline: string;
  price: number;
  commission: number;
  totalSeats: number;
  available: number;
  status: string;
  remark: string;
  navSection: string; // which nav section it came from (for country detection)
}

export class GS25Scraper extends BaseScraper {
  private browser: Browser | null = null;
  private rows: GS25Row[] = [];

  async discoverUrls(): Promise<string[]> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    // GS25 uses nav menu for filtering. We'll scrape ALL section
    const navSections = [
      { name: 'ALL', url: 'https://gs25travel.com/programs' },
    ];

    const ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
    const page = await ctx.newPage();

    try {
      await page.goto('https://gs25travel.com/programs', { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForTimeout(5000);

      // Click "ALL" to get all programs
      try {
        const allBtn = await page.$('a:has-text("ALL"), button:has-text("ALL")');
        if (allBtn) {
          await allBtn.click();
          await page.waitForTimeout(3000);
        }
      } catch {}

      // Scroll to load all content
      for (let i = 0; i < 15; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(500);
      }

      // Parse table rows
      const tableRows = await page.$$eval('table tbody tr', (rows) => {
        return rows.map(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 7) return null;
          return {
            departDate: cells[0]?.textContent?.trim() || '',
            duration: cells[1]?.textContent?.trim() || '',
            programTitle: cells[2]?.textContent?.trim() || '',
            airline: cells[3]?.textContent?.trim() || '',
            price: cells[4]?.textContent?.trim() || '0',
            commission: cells[5]?.textContent?.trim() || '0',
            totalSeats: cells[7]?.textContent?.trim() || '0',
            available: cells[8]?.textContent?.trim() || '0',
            status: cells[9]?.textContent?.trim() || '',
            remark: cells[10]?.textContent?.trim() || '',
          };
        }).filter(Boolean);
      });

      // Group by program code (first part of title like "KMG29")
      const programs = new Map<string, GS25Row>();
      for (const row of tableRows) {
        if (!row) continue;
        const code = row.programTitle.match(/^([A-Z]{2,5}\d{1,4})/i)?.[1] || '';
        if (!code) continue;

        const priceNum = parseInt((row.price || '0').replace(/[^0-9]/g, ''), 10);
        const seatsNum = parseInt((row.totalSeats || '0').replace(/[^0-9]/g, ''), 10);
        const availNum = parseInt((row.available || '0').replace(/[^0-9]/g, ''), 10);

        if (!programs.has(code) || priceNum < (programs.get(code)!.price || Infinity)) {
          programs.set(code, {
            departDate: row.departDate,
            duration: row.duration,
            programTitle: row.programTitle,
            airline: row.airline,
            price: priceNum,
            commission: parseInt((row.commission || '0').replace(/[^0-9]/g, ''), 10),
            totalSeats: seatsNum,
            available: availNum,
            status: row.status,
            remark: row.remark,
            navSection: 'ALL',
          });
        }
      }

      this.rows = [...programs.values()];
      console.log(`[gs25] Parsed ${this.rows.length} unique programs from ${tableRows.length} rows`);

    } catch (e) {
      console.error(`[gs25] Error discovering:`, (e as Error).message);
    } finally {
      await ctx.close();
    }

    // Return pseudo-URLs (one per unique program)
    return this.rows.map((_, i) => `gs25://program/${i}`);
  }

  async scrapeTour(url: string): Promise<TourData> {
    // URL is gs25://program/INDEX — we use the stored row data
    const idx = parseInt(url.split('/').pop() || '0', 10);
    const row = this.rows[idx];

    if (!row) throw new Error(`No GS25 row at index ${idx}`);

    const code = row.programTitle.match(/^([A-Z]{2,5}\d{1,4})/i)?.[1] || `GS25-${idx}`;
    const title = row.programTitle;
    const country = detectCountry(title, row.navSection);
    const airline = row.airline.replace(/\(.*?\)/g, '').trim();

    // Parse duration "4D3N" or "5D3N"
    const durMatch = row.duration.match(/(\d+)D(\d+)N/i)
      || row.duration.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
    const duration = durMatch ? `${durMatch[1]} วัน ${durMatch[2]} คืน` : row.duration;

    // Periods
    const periods: TourPeriod[] = [{
      rawText: `${row.departDate} - ${row.duration}`,
      price: row.price,
      seatsLeft: row.available,
      status: row.available > 0 ? 'open' : 'full',
    }];

    return {
      tourCode: code,
      sourceUrl: `https://gs25travel.com/programs`,
      title,
      country,
      duration,
      priceFrom: row.price,
      airline,
      pdfUrl: '',
      imageUrls: [], // GS25 is table-only, no images
      periods,
      deposit: row.commission || undefined,
      hotelRating: undefined,
      highlights: row.remark ? [row.remark] : [],
    };
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }
}
