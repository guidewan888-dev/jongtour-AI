// ─── Tour Scraper — Main Entry Point ────────
// Usage:
//   npm run dev                        # scrape all enabled sites
//   npm run dev -- --site oneworldtour # scrape specific site

import { sites } from './config/sites.js';
import { OneWorldTourScraper } from './scrapers/oneworldtour.js';
import { ITravelsScraper } from './scrapers/itravels.js';
import { downloadAndStore } from './core/downloader.js';
import { upsertTour, startRun, finishRun } from './core/db.js';
import type { BaseScraper } from './scrapers/base.js';
import type { ScrapeStats } from './types.js';

// ── Scraper Registry ──
const scraperMap: Record<string, new (cfg: any) => BaseScraper> = {
  oneworldtour: OneWorldTourScraper,
  itravels: ITravelsScraper,
};

async function runSite(siteCfg: (typeof sites)[number]): Promise<void> {
  const runId = await startRun(siteCfg.name);
  const stats: ScrapeStats = { urlsFound: 0, urlsScraped: 0, urlsFailed: 0, imagesSaved: 0 };
  let scraper: BaseScraper | undefined;

  try {
    const Cls = scraperMap[siteCfg.name];
    if (!Cls) throw new Error(`No scraper registered for "${siteCfg.name}"`);

    scraper = new Cls(siteCfg);

    // 1. Discover tour URLs
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🔍 [${siteCfg.name}] Discovering tour URLs...`);
    const urls = await scraper.discoverUrls();
    stats.urlsFound = urls.length;
    console.log(`📋 [${siteCfg.name}] Found ${urls.length} tour URLs`);

    if (urls.length === 0) {
      console.log(`⚠️  [${siteCfg.name}] No URLs found — check sitemap config`);
      await finishRun(runId, stats);
      return;
    }

    // 2. Scrape each tour
    for (const [i, url] of urls.entries()) {
      try {
        const tour = await scraper.scrapeTour(url);

        // 3. Download images
        const images = [];
        for (const imgUrl of tour.imageUrls) {
          const meta = await downloadAndStore(imgUrl, siteCfg.userAgent);
          if (meta) images.push(meta);
        }

        // 4. Save to DB
        await upsertTour(siteCfg.name, tour, images);

        stats.urlsScraped++;
        stats.imagesSaved += images.length;
        console.log(
          `✅ [${siteCfg.name}] ${i + 1}/${urls.length} — ${tour.tourCode || tour.title?.slice(0, 40)} (${images.length} imgs)`
        );
      } catch (e) {
        stats.urlsFailed++;
        console.error(`❌ [${siteCfg.name}] ${i + 1}/${urls.length} — ${url}:`, (e as Error).message);
      }
    }

    await finishRun(runId, stats);
    console.log(`\n🏁 [${siteCfg.name}] Done — ${stats.urlsScraped} scraped, ${stats.urlsFailed} failed, ${stats.imagesSaved} images`);
  } catch (e) {
    const errMsg = (e as Error).message;
    console.error(`💥 [${siteCfg.name}] FATAL:`, errMsg);
    await finishRun(runId, { ...stats, error: errMsg });
  } finally {
    await scraper?.cleanup();
  }
}

async function main(): Promise<void> {
  console.log(`🚀 Tour Scraper started at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

  // Parse --site arg
  const siteArg = process.argv.find((a) => a.startsWith('--site'))
    ? process.argv[process.argv.indexOf('--site') + 1]
    : process.env.SCRAPE_SITE;

  const targetSites = siteArg
    ? sites.filter((s) => s.name === siteArg)
    : sites.filter((s) => s.enabled);

  if (targetSites.length === 0) {
    console.error('No sites to scrape. Check --site arg or config.');
    process.exit(1);
  }

  for (const site of targetSites) {
    await runSite(site);
  }

  console.log(`\n✨ All done!`);
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
