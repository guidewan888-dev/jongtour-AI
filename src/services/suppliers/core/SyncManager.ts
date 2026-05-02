import { SupplierAdapter } from './SupplierAdapter';
import { Normalizer } from './Normalizer';
import { PrismaClient } from '@prisma/client';

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
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient(); // Using local instance for background job stability
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
    const syncLog = await this.db.apiSyncLog.create({
      data: {
        supplierId,
        type: 'FULL_SYNC',
        status: 'RUNNING',
      }
    });

    try {
      const adapter = AdapterFactory.getAdapter(supplierId);
      
      // 2. Fetch with Retry Logic
      const rawTours = await this.withRetry(() => adapter.getTours());
      let successCount = 0;

      for (const raw of rawTours) {
        try {
          // 3. Save Raw Data as audit trail and fallback
          await this.db.tourRawData.upsert({
            where: {
              supplierId_externalTourId: {
                supplierId,
                externalTourId: raw.externalId
              }
            },
            update: { rawPayload: raw.payload, syncStatus: 'PROCESSED' },
            create: {
              supplierId,
              externalTourId: raw.externalId,
              rawPayload: raw.payload,
              syncStatus: 'PROCESSED'
            }
          });

          // 4. Normalize Data
          const normalized = Normalizer.mapTour(supplierId, raw);

          // 5. Upsert to main Tour table
          // Note: using providerId as the external reference mapping field
          const tour = await this.db.tour.findFirst({
            where: { supplierId, providerId: raw.externalId }
          });

          if (tour) {
            await this.db.tour.update({
              where: { id: tour.id },
              data: {
                title: normalized.title,
                destination: normalized.destination,
                price: normalized.price,
                // ... other updatable fields
              }
            });
          } else {
            await this.db.tour.create({
              data: {
                source: 'API_ZEGO', // Needs dynamic mapping based on supplier
                ...normalized
              }
            });
          }

          successCount++;
        } catch (itemError) {
          console.error(`Failed to process tour ${raw.externalId}: `, itemError);
          // Update raw data status
          await this.db.tourRawData.updateMany({
            where: { supplierId, externalTourId: raw.externalId },
            data: { syncStatus: 'FAILED' }
          });
        }
      }

      // 6. Complete Log
      await this.db.apiSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'SUCCESS',
          recordsAdded: successCount
        }
      });

      console.log(`[SyncManager] Successfully synced ${successCount} tours for ${supplierId}`);
    } catch (error: any) {
      console.error(`[SyncManager] Critical failure for ${supplierId}: `, error);
      
      // Update Log to FAILED
      await this.db.apiSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error'
        }
      });

      // TODO: Trigger Notification to Admin (LINE/Email)
    } finally {
      await this.db.$disconnect();
    }
  }
}
