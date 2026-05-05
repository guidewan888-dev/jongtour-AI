import { NextRequest, NextResponse } from 'next/server';
import { AISearchService } from '@/services/core/AISearchService';
import { TourService } from '@/services/core/TourService';
import { analytics } from '@/hooks/useAnalytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=ทัวร์ญี่ปุ่น&country=japan&min=20000&max=80000&duration=5&page=1
 * Hybrid keyword + semantic search
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const country = searchParams.get('country') || undefined;
    const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : undefined;
    const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : undefined;
    const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
    const page = Number(searchParams.get('page') || '1');
    const mode = searchParams.get('mode') || 'hybrid'; // 'keyword' | 'semantic' | 'hybrid'

    if (!q && !country) {
      return NextResponse.json({ error: 'Query or country required' }, { status: 400 });
    }

    let data: any;

    if (mode === 'semantic' && q) {
      // Pure semantic search
      const results = await AISearchService.semanticSearch(q, { limit: 10, country });
      data = { results, total: results.length, mode: 'semantic' };
    } else if (mode === 'keyword' || !q) {
      // Pure keyword/filter search
      const results = await TourService.searchTours({
        keyword: q || undefined,
        country,
        minPrice,
        maxPrice,
        duration,
        page,
        limit: 20,
      });
      data = { ...results, mode: 'keyword' };
    } else {
      // Hybrid (default)
      const results = await AISearchService.hybridSearch(q, { country, minPrice, maxPrice, duration });
      data = { ...results, mode: 'hybrid' };
    }

    return NextResponse.json({ success: true, query: q, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
