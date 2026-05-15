import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const REVIEWABLE_TABLES = new Set([
  'canonical_tours',
  'tour_prices',
  'tour_seats',
  'tour_departures',
  'tour_pdfs',
  'raw_wholesale_imports',
  'wholesale_tour_mappings',
]);

const EXTRACTION_STATUS_TABLES = new Set([
  'tour_prices',
  'tour_pdfs',
  'raw_wholesale_imports',
]);

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || '').trim();
    const sb = getSupabaseAdmin();

    if (action === 'set_need_review') {
      const table = String(body.table || '').trim();
      const id = body.id;
      const needReview = Boolean(body.needReview);
      if (!REVIEWABLE_TABLES.has(table) || !id) {
        return NextResponse.json({ error: 'Invalid set_need_review payload' }, { status: 400 });
      }
      const { error } = await sb.from(table as any).update({
        need_review: needReview,
        updated_at: new Date().toISOString(),
      } as any).eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'confirm') {
      const table = String(body.table || '').trim();
      const id = body.id;
      if (!REVIEWABLE_TABLES.has(table) || !id) {
        return NextResponse.json({ error: 'Invalid confirm payload' }, { status: 400 });
      }

      if (table === 'canonical_tours') {
        const { data: blockingIssues } = await sb
          .from('sync_quality_issues')
          .select('id, issue_code, message')
          .eq('canonical_tour_id', String(id))
          .eq('resolved', false)
          .eq('severity', 'error')
          .limit(1);
        if (blockingIssues && blockingIssues.length > 0) {
          return NextResponse.json({ error: `Cannot confirm publish: ${blockingIssues[0].issue_code} - ${blockingIssues[0].message}` }, { status: 409 });
        }
      }
      if (table === 'tour_departures') {
        const { data: blockingIssues } = await sb
          .from('sync_quality_issues')
          .select('id, issue_code, message')
          .eq('departure_id', String(id))
          .eq('resolved', false)
          .eq('severity', 'error')
          .limit(1);
        if (blockingIssues && blockingIssues.length > 0) {
          return NextResponse.json({ error: `Cannot confirm departure: ${blockingIssues[0].issue_code} - ${blockingIssues[0].message}` }, { status: 409 });
        }
      }

      const payload: Record<string, any> = {
        need_review: false,
        updated_at: new Date().toISOString(),
      };
      if (EXTRACTION_STATUS_TABLES.has(table)) {
        payload.extraction_status = 'confirmed';
      }
      const { error } = await sb.from(table as any).update(payload as any).eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'remap_tour') {
      const wholesaleId = String(body.wholesaleId || '').trim();
      const sourceTourKey = String(body.sourceTourKey || '').trim();
      const canonicalTourId = String(body.canonicalTourId || '').trim();
      if (!wholesaleId || !sourceTourKey || !canonicalTourId) {
        return NextResponse.json({ error: 'Invalid remap_tour payload' }, { status: 400 });
      }

      const { data: canonicalRows, error: canonicalError } = await sb
        .from('canonical_tours')
        .select('id')
        .eq('id', canonicalTourId)
        .limit(1);
      if (canonicalError || !canonicalRows?.length) {
        return NextResponse.json({ error: canonicalError?.message || 'canonical_tour_id not found' }, { status: 404 });
      }

      const { error } = await sb
        .from('wholesale_tour_mappings')
        .update({
          canonical_tour_id: canonicalTourId,
          need_review: false,
          updated_at: new Date().toISOString(),
        })
        .eq('wholesale_id', wholesaleId)
        .eq('source_tour_key', sourceTourKey);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Action failed' }, { status: 500 });
  }
}
