/**
 * AISearchService — RAG Vector Search, embedding generation, and semantic tour discovery
 */
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export class AISearchService {

  /** Generate embeddings via OpenAI */
  static async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set — returning zero vector");
      return Array(1536).fill(0);
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  }

  /** Semantic search via pgvector (Supabase RPC) */
  static async semanticSearch(queryText: string, options?: { limit?: number; threshold?: number; country?: string }) {
    const { limit = 5, threshold = 0.7, country } = options || {};

    // Generate embedding for query
    const embedding = await this.generateEmbedding(queryText);

    // Call pgvector match function
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.rpc('match_tours', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) throw error;

    // Post-filter by country if specified
    let results = data || [];
    if (country) {
      results = results.filter((r: any) =>
        r.tour_name?.toLowerCase().includes(country.toLowerCase()) ||
        r.content?.toLowerCase().includes(country.toLowerCase())
      );
    }

    return results;
  }

  /** Keyword + semantic hybrid search */
  static async hybridSearch(query: string, filters?: { country?: string; minPrice?: number; maxPrice?: number; duration?: number }) {
    // 1. Keyword search (Prisma)
    const keywordResults = await prisma.tour.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { tourName: { contains: query, mode: 'insensitive' } },
          { tourCode: { contains: query, mode: 'insensitive' } },
        ],
        ...(filters?.duration && { durationDays: filters.duration }),
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        departures: {
          where: { startDate: { gte: new Date() }, remainingSeats: { gt: 0 } },
          include: { prices: { where: { paxType: 'ADULT' }, take: 1 } },
          take: 1,
          orderBy: { startDate: 'asc' },
        },
      },
      take: 10,
    });

    // 2. Semantic search
    let semanticResults: any[] = [];
    try {
      semanticResults = await this.semanticSearch(query, { limit: 5, country: filters?.country });
    } catch {
      // Graceful fallback if vector search unavailable
    }

    // 3. Merge + deduplicate
    const keywordIds = new Set(keywordResults.map(t => t.id));
    const merged = [
      ...keywordResults.map(t => ({
        id: t.id,
        tourCode: t.tourCode,
        tourName: t.tourName,
        slug: t.slug,
        coverImage: t.images[0]?.imageUrl || null,
        price: t.departures[0]?.prices[0]?.sellingPrice || null,
        nextDeparture: t.departures[0]?.startDate || null,
        source: 'keyword' as const,
        score: 1.0,
      })),
      ...semanticResults
        .filter((r: any) => !keywordIds.has(r.tour_id))
        .map((r: any) => ({
          id: r.tour_id,
          tourCode: r.tour_code || '',
          tourName: r.tour_name || '',
          slug: r.slug || '',
          coverImage: null,
          price: null,
          nextDeparture: null,
          source: 'semantic' as const,
          score: r.similarity || 0,
        })),
    ];

    // Apply price filter
    let filtered = merged;
    if (filters?.minPrice || filters?.maxPrice) {
      filtered = merged.filter(t => {
        if (!t.price) return true;
        if (filters.minPrice && t.price < filters.minPrice) return false;
        if (filters.maxPrice && t.price > filters.maxPrice) return false;
        return true;
      });
    }

    return { results: filtered, total: filtered.length, keywordCount: keywordResults.length, semanticCount: semanticResults.length };
  }

  /** Build search text for a tour (for embedding) */
  static buildSearchText(tour: { tourName: string; tourCode: string; highlights?: string[]; itinerary?: any[] }) {
    const parts = [tour.tourName, tour.tourCode];
    if (tour.highlights) parts.push(...tour.highlights);
    if (tour.itinerary) {
      tour.itinerary.forEach((day: any) => {
        if (day.title) parts.push(day.title);
        if (day.description) parts.push(day.description);
      });
    }
    return parts.join(' ').substring(0, 8000); // OpenAI limit
  }

  /** Generate and store embeddings for all tours */
  static async generateAllEmbeddings() {
    const tours = await prisma.tour.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, tourName: true, tourCode: true },
    });

    let processed = 0;
    let errors = 0;

    for (const tour of tours) {
      try {
        const text = this.buildSearchText(tour);
        const embedding = await this.generateEmbedding(text);

        // Store via Supabase (pgvector)
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabase.from('tour_embeddings').upsert({
          tour_id: tour.id,
          content: text,
          embedding,
          updated_at: new Date().toISOString(),
        });

        processed++;
      } catch {
        errors++;
      }
    }

    return { processed, errors, total: tours.length };
  }
}
