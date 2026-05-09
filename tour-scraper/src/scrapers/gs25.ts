// ─── GS25 Travel Scraper (Full) ─────────────
// Site: https://gs25travel.com
// Strategy:
//   1. Login → /programs/all → parse master table (dates, prices, seats, status)
//   2. Visit each unique program detail page → extract carousel images + PDF URL
// Requires Playwright (server-rendered but behind login)
// NOTE: All HTML parsing is done with Cheerio in Node.js to avoid tsx __name issues with page.$$eval

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base.js';
import type { TourData, TourPeriod, SiteConfig } from '../types.js';

// ── Country name mapping ──
const COUNTRY_MAP: Record<string, string> = {
  'VIETNAM': 'เวียดนาม',
  'JAPAN-HOKKAIDO': 'ญี่ปุ่น', 'JAPAN-OSAKA': 'ญี่ปุ่น', 'JAPAN-FUKUOKA': 'ญี่ปุ่น',
  'JAPAN-NARITA': 'ญี่ปุ่น', 'JAPAN-NAGOYA': 'ญี่ปุ่น', 'JAPAN-CHANGE FLIGHT': 'ญี่ปุ่น',
  'EUROPE': 'ยุโรป',
  'TAIWAN': 'ไต้หวัน',
  'CHINA': 'จีน',
  'KASHMIR': 'อินเดีย',
  'GEORGIA': 'จอร์เจีย',
  'EGYPT': 'อียิปต์',
  'TURKEY': 'ตุรกี', 'TURKEY ': 'ตุรกี',
  'KAZAKHSTAN': 'คาซัคสถาน',
};

// ── Parsed row from the master table ──
interface TableRow {
  dateRange: string;
  duration: string;
  programName: string;
  airline: string;
  price: number;
  originalPrice: number;
  commission: number;
  salesCommission: number;
  totalSeats: number;
  seatsLeft: number;
  status: string;
  notes: string;
}

// ── Grouped program with all its departure periods ──
interface ProgramGroup {
  programCode: string;
  programName: string;
  country: string;
  countrySlug: string;
  airline: string;
  airlineCode: string;
  duration: string;
  periods: TourPeriod[];
  lowestPrice: number;
  detailUrl: string;
}

// ── Helpers ──
function extractCode(title: string): string {
  const match = title.match(/^([A-Z]{2,5}\d+)/);
  return match ? match[1] : '';
}

function extractAirlineCode(airlineText: string): string {
  const match = airlineText.match(/\(([A-Z]{2})\)/);
  return match ? match[1] : '';
}

function parseDuration(dur: string): string {
  const match = dur.match(/(\d+)D(\d+)N/i);
  return match ? `${match[1]} วัน ${match[2]} คืน` : dur;
}

function parsePriceText(text: string): { price: number; originalPrice: number } {
  const parts = text.split('>').map(s => s.trim());
  const lastPart = parts[parts.length - 1];
  const lastMatch = lastPart.match(/[\d,]+/);
  const price = lastMatch ? parseInt(lastMatch[0].replace(/,/g, ''), 10) : 0;
  const origMatch = parts[0].match(/[\d,]+/);
  const originalPrice = origMatch ? parseInt(origMatch[0].replace(/,/g, ''), 10) : price;
  return { price, originalPrice };
}

