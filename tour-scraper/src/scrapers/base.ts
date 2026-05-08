// ─── Base Scraper ───────────────────────────
import type { TourData, SiteConfig } from '../types.js';

export abstract class BaseScraper {
  constructor(protected cfg: SiteConfig) {}

  abstract discoverUrls(): Promise<string[]>;
  abstract scrapeTour(url: string): Promise<TourData>;

  protected sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  protected parsePrice(text: string): number {
    const m = (text || '').match(/[\d,]+/);
    return m ? parseFloat(m[0].replace(/,/g, '')) : 0;
  }

  protected text(el: any): string {
    return el?.text()?.trim() ?? '';
  }

  // Cleanup method for scrapers that hold resources (e.g., Playwright browser)
  async cleanup(): Promise<void> {}
}
