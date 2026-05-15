'use client';

import { useEffect, useState } from 'react';

type OverviewPayload = {
  summary: {
    wholesalers: Array<{ id: string; name: string; source_type: string; is_active: boolean }>;
    canonicalTourCount: number;
    mappingCount: number;
    departureCount: number;
    priceCount: number;
    seatCount: number;
    pdfCount: number;
  };
  review: {
    tours: Array<{ id: string; slug: string; title: string; updated_at: string }>;
    prices: Array<{ id: string; departure_id: string; extraction_status: string; updated_at: string }>;
    seats: Array<{ id: string; departure_id: string; updated_at: string }>;
    rawImports: Array<{ id: number; wholesale_id: string; source_tour_key: string; extraction_status: string; imported_at: string }>;
  };
  quality?: {
    summaries: Array<{
      wholesale_id: string;
      wholesale_name: string;
      generated_at: string | null;
      status: string;
      completeness_percent: number;
      total_departures: number;
      complete_departures: number;
      missing_departure_count: number;
      missing_adult_price_count: number;
      missing_deposit_count: number;
      missing_seat_count: number;
      missing_pdf_count: number;
      invalid_seat_count: number;
      report_id: string | null;
    }>;
    issues: Array<{
      id: string;
      wholesale_id: string;
      canonical_tour_id: string | null;
      departure_id: string | null;
      issue_code: string;
      severity: string;
      field_name: string;
      message: string;
      created_at: string;
      payload?: any;
    }>;
  };
  queue?: {
    pending: number;
    processing: number;
    retry: number;
    failed: number;
  };
  completeness?: {
    incompleteDepartures: Array<{
      departure_id: string;
      wholesale_id: string;
      canonical_tour_id: string | null;
      source_departure_key: string;
      departure_date: string | null;
      has_adult_price: boolean;
      has_child_with_bed_price: boolean;
      has_child_without_bed_price: boolean;
      has_infant_price: boolean;
      has_single_supplement_price: boolean;
      has_deposit_amount: boolean;
      deposit_type: string;
      has_seat_available: boolean;
      has_pdf_url: boolean;
      missing_fields: string[];
      missing_count: number;
      is_complete: boolean;
      price_source: string;
      price_extraction_status: string;
      need_review: boolean;
    }>;
  };
  logs: Array<{
    id: number;
    wholesale_id: string;
    sync_type: string;
    status: string;
    message: string;
    records_added: number;
    records_updated: number;
    records_failed: number;
    created_at: string;
  }>;
};

type ReviewItem = {
  id: string | number;
  label: string;
  table: string;
};

