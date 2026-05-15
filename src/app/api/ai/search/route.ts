export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientId } from '@/lib/rateLimit';
import { getCentralTourList } from '@/services/central-wholesale.service';

type AiSearchItem = {
  id: string;
  slug: string;
  tourCode: string;
  tourName: string;
  durationDays: number;
  durationNights: number;
  duration: string;
  destinations: string[];
  supplier: string;
  lowestPrice: number;
  nextDeparture: string | null;
  remainingSeats: number;
  similarity: number;
};

const normalizeText = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string): string[] => normalizeText(value).split(' ').filter((token) => token.length > 1);

function scoreTour(query: string, tour: any): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = normalizeText([
    tour.title,
    tour.code,
    tour.country,
    tour.city,
    tour.supplier,
  ].filter(Boolean).join(' '));

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
  }

  if (normalizeText(String(tour.title || '')).includes(normalizeText(query))) score += 2;
  if (normalizeText(String(tour.country || '')).includes(normalizeText(query))) score += 1;

  return score / (queryTokens.length + 3);
}

function mapToAiItem(tour: any, similarity: number): AiSearchItem {
  const durationDays = Number(tour.durationDays || 0);
  const durationNights = Number(tour.durationNights || 0);

  return {
    id: String(tour.id),
    slug: String(tour.slug || tour.id),
    tourCode: String(tour.code || ''),
    tourName: String(tour.title || ''),
    durationDays,
    durationNights,
    duration: `${durationDays}D${durationNights}N`,
    destinations: [String(tour.country || '')].filter(Boolean),
    supplier: String(tour.supplier || ''),
    lowestPrice: Number(tour.price || 0),
    nextDeparture: tour.nextDeparture && tour.nextDeparture !== 'N/A' ? String(tour.nextDeparture) : null,
    remainingSeats: Number(tour.availableSeats || 0),
    similarity,
  };
}

export async function POST(req: Request) {
  try {
    const clientId = getClientId(req);
    const rl = checkRateLimit(`ai-search:${clientId}`, { maxRequests: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'กรุณารอสักครู่ก่อนค้นหาอีกครั้ง' }, { status: 429 });
    }

    const { query, limit = 10 } = await req.json();
    const text = String(query || '').trim();
    if (text.length < 2) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุคำค้นหา' }, { status: 400 });
    }

    const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(Number(limit), 20)) : 10;
    const centralTours = await getCentralTourList({ limit: 3000 });

    const ranked = centralTours
      .map((tour: any) => ({
        tour,
        score: scoreTour(text, tour),
      }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit)
      .map((row) => mapToAiItem(row.tour, Number(row.score.toFixed(4))));

    return NextResponse.json({
      success: true,
      data: ranked,
      total: ranked.length,
      fallback: 'central_keyword_ranker',
    });
  } catch (error: any) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'AI search failed' }, { status: 500 });
  }
}
