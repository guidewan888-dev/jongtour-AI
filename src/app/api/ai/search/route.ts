export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientId } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    // Rate limit: 20 searches per minute
    const clientId = getClientId(req);
    const rl = checkRateLimit(`ai-search:${clientId}`, { maxRequests: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'กรุณารอสักครู่ก่อนค้นหาอีกครั้ง' }, { status: 429 });
    }

    const { query, limit = 10 } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุคำค้นหา' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ success: false, error: 'AI Search ยังไม่พร้อมใช้งาน' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // 1. Generate embedding
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim().replace(/\n/g, ' '),
      encoding_format: 'float',
    });
    const queryEmbedding = embedResponse.data[0].embedding;

    // 2. Vector search via Supabase RPC (pgvector)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: matches, error: matchError } = await supabase.rpc('match_tours', {
      query_embedding: queryEmbedding,
      match_threshold: 0.25,
      match_count: Math.min(limit, 20),
    });

    if (matchError) {
      console.error('[AI Search] pgvector error:', matchError);
      // Fallback to keyword search
      return await keywordFallback(query, limit);
    }

    if (!matches || matches.length === 0) {
      // Fallback to keyword search
      return await keywordFallback(query, limit);
    }

    // 3. Fetch full tour data for matched IDs
    const tourIds = matches.map((m: any) => m.id);
    const tours = await prisma.tour.findMany({
      where: { id: { in: tourIds } },
      include: {
        departures: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: 3,
          include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
        },
        destinations: true,
        supplier: { select: { displayName: true } },
      },
    });

    // Sort by match order
    const sortedTours = tourIds.map((id: string) => tours.find(t => t.id === id)).filter(Boolean);

    const results = sortedTours.map((t: any) => ({
      id: t.id,
      slug: t.slug || t.id,
      tourCode: t.tourCode,
      tourName: t.tourName,
      durationDays: t.durationDays,
      durationNights: t.durationNights,
      duration: `${t.durationDays}D${t.durationNights}N`,
      destinations: t.destinations?.map((d: any) => d.country),
      supplier: t.supplier?.displayName,
      lowestPrice: t.departures?.[0]?.prices?.[0]?.sellingPrice || 0,
      nextDeparture: t.departures?.[0]?.startDate || null,
      remainingSeats: t.departures?.[0]?.remainingSeats || 0,
      similarity: matches.find((m: any) => m.id === t.id)?.similarity || 0,
    }));

    // 4. Log the search
    await prisma.aiSearchLog.create({
      data: {
        sessionId: clientId,
        queryText: query.trim(),
        extractedJson: { embedding_model: 'text-embedding-3-small' },
        resultCount: results.length,
      },
    });

    return NextResponse.json({ success: true, data: results, total: results.length });

  } catch (error: any) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** Keyword fallback when vector search returns nothing */
async function keywordFallback(query: string, limit: number) {
  const keywords = query.split(/[\s,]+/).filter(k => k.length > 1);
  const tours = await prisma.tour.findMany({
    where: {
      OR: keywords.flatMap(kw => [
        { tourName: { contains: kw, mode: 'insensitive' as const } },
        { destinations: { some: { country: { contains: kw, mode: 'insensitive' as const } } } },
      ]),
    },
    include: {
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 1,
        include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
      },
      destinations: true,
      supplier: { select: { displayName: true } },
    },
    take: limit,
  });

  const results = tours.map(t => ({
    id: t.id,
    slug: t.slug || t.id,
    tourCode: t.tourCode,
    tourName: t.tourName,
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    duration: `${t.durationDays}D${t.durationNights}N`,
    destinations: t.destinations?.map(d => d.country),
    supplier: t.supplier?.displayName,
    lowestPrice: t.departures?.[0]?.prices?.[0]?.sellingPrice || 0,
    nextDeparture: t.departures?.[0]?.startDate || null,
    remainingSeats: t.departures?.[0]?.remainingSeats || 0,
    similarity: 0,
  }));

  return NextResponse.json({ success: true, data: results, total: results.length, fallback: 'keyword' });
}
