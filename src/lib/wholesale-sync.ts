import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const KNOWN_ADAPTER_IDS = ['SUP_LETGO', 'SUP_TOURFACTORY', 'SUP_CHECKIN', 'SUP_GO365'] as const;

const ADAPTER_ALIAS: Record<string, string> = {
  supletgo: 'SUP_LETGO',
  letsgo: 'SUP_LETGO',
  letgo: 'SUP_LETGO',
  suptourfactory: 'SUP_TOURFACTORY',
  tourfactory: 'SUP_TOURFACTORY',
  supcheckin: 'SUP_CHECKIN',
  checkingroup: 'SUP_CHECKIN',
  checkin: 'SUP_CHECKIN',
  supgo365: 'SUP_GO365',
  go365: 'SUP_GO365',
};

type ScraperSite = {
  slug: string;
  name: string;
  syncEndpoint: string;
  syncBody: Record<string, unknown>;
};

const SCRAPER_SITES: ScraperSite[] = [
  { slug: 'worldconnection', name: 'World Connection', syncEndpoint: '/api/scraper/sync', syncBody: { site: 'worldconnection' } },
  { slug: 'itravels', name: 'iTravels Center', syncEndpoint: '/api/scraper/sync', syncBody: { site: 'itravels' } },
  { slug: 'bestintl', name: 'Best International', syncEndpoint: '/api/scraper/sync', syncBody: { site: 'bestintl' } },
  { slug: 'gs25', name: 'GS25 Travel', syncEndpoint: '/api/scraper/sync', syncBody: { site: 'gs25' } },
  { slug: 'go365', name: 'Go365 Travel', syncEndpoint: '/api/tours/go365-sync', syncBody: {} },
];

type ScraperRunRow = {
  id: string | number;
  site_name?: string | null;
  site?: string | null;
  status?: string | null;
  tours_scraped?: number | null;
  urls_scraped?: number | null;
  error_message?: string | null;
  error_log?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
};

function normalizeKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function mapToAdapterId(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (!value) continue;
    const upper = value.toUpperCase();
    if ((KNOWN_ADAPTER_IDS as readonly string[]).includes(upper)) {
      return upper;
    }
    const mapped = ADAPTER_ALIAS[normalizeKey(value)];
    if (mapped) return mapped;
  }
  return null;
}

function mapScraperStatus(status?: string | null): string {
  const s = String(status || '').toLowerCase();
  if (s === 'done' || s === 'success') return 'SUCCESS';
  if (s === 'partial' || s === 'warning') return 'SUCCESS';
  if (s === 'running' || s === 'pending') return 'RUNNING';
  if (s === 'error' || s === 'failed') return 'FAILED';
  return 'UNKNOWN';
}

function getRunSiteKey(run: ScraperRunRow): string {
  const raw = String(run.site_name || run.site || '').toLowerCase();
  const normalized = normalizeKey(raw);
  const alias: Record<string, string> = {
    worldconnection: 'worldconnection',
    oneworldtour: 'worldconnection',
    itravel: 'itravels',
    itravels: 'itravels',
    bestin: 'bestintl',
    bestinternational: 'bestintl',
    bestintl: 'bestintl',
    gs25: 'gs25',
    go365: 'go365',
  };
  return alias[normalized] || raw;
}

export async function resolveSupplierForSync(supplierInput: string) {
  const rawInput = String(supplierInput || '').trim();
  if (!rawInput) return null;

  const directAdapterId = mapToAdapterId(rawInput);
  const supplier = await prisma.supplier.findFirst({
    where: {
      OR: [
        { id: rawInput },
        { canonicalName: rawInput },
        { displayName: rawInput },
      ],
    },
    select: {
      id: true,
      canonicalName: true,
      displayName: true,
    },
  });

  const adapterSupplierId =
    mapToAdapterId(directAdapterId, supplier?.id, supplier?.canonicalName, supplier?.displayName) ||
    directAdapterId;

  if (!adapterSupplierId) {
    return null;
  }

  return {
    adapterSupplierId,
    supplierDbId: supplier?.id || adapterSupplierId,
  };
}

