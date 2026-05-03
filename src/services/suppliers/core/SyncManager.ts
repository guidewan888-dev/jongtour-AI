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

// Simple factory pattern concept
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

  /**
   * Helper for exponential backoff retry
   */
  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        // Wait 5s, 15s, 45s...
        const waitTime = Math.pow(3, attempt) * 1000 + 2000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error("Max retries exceeded");
  }

  /**
   * Main synchronization job for a single supplier
   */
  async syncSupplierTours(supplierId: string): Promise<void> {
    console.log(`[SyncManager] Starting full sync for ${supplierId}`);
    
    // 1. Create a Sync Log
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
      
      // 2. Fetch with Retry Logic
      const rawTours = await this.withRetry(() => adapter.getTours());

      // 3. Pre-fetch existing records to map IDs for fast upserting
      const expectedSource = supplierId === 'SUP_LETGO' ? 'API_ZEGO' : (supplierId === 'SUP_TOURFACTORY' ? 'TOUR_FACTORY' : 'CHECKIN');
      const { data: existingTours } = await this.supabase
        .from('Tour')
        .select('id, providerId')
        .eq('source', expectedSource);
      const existingTourMap = new Map((existingTours || []).map(t => [t.providerId, t.id]));

      const { data: existingRaw } = await this.supabase
        .from('TourRawData')
        .select('id, externalTourId')
        .eq('supplierId', supplierId);
      const existingRawMap = new Map((existingRaw || []).map(r => [r.externalTourId, r.id]));

      // 4. Prepare data arrays
      const rawDataToUpsert: any[] = [];
      const toursToUpsert: any[] = [];
      const departuresToUpsert: any[] = [];

      for (const raw of rawTours) {
        try {
          const rawId = existingRawMap.get(raw.externalId) || generateId();
          rawDataToUpsert.push({
            id: rawId,
            supplierId,
            externalTourId: raw.externalId,
            rawPayload: raw.payload,
            syncStatus: 'PROCESSED',
            updatedAt: new Date().toISOString()
          });

          const tourId = existingTourMap.get(raw.externalId) || generateId();
          const normalized = Normalizer.mapTour(supplierId, raw);
          
          toursToUpsert.push({
            id: tourId,
            source: supplierId === 'SUP_LETGO' ? 'API_ZEGO' : (supplierId === 'SUP_TOURFACTORY' ? 'TOUR_FACTORY' : 'CHECKIN'),
            providerId: raw.externalId,
            title: normalized.title,
            destination: normalized.destination,
            durationDays: normalized.durationDays,
            price: normalized.price,
            imageUrl: normalized.imageUrl,
            description: normalized.description,
            airlineCode: normalized.airlineCode,
            pdfUrl: normalized.pdfUrl,
            itinerary: normalized.itinerary,
            flights: normalized.flights,
            updatedAt: new Date().toISOString()
          });

          const deps = Normalizer.mapDepartures(supplierId, tourId, raw);
          if (deps && deps.length > 0) {
            departuresToUpsert.push(...deps);
          }
        } catch (itemError) {
          console.error(`Failed to map tour ${raw.externalId}: `, itemError);
        }
      }

      // 5. Bulk Upsert execution (in chunks of 100 to prevent payload too large errors)
      const batchSize = 100;
      
      const upsertChunks = async (table: string, data: any[]) => {
        for (let i = 0; i < data.length; i += batchSize) {
          const chunk = data.slice(i, i + batchSize);
          const { error } = await this.supabase.from(table).upsert(chunk);
          if (error) throw new Error(`Bulk upsert failed on ${table}: ${error.message}`);
        }
      };

      await upsertChunks('TourRawData', rawDataToUpsert);
      await upsertChunks('Tour', toursToUpsert);
      await upsertChunks('TourDeparture', departuresToUpsert);

      // 6. Complete Log
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
      
      // Update Log to FAILED
      await this.supabase
        .from('ApiSyncLog')
        .update({
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error'
        })
        .eq('id', syncLog.id);

      // TODO: Trigger Notification to Admin (LINE/Email)
    }
  }
}
