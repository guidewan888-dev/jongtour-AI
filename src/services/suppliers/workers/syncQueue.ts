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
    const departures = await adapter.getDepartures(externalTourId);
    
    // 2. Store Raw Data for audit
    await supabase.from('TourRawData').upsert({
      supplierId,
      externalTourId,
      rawPayload: { detail, departures },
      syncStatus: 'PROCESSED',
      updatedAt: new Date().toISOString()
    }, { onConflict: 'supplierId,externalTourId' });

    // 3. Normalize
    const normalizedTour = Normalizer.mapTour(supplierId, detail);
    
    // Find existing tour to get its internal ID
    let tourId = null;
    const { data: existingTour } = await supabase
      .from('Tour')
      .select('id')
      .eq('externalTourId', externalTourId)
      .eq('supplierId', supplierId)
      .single();

    if (existingTour) {
      tourId = existingTour.id;
      // Upsert Tour
      await supabase.from('Tour').update({
        ...normalizedTour,
        isActive: true,
        updatedAt: new Date().toISOString()
      }).eq('id', tourId);
    } else {
      // Create new Tour
      const { data: newTour } = await supabase.from('Tour').insert({
        ...normalizedTour,
        isActive: true,
        updatedAt: new Date().toISOString()
      }).select('id').single();
      tourId = newTour?.id;
    }

    if (!tourId) return;

    // 4. Handle Departures and Price History
    for (const dep of departures) {
      // Find existing departure
      const { data: existingDep } = await supabase
        .from('TourDeparture')
        .select('id, price, netPrice')
        .eq('externalDepartureId', dep.externalId)
        .eq('tourId', tourId)
        .single();

      if (existingDep) {
        // Check for price changes
        if (existingDep.price !== dep.price || existingDep.netPrice !== dep.payload?.CostPrice) {
          await supabase.from('TourPriceHistory').insert({
            departureId: existingDep.id,
            oldPrice: existingDep.price,
            newPrice: dep.price,
            oldNetPrice: existingDep.netPrice,
            newNetPrice: dep.payload?.CostPrice || dep.payload?.net_price || null,
          });
        }
        
        // Update departure
        await supabase.from('TourDeparture').update({
          startDate: new Date(dep.startDate).toISOString(),
          endDate: new Date(dep.endDate).toISOString(),
          price: dep.price,
          availableSeats: dep.availableSeats,
          totalSeats: dep.totalSeats,
          status: dep.status,
        }).eq('id', existingDep.id);
      } else {
        // Insert new departure
        await supabase.from('TourDeparture').insert({
          tourId,
          externalDepartureId: dep.externalId,
          startDate: new Date(dep.startDate).toISOString(),
          endDate: new Date(dep.endDate).toISOString(),
          price: dep.price,
          netPrice: dep.payload?.CostPrice || dep.payload?.net_price || null,
          availableSeats: dep.availableSeats,
          totalSeats: dep.totalSeats,
          status: dep.status,
        });
      }
    }

  } catch (err) {
    console.error(`[Worker] Failed to process tour ${externalTourId} for ${supplierId}`, err);
    throw err;
  }
}