async function getScraperRuns(limit = 200): Promise<ScraperRunRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[wholesale-sync] scraper_runs query failed:', error.message);
    return [];
  }
  return (data || []) as ScraperRunRow[];
}

async function getScraperStatsBySite(site: string) {
  const supabase = getSupabaseAdmin();

  const [{ count: activeCount }, { count: pdfCount }] = await Promise.all([
    supabase
      .from('scraper_tours')
      .select('*', { count: 'exact', head: true })
      .eq('site', site)
      .eq('is_active', true),
    supabase
      .from('scraper_tours')
      .select('*', { count: 'exact', head: true })
      .eq('site', site)
      .eq('is_active', true)
      .not('pdf_url', 'is', null)
      .neq('pdf_url', ''),
  ]);

  return {
    activeCount: activeCount || 0,
    pdfCount: pdfCount || 0,
  };
}

export async function getWholesaleStatusData() {
  const [suppliers, apiLogs, scraperRuns] = await Promise.all([
    prisma.supplier.findMany({
      select: {
        id: true,
        canonicalName: true,
        displayName: true,
        status: true,
        _count: { select: { tours: true } },
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: { startedAt: true, status: true, totalRecords: true, errorMessage: true },
        },
      },
      orderBy: { displayName: 'asc' },
    }),
    prisma.apiSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    getScraperRuns(200),
  ]);

  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  const supplierByAdapterId = new Map<string, (typeof suppliers)[number]>();
  for (const supplier of suppliers) {
    const adapterId = mapToAdapterId(supplier.id, supplier.canonicalName, supplier.displayName);
    if (adapterId) supplierByAdapterId.set(adapterId, supplier);
  }

  const apiWholesalers = suppliers.map((supplier) => {
    const adapterId = mapToAdapterId(supplier.id, supplier.canonicalName, supplier.displayName);
    const latestApiLog = adapterId
      ? apiLogs.find((log) => log.supplierId === adapterId || log.supplierId === supplier.id)
      : apiLogs.find((log) => log.supplierId === supplier.id);
    const latestSyncLog = supplier.syncLogs[0];

    return {
      id: supplier.id,
      name: supplier.displayName,
      slug: supplier.canonicalName,
      type: 'api',
      status: supplier.status === 'ACTIVE' ? 'active' : 'inactive',
      tourCount: supplier._count.tours || 0,
      pdfCount: 0,
      pdfCoverage: null as number | null,
      lastSync: (latestSyncLog?.startedAt || latestApiLog?.createdAt || null)?.toString() || null,
      lastSyncStatus: latestSyncLog?.status || latestApiLog?.status || null,
      lastSyncRecords: latestSyncLog?.totalRecords ?? latestApiLog?.recordsAdded ?? 0,
      lastSyncError: latestSyncLog?.errorMessage || latestApiLog?.errorMessage || null,
      syncEndpoint: '/api/admin/sync',
      syncBody: { supplierId: supplier.id },
      supplierId: supplier.id,
    };
  });

  const scraperWholesalers = [];
  for (const site of SCRAPER_SITES) {
    const stats = await getScraperStatsBySite(site.slug);
    const lastRun = scraperRuns.find((run) => getRunSiteKey(run) === site.slug);
    const coverage = stats.activeCount > 0 ? Math.round((stats.pdfCount / stats.activeCount) * 100) : 0;

    scraperWholesalers.push({
      id: `scraper_${site.slug}`,
      name: site.name,
      slug: site.slug,
      type: 'scraper',
      status: stats.activeCount > 0 ? 'active' : 'inactive',
      tourCount: stats.activeCount,
      pdfCount: stats.pdfCount,
      pdfCoverage: coverage,
      lastSync: lastRun?.finished_at || lastRun?.started_at || null,
      lastSyncStatus: mapScraperStatus(lastRun?.status),
      lastSyncRecords: Number(lastRun?.urls_scraped ?? lastRun?.tours_scraped ?? 0),
      lastSyncError: lastRun?.error_log || lastRun?.error_message || null,
      syncEndpoint: site.syncEndpoint,
      syncBody: site.syncBody,
      supplierId: site.slug,
    });
  }

  const recentApiLogs = apiLogs.slice(0, 120).map((log) => {
    const matchedSupplier =
      supplierByAdapterId.get(log.supplierId) ||
      supplierById.get(log.supplierId);

    return {
      id: log.id,
      supplierId: log.supplierId,
      supplier: matchedSupplier?.displayName || log.supplierId,
      type: 'api',
      status: log.status,
      records: log.recordsAdded || 0,
      recordsUpdated: log.recordsUpdated || 0,
      error: log.errorMessage,
      time: log.createdAt.toISOString(),
    };
  });

  const recentScraperLogs = scraperRuns.slice(0, 120).map((run) => {
    const siteKey = getRunSiteKey(run);
    const siteMeta = SCRAPER_SITES.find((s) => s.slug === siteKey);

    return {
      id: run.id,
      supplierId: siteKey || 'scraper',
      supplier: siteMeta?.name || siteKey || 'scraper',
      type: 'scraper',
      status: mapScraperStatus(run.status),
      records: Number(run.urls_scraped ?? run.tours_scraped ?? 0),
      recordsUpdated: 0,
      error: run.error_log || run.error_message || null,
      time: run.finished_at || run.started_at || null,
    };
  });

  const recentLogs = [...recentApiLogs, ...recentScraperLogs]
    .filter((log) => log.time)
    .sort((a, b) => new Date(b.time as string).getTime() - new Date(a.time as string).getTime());

  const wholesalers = [...apiWholesalers, ...scraperWholesalers];
  const summary = {
    totalWholesalers: wholesalers.length,
    activeWholesalers: wholesalers.filter((w) => w.status === 'active').length,
    totalTours: wholesalers.reduce((sum, w) => sum + Number(w.tourCount || 0), 0),
    apiSuppliers: apiWholesalers.length,
    scraperSites: scraperWholesalers.length,
  };

  return { wholesalers, recentLogs, summary };
}

