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
      let successCount = 0;

      for (const raw of rawTours) {
        try {
          // 3. Save Raw Data as audit trail and fallback
          // First check if it exists for upsert behavior with Supabase without an ID
          const { data: existingRaw } = await this.supabase
            .from('TourRawData')
            .select('id')
            .eq('supplierId', supplierId)
            .eq('externalTourId', raw.externalId)
            .single();

          let rawError;
          if (existingRaw) {
            const { error } = await this.supabase
              .from('TourRawData')
              .update({
                rawPayload: raw.payload,
                syncStatus: 'PROCESSED',
                updatedAt: new Date().toISOString()
              })
              .eq('id', existingRaw.id);
            rawError = error;
          } else {
            const { error } = await this.supabase
              .from('TourRawData')
              .insert({
                id: generateId(),
                supplierId,
                externalTourId: raw.externalId,
                rawPayload: raw.payload,
                syncStatus: 'PROCESSED',
                updatedAt: new Date().toISOString()
              });
            rawError = error;
          }

          if (rawError) throw rawError;

          // 4. Normalize Data
          const normalized = Normalizer.mapTour(supplierId, raw);

          // 5. Upsert to main Tour table
          const { data: existingTour } = await this.supabase
            .from('Tour')
            .select('id')
            .eq('supplierId', supplierId)
            .eq('providerId', raw.externalId)
            .single();

          if (existingTour) {
            await this.supabase
              .from('Tour')
              .update({
                title: normalized.title,
                destination: normalized.destination,
                price: normalized.price,
                updatedAt: new Date().toISOString()
              })
              .eq('id', existingTour.id);
          } else {
            await this.supabase
              .from('Tour')
              .insert({
                id: generateId(),
                source: supplierId === 'SUP_LETGO' ? 'API_ZEGO' : (supplierId === 'SUP_TOURFACTORY' ? 'TOUR_FACTORY' : 'CHECKIN'),
                providerId: raw.externalId,
                supplierId: supplierId,
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
          }

          successCount++;
        } catch (itemError) {
          console.error(`Failed to process tour ${raw.externalId}: `, itemError);
          // Update raw data status
          await this.supabase
            .from('TourRawData')
            .update({ syncStatus: 'FAILED', updatedAt: new Date().toISOString() })
            .eq('supplierId', supplierId)
            .eq('externalTourId', raw.externalId);
        }
      }

      // 6. Complete Log
      await this.supabase
        .from('ApiSyncLog')
        .update({
          status: 'SUCCESS',
          recordsAdded: successCount
        })
        .eq('id', syncLog.id);

      console.log(`[SyncManager] Successfully synced ${successCount} tours for ${supplierId}`);
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