export default function WholesaleCentralPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [queueing, setQueueing] = useState(false);
  const [working, setWorking] = useState(false);
  const [selectedWholesale, setSelectedWholesale] = useState('');
  const [remapWholesaleId, setRemapWholesaleId] = useState('');
  const [remapSourceTourKey, setRemapSourceTourKey] = useState('');
  const [remapCanonicalTourId, setRemapCanonicalTourId] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/central-wholesale/overview?limit=50', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to load central overview');
      setData(payload);
    } catch (e: any) {
      setError(e.message || 'Failed to load central overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const runAction = async (payload: any, successMessage: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/central-wholesale/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setResultMessage(successMessage);
      await fetchOverview();
    } catch (e: any) {
      setError(e.message || 'Action failed');
    }
  };

  const runSync = async () => {
    setSyncing(true);
    setError('');
    setResultMessage('');
    try {
      const res = await fetch('/api/admin/central-wholesale/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeApi: true, includeScraper: true }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Central sync failed');
      const summary = payload.summary || {};
      setResultMessage(`Sync เสร็จ: added ${summary.recordsAdded || 0}, updated ${summary.recordsUpdated || 0}, failed ${summary.recordsFailed || 0}`);
      await fetchOverview();
    } catch (e: any) {
      setError(e.message || 'Central sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const runEnqueue = async () => {
    setQueueing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/central-wholesale/pdf-queue/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wholesalerId: selectedWholesale || undefined,
          onlyMissingPricing: true,
          force: false,
          limit: 20000,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'enqueue failed');
      setResultMessage(`Enqueue สำเร็จ: queued ${payload.queued || 0}, skipped ${payload.skipped || 0}`);
      await fetchOverview();
    } catch (e: any) {
      setError(e.message || 'enqueue failed');
    } finally {
      setQueueing(false);
    }
  };

  const runWorkerChunk = async () => {
    setWorking(true);
    setError('');
    try {
      const res = await fetch('/api/admin/central-wholesale/pdf-queue/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wholesalerId: selectedWholesale || undefined,
          batchSize: 40,
          maxRuntimeMs: 240000,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'worker failed');
      setResultMessage(`Worker เสร็จ: processed ${payload.processed || 0}, completed ${payload.completed || 0}, retry ${payload.retried || 0}, failed ${payload.failed || 0}`);
      await fetchOverview();
    } catch (e: any) {
      setError(e.message || 'worker failed');
    } finally {
      setWorking(false);
    }
  };

  const reviewTours: ReviewItem[] = (data?.review.tours || []).map((row) => ({ id: row.id, label: `${row.slug} | ${row.title}`, table: 'canonical_tours' }));
  const reviewPrices: ReviewItem[] = (data?.review.prices || []).map((row) => ({ id: row.id, label: `${row.departure_id} | ${row.extraction_status}`, table: 'tour_prices' }));
  const reviewSeats: ReviewItem[] = (data?.review.seats || []).map((row) => ({ id: row.id, label: row.departure_id, table: 'tour_seats' }));
  const reviewRaw: ReviewItem[] = (data?.review.rawImports || []).map((row) => ({ id: row.id, label: `${row.wholesale_id} | ${row.source_tour_key}`, table: 'raw_wholesale_imports' }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesale Central System</h1>
          <p className="text-sm text-slate-500 mt-1">raw import, normalize, mapping, review และ sync logs ในระบบกลาง</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedWholesale}
            onChange={(e) => setSelectedWholesale(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
          >
            <option value="">ทุก wholesaler</option>
            {(data?.summary.wholesalers || []).map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
          <button type="button" onClick={fetchOverview} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-50" disabled={loading}>Refresh</button>
          <button type="button" onClick={runEnqueue} className="px-4 py-2 rounded-lg border border-indigo-300 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 disabled:opacity-60" disabled={queueing}>
            {queueing ? 'กำลัง enqueue...' : 'Enqueue PDF Jobs'}
          </button>
          <button type="button" onClick={runWorkerChunk} className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-60" disabled={working}>
            {working ? 'กำลังประมวลผล...' : 'Run PDF Worker Chunk'}
          </button>
          <button type="button" onClick={runSync} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60" disabled={syncing}>
            {syncing ? 'กำลัง sync...' : 'Sync All to Central'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {resultMessage && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{resultMessage}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Wholesalers" value={data.summary.wholesalers.length} />
            <StatCard label="Canonical Tours" value={data.summary.canonicalTourCount} />
            <StatCard label="Mappings" value={data.summary.mappingCount} />
            <StatCard label="Departures" value={data.summary.departureCount} />
            <StatCard label="Prices" value={data.summary.priceCount} />
            <StatCard label="Seats" value={data.summary.seatCount} />
            <StatCard label="PDFs" value={data.summary.pdfCount} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Queue Pending" value={Number(data.queue?.pending || 0)} />
            <StatCard label="Queue Processing" value={Number(data.queue?.processing || 0)} />
            <StatCard label="Queue Retry" value={Number(data.queue?.retry || 0)} />
            <StatCard label="Queue Failed" value={Number(data.queue?.failed || 0)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Data Completeness by Wholesaler</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">Wholesaler</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Complete %</th>
                    <th className="text-right px-4 py-2">Departures</th>
                    <th className="text-right px-4 py-2">Missing Date</th>
                    <th className="text-right px-4 py-2">Missing Adult</th>
                    <th className="text-right px-4 py-2">Missing Deposit</th>
                    <th className="text-right px-4 py-2">Missing Seat</th>
                    <th className="text-right px-4 py-2">Missing PDF</th>
                    <th className="text-right px-4 py-2">Invalid Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.quality?.summaries || []).map((row) => (
                    <tr key={row.wholesale_id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{row.wholesale_name}</td>
                      <td className="px-4 py-2">{row.status}</td>
                      <td className="px-4 py-2 text-right">{Number(row.completeness_percent || 0).toFixed(2)}%</td>
                      <td className="px-4 py-2 text-right">{row.complete_departures}/{row.total_departures}</td>
                      <td className="px-4 py-2 text-right">{row.missing_departure_count}</td>
                      <td className="px-4 py-2 text-right">{row.missing_adult_price_count}</td>
                      <td className="px-4 py-2 text-right">{row.missing_deposit_count}</td>
                      <td className="px-4 py-2 text-right">{row.missing_seat_count}</td>
                      <td className="px-4 py-2 text-right">{row.missing_pdf_count}</td>
                      <td className="px-4 py-2 text-right">{row.invalid_seat_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Open Quality Issues</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">Time</th>
                    <th className="text-left px-4 py-2">Wholesaler</th>
                    <th className="text-left px-4 py-2">Issue</th>
                    <th className="text-left px-4 py-2">Field</th>
                    <th className="text-left px-4 py-2">Message</th>
                    <th className="text-left px-4 py-2">Departure</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.quality?.issues || []).map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{new Date(row.created_at).toLocaleString('th-TH')}</td>
                      <td className="px-4 py-2">{row.wholesale_id}</td>
                      <td className="px-4 py-2">{row.issue_code}</td>
                      <td className="px-4 py-2">{row.field_name}</td>
                      <td className="px-4 py-2">{row.message}</td>
                      <td className="px-4 py-2">{row.departure_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Incomplete Departures (Field-level)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">Wholesale</th>
                    <th className="text-left px-4 py-2">Departure</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-right px-4 py-2">Missing Count</th>
                    <th className="text-left px-4 py-2">Missing Fields</th>
                    <th className="text-left px-4 py-2">Price Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.completeness?.incompleteDepartures || []).map((row) => (
                    <tr key={row.departure_id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-2">{row.wholesale_id}</td>
                      <td className="px-4 py-2 font-mono text-xs">{row.source_departure_key || row.departure_id}</td>
                      <td className="px-4 py-2">{row.departure_date || '-'}</td>
                      <td className="px-4 py-2 text-right">{row.missing_count}</td>
                      <td className="px-4 py-2">{row.missing_fields.join(', ') || '-'}</td>
                      <td className="px-4 py-2">{row.price_source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ReviewCard title="Need Review: Tours" items={reviewTours} onConfirm={(item) => runAction({ action: 'confirm', table: item.table, id: item.id }, 'Confirm tour สำเร็จ')} onNeedReview={(item) => runAction({ action: 'set_need_review', table: item.table, id: item.id, needReview: true }, 'Mark need_review สำเร็จ')} />
            <ReviewCard title="Need Review: Prices" items={reviewPrices} onConfirm={(item) => runAction({ action: 'confirm', table: item.table, id: item.id }, 'Confirm price สำเร็จ')} onNeedReview={(item) => runAction({ action: 'set_need_review', table: item.table, id: item.id, needReview: true }, 'Mark need_review สำเร็จ')} />
            <ReviewCard title="Need Review: Seats" items={reviewSeats} onConfirm={(item) => runAction({ action: 'confirm', table: item.table, id: item.id }, 'Confirm seat สำเร็จ')} onNeedReview={(item) => runAction({ action: 'set_need_review', table: item.table, id: item.id, needReview: true }, 'Mark need_review สำเร็จ')} />
            <ReviewCard title="Need Review: Raw Imports" items={reviewRaw} onConfirm={(item) => runAction({ action: 'confirm', table: item.table, id: item.id }, 'Confirm raw import สำเร็จ')} onNeedReview={(item) => runAction({ action: 'set_need_review', table: item.table, id: item.id, needReview: true }, 'Mark need_review สำเร็จ')} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="font-semibold text-slate-800">Manual Remap Tour</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={remapWholesaleId} onChange={(e) => setRemapWholesaleId(e.target.value)} placeholder="wholesale_id" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={remapSourceTourKey} onChange={(e) => setRemapSourceTourKey(e.target.value)} placeholder="source_tour_key" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={remapCanonicalTourId} onChange={(e) => setRemapCanonicalTourId(e.target.value)} placeholder="canonical_tour_id (uuid)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => runAction({ action: 'remap_tour', wholesaleId: remapWholesaleId, sourceTourKey: remapSourceTourKey, canonicalTourId: remapCanonicalTourId }, 'Remap tour สำเร็จ')} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:opacity-90">Remap</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Recent Sync Logs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">Time</th>
                    <th className="text-left px-4 py-2">Wholesale</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Added</th>
                    <th className="text-right px-4 py-2">Updated</th>
                    <th className="text-right px-4 py-2">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{new Date(row.created_at).toLocaleString('th-TH')}</td>
                      <td className="px-4 py-2">{row.wholesale_id || '-'}</td>
                      <td className="px-4 py-2">{row.sync_type}</td>
                      <td className="px-4 py-2">{row.status}</td>
                      <td className="px-4 py-2 text-right">{row.records_added}</td>
                      <td className="px-4 py-2 text-right">{row.records_updated}</td>
                      <td className="px-4 py-2 text-right">{row.records_failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value.toLocaleString()}</div>
    </div>
  );
}

function ReviewCard({
  title,
  items,
  onConfirm,
  onNeedReview,
}: {
  title: string;
  items: ReviewItem[];
  onConfirm: (item: ReviewItem) => void;
  onNeedReview: (item: ReviewItem) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">{title}</div>
      <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-sm text-slate-400">ไม่มีรายการ</div>
        ) : (
          items.map((item, idx) => (
            <div key={`${title}-${idx}`} className="text-sm text-slate-600 flex items-center justify-between gap-2">
              <span>{item.label}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onConfirm(item)} className="px-2 py-1 rounded border border-emerald-300 text-emerald-700 text-xs">confirm</button>
                <button type="button" onClick={() => onNeedReview(item)} className="px-2 py-1 rounded border border-amber-300 text-amber-700 text-xs">need_review</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
