import { AdapterFactory } from '../core/SyncManager';
import { Normalizer } from '../core/Normalizer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function processTourDetailSync(supplierId: string, externalTourId: string) {
  try {
    const adapter = AdapterFactory.getAdapter(supplierId);
    
    // 1. Fetch detailed info and departures
    const detail = await adapter.getTourDetail(externalTourId);
    const rawDepartures = await adapter.getDepartures(externalTourId);
    
    // Check if supplier exists, create if not
    const { data: supplierData } = await supabase.from('suppliers').select('id').eq('id', supplierId).single();
    if (!supplierData) {
      const supplierName = supplierId === 'SUP_LETGO' ? "Let's Go" : supplierId === 'SUP_TOURFACTORY' ? "Tour Factory" : "Check In Group";
      await supabase.from('suppliers').insert({
        id: supplierId,
        canonicalName: supplierName.toLowerCase().replace(/ /g, ''),
        displayName: supplierName,
        status: 'ACTIVE',
        bookingMethod: 'API',
        updatedAt: new Date().toISOString()
      });
    }

    // 2. Store Raw Data for audit
    await supabase.from('tour_raw_sources').upsert({
      supplierId,
      externalTourId,
      rawPayload: { detail, departures: rawDepartures },
      rawHash: 'N/A',
      sourceType: 'API',
      syncedAt: new Date().toISOString()
    }, { onConflict: 'supplierId,externalTourId' });

    // Find existing tour to get its internal ID
    let tourId = null;
    const { data: existingTour } = await supabase
      .from('tours')
      .select('id')
      .eq('externalTourId', externalTourId)
      .eq('supplierId', supplierId)
      .single();

    tourId = existingTour?.id;
    if (!tourId) {
       tourId = 'c' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    }

    // 3. Normalize
    const normalized = Normalizer.mapTour(supplierId, tourId, detail);

    // Upsert Tour
    await supabase.from('tours').upsert(normalized.tour, { onConflict: 'id' });
    if (normalized.destinations.length > 0) await supabase.from('tour_destinations').upsert(normalized.destinations, { onConflict: 'id' });
    if (normalized.images.length > 0) await supabase.from('tour_images').upsert(normalized.images, { onConflict: 'id' });

    // 4. Handle Departures and Price History
    const fakeRawData = { ...detail, payload: { ...detail.payload, periods: rawDepartures } };
    const depsNormalized = Normalizer.mapDepartures(supplierId, tourId, fakeRawData);

    if (depsNormalized.departures.length > 0) {
      await supabase.from('departures').upsert(depsNormalized.departures, { onConflict: 'id' });
    }
    if (depsNormalized.prices.length > 0) {
      await supabase.from('prices').upsert(depsNormalized.prices, { onConflict: 'id' });
    }

  } catch (err) {
    console.error(`[Worker] Failed to process tour ${externalTourId} for ${supplierId}`, err);
    throw err;
  }
}
