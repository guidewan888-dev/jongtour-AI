// ─── Tour Scraper — Main Entry Point ────────
// Usage:
//   npm run dev                        # scrape all enabled sites
//   npm run dev -- --site worldconnection # scrape specific site

import 'dotenv/config';
import { sites } from './config/sites.js';
import { WorldConnectionScraper } from './scrapers/worldconnection.js';
import { ITravelsScraper } from './scrapers/itravels.js';
import { BestInternationalScraper } from './scrapers/bestintl.js';
import { GS25Scraper } from './scrapers/gs25.js';
import { Go365Scraper } from './scrapers/go365.js';
import { downloadAndStore } from './core/downloader.js';
import { upsertTour, startRun, finishRun } from './core/db.js';
import type { BaseScraper } from './scrapers/base.js';
import type { ScrapeStats } from './types.js';

// ── Scraper Registry ──
const scraperMap: Record<string, new (cfg: any) => BaseScraper> = {
  worldconnection: WorldConnectionScraper,
  itravels: ITravelsScraper,
  bestintl: BestInternationalScraper,
  gs25: GS25Scraper,
  go365: Go365Scraper,
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
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const [i, url] of urls.entries()) {
      // Rate-limit: wait between requests to avoid being blocked
      if (i > 0) await sleep(3000);

      let attempts = 0;
      const maxRetries = 3;
      let success = false;

      while (attempts < maxRetries && !success) {
        try {
          attempts++;
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
          success = true;
        } catch (e) {
          const msg = (e as Error).message;
          if (attempts < maxRetries) {
            const backoff = attempts * 5000; // 5s, 10s, 15s
            console.warn(`⏳ [${siteCfg.name}] ${i + 1}/${urls.length} attempt ${attempts} failed: ${msg} — retry in ${backoff/1000}s`);
            await sleep(backoff);
          } else {
            stats.urlsFailed++;
            console.error(`❌ [${siteCfg.name}] ${i + 1}/${urls.length} — ${url}: ${msg}`);
          }
        }
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

  const results: { site: string; ok: boolean; err?: string }[] = [];
  for (const site of targetSites) {
    try {
      await runSite(site);
      results.push({ site: site.name, ok: true });
    } catch (e) {
      const errMsg = (e as Error).message;
      console.error(`\n💥 [${site.name}] Uncaught error — skipping:`, errMsg);
      results.push({ site: site.name, ok: false, err: errMsg });
    }
  }

  // Summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log('📊 Scrape Summary:');
  for (const r of results) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.site}${r.err ? ` — ${r.err}` : ''}`);
  }
  const failCount = results.filter(r => !r.ok).length;
  if (failCount === results.length) {
    console.error('\n❌ All sites failed!');
    process.exit(1);
  }
  console.log(`\n✨ Done! ${results.length - failCount}/${results.length} sites succeeded.`);
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
