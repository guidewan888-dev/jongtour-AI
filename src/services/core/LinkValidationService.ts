/**
 * LinkValidationService — Crawls and validates all internal/external links
 */
import { prisma } from '@/lib/prisma';

export class LinkValidationService {

  /** Check a single URL */
  static async validateUrl(url: string): Promise<{ url: string; status: number; ok: boolean; time: number }> {
    const start = Date.now();
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      return { url, status: response.status, ok: response.ok, time: Date.now() - start };
    } catch {
      return { url, status: 0, ok: false, time: Date.now() - start };
    }
  }

  /** Validate multiple URLs concurrently */
  static async validateUrls(urls: string[], concurrency = 5) {
    const results: Awaited<ReturnType<typeof this.validateUrl>>[] = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch.map(url => this.validateUrl(url)));
      batchResults.forEach(r => {
        if (r.status === 'fulfilled') results.push(r.value);
      });
    }

    return {
      total: results.length,
      ok: results.filter(r => r.ok).length,
      broken: results.filter(r => !r.ok).length,
      results,
    };
  }

  /** Scan all published tour page URLs */
  static async scanTourLinks() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

    const tours = await prisma.tour.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    });

    const urls = tours.map(t => `${siteUrl}/tour/${t.slug}`);
    return this.validateUrls(urls);
  }

  /** Scan critical site pages */
  static async scanCriticalPages() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

    const criticalPaths = [
      '/', '/search', '/visa', '/deals/flash-sale', '/about', '/contact',
      '/faq', '/privacy-policy', '/terms', '/sitemap.xml', '/robots.txt',
    ];

    const urls = criticalPaths.map(p => `${siteUrl}${p}`);
    return this.validateUrls(urls);
  }

  /** Full site audit */
  static async fullAudit() {
    const [critical, tours] = await Promise.all([
      this.scanCriticalPages(),
      this.scanTourLinks(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      critical: { ...critical, results: critical.results.filter(r => !r.ok) },
      tours: { total: tours.total, ok: tours.ok, broken: tours.broken, brokenList: tours.results.filter(r => !r.ok) },
      status: critical.broken === 0 && tours.broken === 0 ? 'HEALTHY' : 'DEGRADED',
    };
  }
}
