import { prisma } from '@/lib/prisma';

export class WholesaleService {
  /**
   * Core Sync Pipeline
   * @param supplierId The exact CUID from the database
   */
  static async syncSupplier(supplierId: string) {
    console.log(`[SYNC_START] Initiating 10-step sync pipeline for supplier: ${supplierId}`);
    
    try {
      // Step 1: Supplier API Adapter
      const rawPayload = await this.fetchFromAdapter(supplierId);
      
      if (!rawPayload || rawPayload.length === 0) {
        throw new Error('Adapter returned empty payload. Aborting to prevent data deletion.');
      }

      let successCount = 0;
      let reviewCount = 0;

      for (const rawTour of rawPayload) {
        try {
          // Step 2: Raw Data Storage (Upsert)
          await prisma.tourRawSource.upsert({
            where: {
              supplierId_externalTourId: {
                supplierId: supplierId,
                externalTourId: rawTour.id
              }
            },
            create: {
              supplierId: supplierId,
              externalTourId: rawTour.id,
              rawPayload: rawTour,
              rawHash: rawTour.hash || 'NO_HASH',
              sourceType: 'API'
            },
            update: {
              rawPayload: rawTour,
              syncedAt: new Date()
            }
          });

          // Step 3: Normalization Engine
          const normalized = this.normalizeTour(rawTour);

          // Step 4: Upsert Tour
          const tour = await prisma.tour.upsert({
            where: {
              supplierId_externalTourId: {
                supplierId: supplierId,
                externalTourId: normalized.externalTourId
              }
            },
            create: {
              supplierId: supplierId,
              externalTourId: normalized.externalTourId,
              tourCode: normalized.tourCode,
              tourName: normalized.tourName,
              slug: normalized.slug,
              durationDays: normalized.durationDays,
              durationNights: normalized.durationNights,
              status: normalized.needsReview ? 'DRAFT' : 'PUBLISHED',
              bookingUrl: normalized.bookingUrl
            },
            update: {
              tourName: normalized.tourName,
              durationDays: normalized.durationDays,
              durationNights: normalized.durationNights,
              status: normalized.needsReview ? 'DRAFT' : 'PUBLISHED',
              bookingUrl: normalized.bookingUrl,
              updatedAt: new Date()
            }
          });

          if (normalized.needsReview) {
            reviewCount++;
          }

          // Step 5: Map Destination (Simplified for architecture proof)
          // In real implementation, this maps to TourDestination based on string matching

          // Step 6-7: Upsert Departure, Price, Availability
          for (const dep of normalized.departures) {
            // Using a mock unique identifier logic for departures as Prisma schema usually maps by externalId or date
            // Assuming Departure has a unique constraint on [tourId, startDate]
            await (prisma.departure as any).upsert({
              where: {
                id: dep.externalDepartureId || `${tour.id}-${dep.startDate}`
              },
              create: {
                tourId: tour.id,
                startDate: new Date(dep.startDate),
                endDate: new Date(dep.endDate),
                remainingSeats: dep.seats || 0,
                status: 'ACTIVE'
              },
              update: {
                remainingSeats: dep.seats || 0,
                updatedAt: new Date()
              }
            });
          }

          successCount++;
        } catch (err: any) {
          console.error(`[SYNC_ERROR] Failed to process tour ${rawTour.id}: `, err.message);
        }
      }

      // Step 8: Create Sync Log
      await prisma.supplierSyncLog.create({
        data: {
          supplierId: supplierId,
          syncType: 'FULL',
          status: 'SUCCESS',
          totalRecords: rawPayload.length,
          successRecords: successCount,
          failedRecords: rawPayload.length - successCount,
          finishedAt: new Date()
        }
      });

      // Step 9 & 10: Rebuild Index & Cache are triggered externally or via webhooks
      return { success: true, total: rawPayload.length, successCount, reviewCount };

    } catch (error: any) {
      console.error(`[SYNC_CRITICAL_ERROR] Pipeline failed: `, error.message);
      
      await prisma.supplierSyncLog.create({
        data: {
          supplierId: supplierId,
          syncType: 'FULL',
          status: 'FAILED',
          errorMessage: error.message,
          finishedAt: new Date()
        }
      });
      throw error;
    }
  }

  private static async fetchFromAdapter(supplierId: string): Promise<any[]> {
    // Placeholder: Real implementation will use LetgoAdapter, TourFactoryAdapter
    return [];
  }

  private static normalizeTour(raw: any) {
    // Determine if data quality is high enough for auto-publish
    const needsReview = !raw.price || !raw.destinations || raw.destinations.length === 0;
    
    return {
      externalTourId: raw.id,
      tourCode: raw.code || `CODE-${raw.id}`,
      tourName: raw.name,
      slug: `${raw.code || raw.id}-${Date.now()}`, // Ensures uniqueness safely
      durationDays: raw.days || 3,
      durationNights: raw.nights || 2,
      bookingUrl: raw.url,
      needsReview,
      departures: raw.departures || []
    };
  }
}
