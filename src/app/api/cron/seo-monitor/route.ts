export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * GET /api/cron/seo-monitor
 * Scheduled: daily — Ping sitemaps, check indexing health, validate schemas
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

  try {
    // 1. Ping Google sitemap
    try {
      const pingUrl = `https://www.google.com/ping?sitemap=${siteUrl}/sitemap.xml`;
      const res = await fetch(pingUrl, { method: 'GET' });
      results.sitemapPing = { status: res.status, ok: res.ok };
    } catch (err: any) {
      results.sitemapPing = { error: err.message };
    }

    // 2. Check sitemap accessibility
    try {
      const sitemapRes = await fetch(`${siteUrl}/sitemap.xml`);
      const text = await sitemapRes.text();
      const urlCount = (text.match(/<url>/g) || []).length;
      results.sitemapCheck = { status: sitemapRes.status, urlCount, ok: sitemapRes.ok };
    } catch (err: any) {
      results.sitemapCheck = { error: err.message };
    }

    // 3. Check robots.txt
    try {
      const robotsRes = await fetch(`${siteUrl}/robots.txt`);
      results.robotsCheck = { status: robotsRes.status, ok: robotsRes.ok };
    } catch (err: any) {
      results.robotsCheck = { error: err.message };
    }

    // 4. Check critical pages respond
    const criticalPages = ['/', '/search', '/visa', '/deals/flash-sale', '/about'];
    const pageChecks = await Promise.allSettled(
      criticalPages.map(async (path) => {
        const res = await fetch(`${siteUrl}${path}`, { method: 'HEAD' });
        return { path, status: res.status, ok: res.ok };
      })
    );
    results.pageHealth = pageChecks.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { path: criticalPages[i], error: 'failed' }
    );

    // 5. Check OG image generation
    try {
      const ogRes = await fetch(`${siteUrl}/og/tour/test`);
      results.ogImageGen = { status: ogRes.status, contentType: ogRes.headers.get('content-type') };
    } catch (err: any) {
      results.ogImageGen = { error: err.message };
    }

    // 6. Summary
    const issues: string[] = [];
    if (!results.sitemapCheck?.ok) issues.push('Sitemap unreachable');
    if (!results.robotsCheck?.ok) issues.push('robots.txt unreachable');
    results.pageHealth?.forEach((p: any) => {
      if (!p.ok) issues.push(`Page ${p.path} returned ${p.status}`);
    });

    results.summary = {
      timestamp: new Date().toISOString(),
      totalChecks: 5,
      issues: issues.length,
      issueList: issues,
      status: issues.length === 0 ? 'HEALTHY' : 'DEGRADED',
    };

    console.log(`[SEO Monitor] Status: ${results.summary.status} | ${issues.length} issues`);

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