export async function getUnifiedErrorLogs(limit = 200) {
  const [supplierErrors, apiErrors, scraperRuns] = await Promise.all([
    prisma.supplierSyncLog.findMany({
      where: { status: 'FAILED' },
      include: { supplier: { select: { displayName: true } } },
      orderBy: { startedAt: 'desc' },
      take: limit,
    }),
    prisma.apiSyncLog.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    getScraperRuns(limit),
  ]);

  const supplierNames = new Map<string, string>();
  const suppliers = await prisma.supplier.findMany({
    select: { id: true, displayName: true, canonicalName: true },
  });
  for (const supplier of suppliers) {
    supplierNames.set(supplier.id, supplier.displayName);
    const adapterId = mapToAdapterId(supplier.id, supplier.canonicalName, supplier.displayName);
    if (adapterId) supplierNames.set(adapterId, supplier.displayName);
  }

  const rows = [
    ...supplierErrors.map((log) => ({
      id: `supplier_${log.id}`,
      source: 'supplier_sync' as const,
      supplier: log.supplier?.displayName || log.supplierId,
      severity: 'critical' as const,
      message: log.errorMessage || 'Unknown sync error',
      createdAt: log.startedAt.toISOString(),
      tourCode: null as string | null,
    })),
    ...apiErrors.map((log) => ({
      id: `api_${log.id}`,
      source: 'api_sync' as const,
      supplier: supplierNames.get(log.supplierId) || log.supplierId,
      severity: 'warning' as const,
      message: log.errorMessage || 'Unknown API sync error',
      createdAt: log.createdAt.toISOString(),
      tourCode: null as string | null,
    })),
    ...scraperRuns
      .filter((run) => ['error', 'failed'].includes(String(run.status || '').toLowerCase()))
      .map((run) => {
        const siteKey = getRunSiteKey(run);
        const siteMeta = SCRAPER_SITES.find((site) => site.slug === siteKey);
        return {
          id: `scraper_${run.id}`,
          source: 'scraper_sync' as const,
          supplier: siteMeta?.name || siteKey || 'scraper',
          severity: 'info' as const,
          message: run.error_log || run.error_message || 'Scraper run failed',
          createdAt: run.finished_at || run.started_at || new Date().toISOString(),
          tourCode: null as string | null,
        };
      }),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return rows;
}
