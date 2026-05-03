import { SupplierAdapter } from './SupplierAdapter';
import { Normalizer } from './Normalizer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Simple ID generator for Prisma cuid equivalents
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 25);
  }
  return 'c' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
};

import { LetgoAdapter } from '../adapters/LetgoAdapter';
import { CheckinAdapter } from '../adapters/CheckinAdapter';
import { TourFactoryAdapter } from '../adapters/TourFactoryAdapter';
import { Go365Adapter } from '../adapters/Go365Adapter';

export class AdapterFactory {
  static adapters: Record<string, SupplierAdapter> = {};

  static register(adapter: SupplierAdapter) {
    this.adapters[adapter.supplierId] = adapter;
  }

  static getAdapter(supplierId: string): SupplierAdapter {
    const adapter = this.adapters[supplierId];
    if (!adapter) throw new Error(`No adapter found for supplier: ${supplierId}`);
    return adapter;
  }
}

// Auto-register available adapters
AdapterFactory.register(new LetgoAdapter());
AdapterFactory.register(new CheckinAdapter());
AdapterFactory.register(new TourFactoryAdapter());
AdapterFactory.register(new Go365Adapter());

export class SyncManager {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        const waitTime = Math.pow(3, attempt) * 1000 + 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error("Max retries exceeded");
  }

  async syncSupplierTours(supplierId: string): Promise<void> {
    console.log(`[SyncManager] Starting full sync for ${supplierId}`);
    
    const syncLogId = generateId();
    const { data: syncLog, error: logError } = await this.supabase
      .from('ApiSyncLog')
      .insert({
        id: syncLogId,
        supplierId,
        type: 'FULL_SYNC',
        status: 'RUNNING'
      })
      .select()
      .single();

    if (logError || !syncLog) {
      console.error("[SyncManager] Failed to create sync log", logError);
      throw new Error("Could not initialize sync log");
    }

    try {
      const adapter = AdapterFactory.getAdapter(supplierId);
      const rawTours = await this.withRetry(() => adapter.getTours());

      // Pre-fetch mappings
      const { data: existingTours } = await this.supabase
        .from('tours')
        .select('id, externalTourId')
        .eq('supplierId', supplierId);
      const existingTourMap = new Map((existingTours || []).map(t => [t.externalTourId, t.id]));

      const { data: existingRaw } = await this.supabase
        .from('tour_raw_sources')
        .select('id, externalTourId')
        .eq('supplierId', supplierId);
      const existingRawMap = new Map((existingRaw || []).map(r => [r.externalTourId, r.id]));

      const rawDataToUpsert: any[] = [];
      const toursToUpsert: any[] = [];
      const destinationsToUpsert: any[] = [];
      const imagesToUpsert: any[] = [];
      const departuresToUpsert: any[] = [];
      const pricesToUpsert: any[] = [];

      for (const raw of rawTours) {
        try {
          const rawId = existingRawMap.get(raw.externalId.toString()) || generateId();
          rawDataToUpsert.push({
            id: rawId,
            supplierId,
            externalTourId: raw.externalId.toString(),
            rawPayload: raw.payload || {},
            rawHash: 'N/A',
            sourceType: 'API',
            syncedAt: new Date().toISOString()
          });

          const tourId = existingTourMap.get(raw.externalId.toString()) || generateId();
          const normalized = Normalizer.mapTour(supplierId, tourId, raw);
          
          toursToUpsert.push(normalized.tour);
          destinationsToUpsert.push(...normalized.destinations);
          imagesToUpsert.push(...normalized.images);

          const depsNormalized = Normalizer.mapDepartures(supplierId, tourId, raw);
          departuresToUpsert.push(...depsNormalized.departures);
          pricesToUpsert.push(...depsNormalized.prices);
          
        } catch (itemError) {
          console.error(`Failed to map tour ${raw.externalId}: `, itemError);
        }
      }

      const batchSize = 50;
      const upsertChunks = async (table: string, data: any[]) => {
        for (let i = 0; i < data.length; i += batchSize) {
          const chunk = data.slice(i, i + batchSize);
          const { error } = await this.supabase.from(table).upsert(chunk);
          if (error) throw new Error(`Bulk upsert failed on ${table}: ${error.message}`);
        }
      };

      // Ensure Supplier exists first to avoid foreign key violations.
      // If it doesn't exist, we must create it.
      const { data: supplierData } = await this.supabase.from('suppliers').select('id').eq('id', supplierId).single();
      if (!supplierData) {
        const supplierName = supplierId === 'SUP_LETGO' ? "Let's Go" : supplierId === 'SUP_TOURFACTORY' ? "Tour Factory" : supplierId === 'SUP_GO365' ? "Go 365" : "Check In Group";
        const { error: suppError } = await this.supabase.from('suppliers').insert({
          id: supplierId,
          canonicalName: supplierName.toLowerCase().replace(/ /g, ''),
          displayName: supplierName,
          status: 'ACTIVE',
          bookingMethod: 'API',
          updatedAt: new Date().toISOString()
        });
        if (suppError) {
          console.error("Failed to insert supplier", suppError);
          throw new Error("Failed to create supplier: " + suppError.message);
        }
      }

      await upsertChunks('tour_raw_sources', rawDataToUpsert);
      await upsertChunks('tours', toursToUpsert);
      await upsertChunks('tour_destinations', destinationsToUpsert);
      await upsertChunks('tour_images', imagesToUpsert);
      await upsertChunks('departures', departuresToUpsert);
      await upsertChunks('prices', pricesToUpsert);

      await this.supabase
        .from('ApiSyncLog')
        .update({
          status: 'SUCCESS',
          recordsAdded: toursToUpsert.length
        })
        .eq('id', syncLog.id);

      console.log(`[SyncManager] Successfully synced ${toursToUpsert.length} tours for ${supplierId}`);
    } catch (error: any) {
      console.error(`[SyncManager] Critical failure for ${supplierId}: `, error);
      await this.supabase
        .from('ApiSyncLog')
        .update({
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error'
        })
        .eq('id', syncLog.id);
    }
  }
}
