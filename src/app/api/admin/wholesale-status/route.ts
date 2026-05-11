import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/wholesale-status
 * Unified status for ALL wholesalers (both API-based and scraper-based)
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ─── 1. API-based suppliers (tours table) ───
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id, canonicalName, displayName, status');

    const apiSuppliers = (suppliers || []).map(s => ({
      id: s.id,
      name: s.displayName,
      slug: s.canonicalName,
      type: 'api' as const,
      status: s.status,
    }));

    // Get tour counts per supplier
    const supplierCounts: Record<string, number> = {};
    for (const s of apiSuppliers) {
      const { count } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('supplierId', s.id)
        .eq('status', 'PUBLISHED');
      supplierCounts[s.id] = count || 0;
    }

    // ─── 2. Scraper-based sites (scraper_tours table) ───
    const scraperSites = [
      { slug: 'worldconnection', name: 'World Connection', syncEndpoint: null },
      { slug: 'itravels', name: 'iTravels Center', syncEndpoint: null },
      { slug: 'bestintl', name: 'Best International', syncEndpoint: null },
      { slug: 'gs25', name: 'GS25 Travel', syncEndpoint: null },
      { slug: 'go365', name: 'Go365 Travel', syncEndpoint: '/api/tours/go365-sync' },
    ];

    const scraperStats: Record<string, { active: number; total: number; withPdf: number }> = {};
    for (const site of scraperSites) {
      const { count: active } = await supabase
        .from('scraper_tours')
        .select('*', { count: 'exact', head: true })
        .eq('site', site.slug)
        .eq('is_active', true);

      const { count: total } = await supabase
        .from('scraper_tours')
        .select('*', { count: 'exact', head: true })
        .eq('site', site.slug);

      const { data: pdfData } = await supabase
        .from('scraper_tours')
        .select('pdf_url')
        .eq('site', site.slug)
        .eq('is_active', true);

      const withPdf = (pdfData || []).filter(t => t.pdf_url && t.pdf_url.length > 10).length;

      scraperStats[site.slug] = { active: active || 0, total: total || 0, withPdf };
    }

    // ─── 3. Last sync logs (API suppliers) ───
    const { data: apiLogs } = await supabase
      .from('ApiSyncLog')
      .select('id, supplierId, type, status, recordsAdded, errorMessage, createdAt')
      .order('createdAt', { ascending: false })
      .limit(100);

    // ─── 4. Last scraper runs ───
    const { data: scraperRuns } = await supabase
      .from('scraper_runs')
      .select('id, site_name, status, tours_scraped, started_at, finished_at, error_message')
      .order('started_at', { ascending: false })
      .limit(50);

    // ─── 5. Build unified wholesaler list ───
    const wholesalers = [
      // API suppliers
      ...apiSuppliers.map(s => {
        const lastLog = (apiLogs || []).find(l => l.supplierId === s.id);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          type: 'api',
          status: s.status === 'ACTIVE' ? 'active' : 'inactive',
          tourCount: supplierCounts[s.id] || 0,
          pdfCount: 0, // API tours don't track PDF separately
          pdfCoverage: null as number | null,
          lastSync: lastLog?.createdAt || null,
          lastSyncStatus: lastLog?.status || null,
          lastSyncRecords: lastLog?.recordsAdded || 0,
          lastSyncError: lastLog?.errorMessage || null,
          syncEndpoint: '/api/admin/sync',
          syncBody: { supplierId: s.id },
        };
      }),
      // Scraper sites
      ...scraperSites.map(site => {
        const stats = scraperStats[site.slug];
        const lastRun = (scraperRuns || []).find(r => r.site_name === site.slug);
        return {
          id: `scraper_${site.slug}`,
          name: site.name,
          slug: site.slug,
          type: 'scraper',
          status: 'active',
          tourCount: stats?.active || 0,
          pdfCount: stats?.withPdf || 0,
          pdfCoverage: stats?.active ? Math.round((stats.withPdf / stats.active) * 100) : 0,
          lastSync: lastRun?.started_at || null,
          lastSyncStatus: lastRun?.status === 'done' ? 'SUCCESS' : lastRun?.status?.toUpperCase() || null,
          lastSyncRecords: lastRun?.tours_scraped || 0,
          lastSyncError: lastRun?.error_message || null,
          syncEndpoint: site.syncEndpoint,
          syncBody: null,
        };
      }),
    ];

    // ─── 6. Recent logs (unified) ───
    const recentLogs = [
      ...(apiLogs || []).slice(0, 30).map(l => ({
        id: l.id,
        supplier: apiSuppliers.find(s => s.id === l.supplierId)?.name || l.supplierId,
        type: 'api',
        status: l.status,
        records: l.recordsAdded || 0,
        error: l.errorMessage,
        time: l.createdAt,
      })),
      ...(scraperRuns || []).slice(0, 20).map(r => ({
        id: r.id,
        supplier: scraperSites.find(s => s.slug === r.site_name)?.name || r.site_name,
        type: 'scraper',
        status: r.status === 'done' ? 'SUCCESS' : r.status?.toUpperCase() || 'UNKNOWN',
        records: r.tours_scraped || 0,
        error: r.error_message,
        time: r.started_at,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 50);

    // ─── 7. Summary stats ───
    const totalTours = wholesalers.reduce((sum, w) => sum + w.tourCount, 0);
    const totalActive = wholesalers.filter(w => w.status === 'active').length;

    return NextResponse.json({
      wholesalers,
      recentLogs,
      summary: {
        totalWholesalers: wholesalers.length,
        activeWholesalers: totalActive,
        totalTours,
        apiSuppliers: apiSuppliers.length,
        scraperSites: scraperSites.length,
      },
    });
  } catch (e: any) {
    console.error('[wholesale-status]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
