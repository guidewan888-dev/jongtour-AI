import { RawDeparture, RawTour } from './SupplierAdapter';

export class Normalizer {
  /**
   * Maps raw tour data into Jongtour's Tour schema format
   */
  static mapTour(supplierId: string, rawData: RawTour) {
    // In a real implementation, we would extract fields dynamically 
    // based on the supplierId or let the Adapter normalize it partially.
    // For MVP, we provide a generic mapping structure.
    
    let destination = 'Unknown';
    let durationDays = 1;
    let price = 0;
    let imageUrl = null;
    let description = null;
    let airlineCode = null;
    let pdfUrl = null;
    let itinerary = null;
    let flights = null;

    if (supplierId === 'SUP_LETGO') {
      destination = rawData.payload?.CountryName || rawData.payload?.Locations?.[0] || 'Unknown';
      durationDays = parseInt(rawData.payload?.Days) || 1;
      price = rawData.payload?.Periods?.[0]?.Price || 0;
      imageUrl = rawData.payload?.URLImage || null;
      description = rawData.payload?.Highlight || null;
      airlineCode = rawData.payload?.Periods?.[0]?.AirlineCode || null;
      pdfUrl = rawData.payload?.FilePDF || null;
      itinerary = rawData.payload?.Itinerary ? JSON.parse(JSON.stringify(rawData.payload.Itinerary)) : null;
      flights = rawData.payload?.Flights ? JSON.parse(JSON.stringify(rawData.payload.Flights)) : null;
    } else if (supplierId === 'SUP_GO365') {
      destination = Array.isArray(rawData.payload?.Destinations) && rawData.payload.Destinations.length > 0 
        ? rawData.payload.Destinations[0] 
        : 'Unknown';
      durationDays = parseInt(rawData.payload?.DurationDay) || 1;
      price = rawData.payload?.MinPrice || 0;
      imageUrl = rawData.payload?.ImageThumb || null;
      description = rawData.payload?.Description || null;
    } else {
      // TourFactory and CheckInGroup have identical schema
      destination = Array.isArray(rawData.payload?.countries) && rawData.payload.countries.length > 0 
        ? rawData.payload.countries[0].name 
        : 'Unknown';
      durationDays = parseInt(rawData.payload?.day) || 1;
      price = rawData.payload?.price || 0;
      imageUrl = rawData.payload?.banner || null;
      description = rawData.payload?.highlight || null;
      airlineCode = rawData.payload?.vehicle || null;
      pdfUrl = rawData.payload?.pdf || null;
      itinerary = rawData.payload?.plans ? JSON.parse(JSON.stringify(rawData.payload.plans)) : null;
      flights = null; // No flights in CheckIn/TF root level
    }

    return {
      supplierId,
      externalTourId: rawData.externalId,
      providerId: rawData.externalId,
      title: rawData.name,
      destination,
      durationDays,
      price,
      imageUrl,
      description,
      airlineCode,
      pdfUrl,
      itinerary,
      flights,
      isActive: true,
    };
  }

  /**
   * Maps raw departure data into Jongtour's TourDeparture schema format
   */
  static mapDepartures(supplierId: string, tourId: string, rawData: RawTour) {
    const departures: any[] = [];
    const payload = rawData.payload || {};

    if (supplierId === 'SUP_LETGO') {
      const periods = payload.Periods || [];
      for (const p of periods) {
        if (!p.PeriodID || !p.PeriodStartDate || !p.PeriodEndDate) continue;
        departures.push({
          id: `zego_period_${p.PeriodID}`,
          tourId: tourId,
          externalDepartureId: p.PeriodID.toString(),
          startDate: new Date(p.PeriodStartDate).toISOString(),
          endDate: new Date(p.PeriodEndDate).toISOString(),
          price: p.Price || 0,
          childPrice: p.Price_Child || null,
          singleRoomPrice: p.Price_Single_Bed || null,
          depositPrice: p.Deposit || null,
          totalSeats: p.GroupSize || 0,
          availableSeats: p.Seat || 0,
          status: p.Seat > 0 ? "AVAILABLE" : "FULL",
        });
      }
    } else if (supplierId === 'SUP_GO365') {
      // Logic for Go365 departures would be mapped if fetched deeply.
      // Assuming departures are not inside payload for getTours, they come from getDepartures.
      // But SyncManager maps from `rawTours` which means we might need a deep sync later.
      // Mock for now.
    } else {
      // TourFactory and CheckInGroup
      const periods = payload.periods || [];
      const prefix = supplierId === 'SUP_TOURFACTORY' ? 'tourfac' : 'checkin';
      for (const p of periods) {
        if (!p.id || !p.start || !p.end) continue;
        departures.push({
          id: `${prefix}_period_${p.id}`,
          tourId: tourId,
          externalDepartureId: p.id.toString(),
          startDate: new Date(p.start).toISOString(),
          endDate: new Date(p.end).toISOString(),
          price: p.price || 0,
          childPrice: p.priceChild || null,
          singleRoomPrice: p.priceSingleRoomAdd || null,
          depositPrice: p.deposit || null,
          totalSeats: p.seat || 0,
          availableSeats: p.available || 0,
          status: p.available > 0 ? "AVAILABLE" : "FULL",
        });
      }
    }

    return departures;
  }
}