function parseDateRange(text: string): { startDate: string; endDate: string } {
  const months: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
  };

  // Pattern 1: "DD - DD MON YYYY" (same month)
  const same = text.match(/(\d{1,2})\s*-\s*(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (same) {
    const mon = months[same[3].toUpperCase()] || '01';
    return {
      startDate: `${same[4]}-${mon}-${same[1].padStart(2, '0')}`,
      endDate: `${same[4]}-${mon}-${same[2].padStart(2, '0')}`,
    };
  }

  // Pattern 2: "DD MON - DD MON YYYY" (cross-month)
  const cross = text.match(/(\d{1,2})\s+(\w{3})\s*-\s*(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (cross) {
    const mon1 = months[cross[2].toUpperCase()] || '01';
    const mon2 = months[cross[4].toUpperCase()] || '01';
    const year = cross[5];
    const year2 = parseInt(mon2) < parseInt(mon1) ? String(parseInt(year) + 1) : year;
    return {
      startDate: `${year}-${mon1}-${cross[1].padStart(2, '0')}`,
      endDate: `${year2}-${mon2}-${cross[3].padStart(2, '0')}`,
    };
  }

  return { startDate: '', endDate: '' };
}

function guessCountrySlug(programName: string): string {
  const pn = programName.toUpperCase();
  if (/^(DAD|SGN|HAN|PQC)/.test(pn) || /VIETNAM|DANANG|HANOI|SAIGON|BANA/.test(pn)) return 'VIETNAM';
  if (/HOKKAIDO|CTS/.test(pn)) return 'JAPAN-HOKKAIDO';
  if (/OSAKA|KIX/.test(pn)) return 'JAPAN-OSAKA';
  if (/FUKUOKA|FUK/.test(pn)) return 'JAPAN-FUKUOKA';
  if (/NARITA|NRT|TOKYO/.test(pn)) return 'JAPAN-NARITA';
  if (/NAGOYA|NGO/.test(pn)) return 'JAPAN-NAGOYA';
  if (/EUROPE|SWISS|ITALY|FRANCE|SPAIN/.test(pn)) return 'EUROPE';
  if (/TAIWAN|TPE|TSA/.test(pn)) return 'TAIWAN';
  if (/CHINA|CHONGQING|KUNMING|XINJIANG|BEIJING|SHANGHAI|CHENGDU|CKG|KMG|URC|PEK|PVG|CTU|TFU/.test(pn)) return 'CHINA';
  if (/KASHMIR/.test(pn)) return 'KASHMIR';
  if (/GEORGIA|TBS/.test(pn)) return 'GEORGIA';
  if (/EGYPT|CAIRO|CAI/.test(pn)) return 'EGYPT';
  if (/TURKEY|IST/.test(pn)) return 'TURKEY';
  if (/KAZAKH|ALMATY|ALA/.test(pn)) return 'KAZAKHSTAN';
  if (/CHANGE.?FLIGHT|CSX|NKG/.test(pn)) return 'JAPAN-CHANGE FLIGHT';
  return 'VIETNAM';
}

function normalizeStatus(text: string): string {
  const upper = text.toUpperCase().trim();
  if (upper.includes('AVAIL')) return 'open';
  if (upper.includes('WAIT')) return 'waitlist';
  if (upper.includes('FULL') || upper.includes('เต็ม')) return 'full';
  return text.toLowerCase().trim() || 'unknown';
}


export class GS25Scraper extends BaseScraper {
  private browser: Browser | null = null;
  private ctx: BrowserContext | null = null;
  private programs = new Map<string, ProgramGroup>();

  // ────────────────────────────────────────────
  // Phase 1: Login + Parse /programs/all table
  // ────────────────────────────────────────────
  async discoverUrls(): Promise<string[]> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    this.ctx = await this.browser.newContext({ userAgent: this.cfg.userAgent });
    const page = await this.ctx.newPage();

    try {
      // ── Login ──
      console.log('[gs25] 🔑 Logging in...');
      await page.goto('https://gs25travel.com/login', { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(2000);

      const username = process.env.GS25_EMAIL || '';
      const password = process.env.GS25_PASSWORD || '';
      if (!username || !password) {
        console.error('[gs25] ❌ GS25_EMAIL or GS25_PASSWORD not set — skipping GS25 scraper');
        console.error('[gs25] ℹ️  Set these as environment variables or GitHub Actions secrets');
        return [];
      }

      await page.fill('input[name="username"]', username);
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {}),
        page.click('button[type="submit"]'),
      ]);
      await page.waitForTimeout(3000);
      console.log(`[gs25] ✅ Logged in → ${page.url()}`);

      // ── Navigate to ALL programs listing ──
      console.log('[gs25] 📋 Loading /programs/all ...');
      await page.goto('https://gs25travel.com/programs/all', { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(3000);
      await page.waitForSelector('table', { timeout: 15_000 }).catch(() => {});

      // Get the full HTML
      const html = await page.content();

      // ── Extract destinationList for country→slug mapping ──
      const countrySlugMap = new Map<string, string>();
      try {
        const destRegex = /var\s+destinationList\s*=\s*(\{.+?\});\s*\n/g;
        const destMatch = destRegex.exec(html);
        if (destMatch) {
          const data = JSON.parse(destMatch[1]);
          for (const [, val] of Object.entries(data)) {
            const cd = val as any;
            if (!cd?.country || !cd?.entrance_city) continue;
            const slug = cd.country.trim();
            for (const [cityKey, cityVal] of Object.entries(cd.entrance_city)) {
              if (/^\d+$/.test(cityKey)) {
                const code = extractCode(cityVal as string);
                if (code) countrySlugMap.set(code, slug);
              } else if (Array.isArray(cityVal)) {
                for (const prog of cityVal) {
                  if (prog?.program_name) {
                    const code = extractCode(prog.program_name);
                    if (code) countrySlugMap.set(code, slug);
                  }
                }
              }
            }
          }
        }
        console.log(`[gs25] 🗺️  Country map: ${countrySlugMap.size} program→country mappings`);
      } catch {
        console.warn('[gs25] Could not parse destinationList, will guess countries');
      }

      // ── Parse the table rows with Cheerio ──
      const rows = this.parseTableWithCheerio(html);
      console.log(`[gs25] 📊 Parsed ${rows.length} table rows`);

      // ── Group rows by program code ──
      for (const row of rows) {
        const code = extractCode(row.programName);
        if (!code) continue;

        const airlineCode = extractAirlineCode(row.airline);
        const slug = countrySlugMap.get(code) || guessCountrySlug(row.programName);
        const countryThai = COUNTRY_MAP[slug] || slug;
        const dates = parseDateRange(row.dateRange);

        const period: TourPeriod = {
          startDate: dates.startDate,
          endDate: dates.endDate,
          price: row.price,
          seatsLeft: row.seatsLeft,
          status: normalizeStatus(row.status),
          rawText: `${row.dateRange} | ${row.duration} | ฿${row.price.toLocaleString()} | ${row.status} | seats: ${row.seatsLeft}/${row.totalSeats}`,
        };

        if (this.programs.has(code)) {
          const existing = this.programs.get(code)!;
          existing.periods.push(period);
          if (row.price > 0 && (row.price < existing.lowestPrice || existing.lowestPrice === 0)) {
            existing.lowestPrice = row.price;
          }
        } else {
          const detailUrl = `https://gs25travel.com/programs/${encodeURIComponent(slug)}/${encodeURIComponent(row.programName)}`;
          this.programs.set(code, {
            programCode: code,
            programName: row.programName,
            country: countryThai,
            countrySlug: slug,
            airline: row.airline,
            airlineCode,
            duration: parseDuration(row.duration),
            periods: [period],
            lowestPrice: row.price,
            detailUrl,
          });
        }
      }

      console.log(`[gs25] ✅ ${this.programs.size} unique programs discovered`);

    } catch (e) {
      console.error(`[gs25] ❌ Error in discoverUrls:`, (e as Error).message);
    } finally {
      await page.close();
    }

    return [...this.programs.keys()].map(code => `gs25://program/${code}`);
  }

  // ── Parse table with Cheerio (Node.js side, no browser eval) ──
  // Table columns: [0:empty] [1:dates] [2:duration] [3:program] [4:airline] [5:price]
  //                 [6:commission] [7:sales_com] [8:total_seats] [9:seats_left] [10:status] [11:notes]
  private parseTableWithCheerio(html: string): TableRow[] {
    const $ = cheerio.load(html);
    const rows: TableRow[] = [];

    $('table tbody tr').each((_, tr) => {
      const cells = $(tr).find('td');
      if (cells.length < 11) return; // Skip notification/header rows

      const txt = (idx: number) => $(cells[idx]).text().trim();

      const priceInfo = parsePriceText(txt(5));
      const comMatch = txt(6).match(/[\d,]+/);
      const scomMatch = txt(7).match(/[\d,]+/);

      // Status: look for span.label inside the status cell (index 10)
      const statusText = $(cells[10]).find('span').text().trim() || txt(10);

      rows.push({
        dateRange: txt(1),
        duration: txt(2),
        programName: txt(3),
        airline: txt(4),
        price: priceInfo.price,
        originalPrice: priceInfo.originalPrice,
        commission: comMatch ? parseInt(comMatch[0].replace(/,/g, ''), 10) : 0,
        salesCommission: scomMatch ? parseInt(scomMatch[0].replace(/,/g, ''), 10) : 0,
        totalSeats: parseInt(txt(8)) || 0,
        seatsLeft: parseInt(txt(9)) || 0,
        status: statusText,
        notes: cells.length > 11 ? txt(11) : '',
      });
    });

    return rows;
  }

  // ────────────────────────────────────────────
  // Phase 2: Visit detail page → images + PDF
  // ────────────────────────────────────────────
  async scrapeTour(url: string): Promise<TourData> {
    const code = url.split('/').pop() || '';
    const prog = this.programs.get(code);
    if (!prog) throw new Error(`No GS25 program for code "${code}"`);

    const tourData: TourData = {
      tourCode: `GS-${prog.programCode}`,
      sourceUrl: prog.detailUrl,
      title: prog.programName,
      country: prog.country,
      duration: prog.duration,
      priceFrom: prog.lowestPrice,
      airline: prog.airline,
      description: '',
      itineraryHtml: '',
      pdfUrl: '',
      imageUrls: [],
      periods: prog.periods,
      deposit: undefined,
      hotelRating: undefined,
      highlights: [],
    };

    if (!this.ctx) return tourData;

    const page = await this.ctx.newPage();
    try {
      await this.sleep(this.cfg.requestDelayMs);

      console.log(`[gs25]   → Detail: ${prog.detailUrl.slice(0, 80)}...`);
      await page.goto(prog.detailUrl, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(3000);

      const detailHtml = await page.content();
      const $ = cheerio.load(detailHtml);

      // ── Extract carousel images ──
      const imageUrls = new Set<string>();
      // Carousel images
      $('.carousel-inner .item img, .carousel img, #carousel-example-generic img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && src.startsWith('http') && !/logo|icon|avatar|spacer/i.test(src)) {
          imageUrls.add(src);
        }
      });
      // Also check for data-src or lazy-loaded
      $('img[data-src]').each((_, img) => {
        const src = $(img).attr('data-src');
        if (src && src.startsWith('http') && !/logo|icon|avatar|spacer/i.test(src)) {
          imageUrls.add(src);
        }
      });
      tourData.imageUrls = [...imageUrls].slice(0, 15);

      // ── Extract PDF URL ──
      let pdfUrl = '';
      $('a[href*="pdfview"], a[href*=".pdf"], a[href*="document"]').each((_, a) => {
        const href = $(a).attr('href');
        if (href && (href.includes('pdfview') || href.includes('.pdf'))) {
          if (!pdfUrl) {
            pdfUrl = href.startsWith('http') ? href : `https://gs25travel.com${href}`;
          }
        }
      });

      // Fallback: look for "Print PDF" / "PRINT PDF" text
      if (!pdfUrl) {
        $('a').each((_, a) => {
          const text = $(a).text().trim();
          if (/print\s*pdf/i.test(text)) {
            const href = $(a).attr('href');
            if (href) {
              pdfUrl = href.startsWith('http') ? href : `https://gs25travel.com${href}`;
            }
          }
        });
      }

      // Fallback: construct from URL pattern
      if (!pdfUrl) {
        pdfUrl = `https://gs25travel.com/documents/pdfview/${encodeURIComponent(prog.countrySlug)}/${encodeURIComponent(prog.programName)}`;
      }
      tourData.pdfUrl = pdfUrl;

      // ── Parse additional periods from detail page table ──
      const detailPeriods = this.parsePeriodsFromHtml(detailHtml);
      if (detailPeriods.length > 0) {
        const existingDates = new Set(prog.periods.map(p => `${p.startDate}-${p.endDate}`));
        for (const dp of detailPeriods) {
          const key = `${dp.startDate}-${dp.endDate}`;
          if (!existingDates.has(key)) {
            tourData.periods.push(dp);
            existingDates.add(key);
          }
        }
      }

      console.log(`[gs25]   ✅ ${tourData.imageUrls.length} imgs, PDF: ${pdfUrl ? '✓' : '✗'}, ${tourData.periods.length} periods`);

    } catch (e) {
      console.warn(`[gs25]   ⚠️ Detail error for ${code}: ${(e as Error).message}`);
    } finally {
      await page.close();
    }

    return tourData;
  }

  // ── Parse period table from detail page HTML ──
  // Same column structure as /programs/all: [0:empty] [1:dates] [2:dur] [3:prog] [4:airline] [5:price] ...
  private parsePeriodsFromHtml(html: string): TourPeriod[] {
    const $ = cheerio.load(html);
    const periods: TourPeriod[] = [];

    $('table tbody tr').each((_, tr) => {
      const cells = $(tr).find('td');
      if (cells.length < 11) return;

      const txt = (idx: number) => $(cells[idx]).text().trim();
      const dateRange = txt(1);
      const priceInfo = parsePriceText(txt(5));
      const statusText = $(cells[10]).find('span').text().trim() || txt(10);
      const dates = parseDateRange(dateRange);

      periods.push({
        startDate: dates.startDate,
        endDate: dates.endDate,
        price: priceInfo.price,
        seatsLeft: parseInt(txt(9)) || 0,
        status: normalizeStatus(statusText),
        rawText: `${dateRange} | ${txt(2)} | ฿${priceInfo.price.toLocaleString()} | ${statusText} | seats: ${txt(9)}/${txt(8)}`,
      });
    });

    return periods;
  }

  // ────────────────────────────────────────────
  // Cleanup
  // ────────────────────────────────────────────
  async cleanup(): Promise<void> {
    await this.ctx?.close();
    this.ctx = null;
    await this.browser?.close();
    this.browser = null;
  }
}
