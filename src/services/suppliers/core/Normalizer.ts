import { RawDeparture, RawTour } from './SupplierAdapter';

export class Normalizer {
  /**
   * Helper to slugify a string
   */
  static slugify(text: string) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  /**
   * Maps raw tour data into Jongtour's new relational schema format
   */
  static mapTour(supplierId: string, tourId: string, rawData: RawTour) {
    let destination = 'Unknown';
    let durationDays = 1;
    let durationNights = 1;
    let imageUrl = null;
    let description = null;
    let itineraryRaw = null;
    let flightsRaw = null;

    if (supplierId === 'SUP_LETGO') {
      destination = rawData.payload?.CountryName || rawData.payload?.Locations?.[0] || 'Unknown';
      durationDays = parseInt(rawData.payload?.Days) || 1;
      durationNights = parseInt(rawData.payload?.Nights) || Math.max(1, durationDays - 1);
      imageUrl = rawData.payload?.URLImage || null;
      description = rawData.payload?.Highlight || null;
      itineraryRaw = rawData.payload?.Itinerary ? rawData.payload.Itinerary : null;
      flightsRaw = rawData.payload?.Flights ? rawData.payload.Flights : null;
    } else if (supplierId === 'SUP_GO365') {
      destination = Array.isArray(rawData.payload?.Destinations) && rawData.payload.Destinations.length > 0 
        ? rawData.payload.Destinations[0] 
        : 'Unknown';
      durationDays = parseInt(rawData.payload?.DurationDay) || 1;
      durationNights = parseInt(rawData.payload?.DurationNight) || Math.max(1, durationDays - 1);
      imageUrl = rawData.payload?.ImageThumb || null;
      description = rawData.payload?.Description || null;
    } else {
      // TourFactory and CheckInGroup
      destination = Array.isArray(rawData.payload?.countries) && rawData.payload.countries.length > 0 
        ? rawData.payload.countries[0].name 
        : 'Unknown';
      durationDays = parseInt(rawData.payload?.day) || 1;
      durationNights = parseInt(rawData.payload?.night) || Math.max(1, durationDays - 1);
      imageUrl = rawData.payload?.banner || null;
      description = rawData.payload?.highlight || null;
      itineraryRaw = rawData.payload?.plans ? rawData.payload.plans : null;
    }

    // Generate unique slug
    let prefix = 'tour';
    if (supplierId === 'SUP_LETGO') prefix = 'zego';
    if (supplierId === 'SUP_TOURFACTORY') prefix = 'tf';
    if (supplierId === 'SUP_CHECKIN') prefix = 'ci';
    if (supplierId === 'SUP_GO365') prefix = 'go';

    const cleanTitle = (rawData.name || 'Untitled').substring(0, 50);
    const slugBase = this.slugify(cleanTitle) || 'tour';
    const slug = `${slugBase}-${prefix}-${rawData.externalId}`.substring(0, 100);
    const tourCode = `${prefix.toUpperCase()}-${rawData.externalId}`;

    const tour = {
      id: tourId,
      supplierId,
      externalTourId: rawData.externalId.toString(),
      tourCode,
      tourName: rawData.name || 'Untitled Tour',
      slug,
      tourType: "GROUP",
      durationDays,
      durationNights,
      status: "PUBLISHED",
      sourceUrl: null,
      bookingUrl: null,
      updatedAt: new Date().toISOString()
    };

    const destinations = [{
      id: `dest_${tourId}`,
      tourId,
      country: destination,
      city: null
    }];

    const images = [];
    if (imageUrl) {
      images.push({
        id: `img_${tourId}`,
        tourId,
        imageUrl,
        isCover: true
      });
    }

    return { tour, destinations, images };
  }

  /**
   * Maps raw departure data into Jongtour's new relational schema format
   */
  static mapDepartures(supplierId: string, tourId: string, rawData: RawTour) {
    const departures: any[] = [];
    const prices: any[] = [];
    const payload = rawData.payload || {};

    let prefix = 'tour';
    if (supplierId === 'SUP_LETGO') prefix = 'zego';
    if (supplierId === 'SUP_TOURFACTORY') prefix = 'tf';
    if (supplierId === 'SUP_CHECKIN') prefix = 'ci';
    if (supplierId === 'SUP_GO365') prefix = 'go';

    if (supplierId === 'SUP_LETGO') {
      const periods = payload.Periods || [];
      for (const p of periods) {
        if (!p.PeriodID || !p.PeriodStartDate || !p.PeriodEndDate) continue;
        const depId = `${prefix}_dep_${p.PeriodID}`;
        departures.push({
          id: depId,
          tourId,
          supplierId,
          externalDepartureId: p.PeriodID.toString(),
          startDate: new Date(p.PeriodStartDate).toISOString(),
          endDate: new Date(p.PeriodEndDate).toISOString(),
          totalSeats: p.GroupSize || 0,
          remainingSeats: p.Seat || 0,
          status: p.Seat > 0 ? "AVAILABLE" : "FULL",
          updatedAt: new Date().toISOString()
        });

        // Adult Price
        if (p.Price) {
          prices.push({
            id: `pr_ad_${depId}`,
            departureId: depId,
            paxType: "ADULT",
            sellingPrice: p.Price,
            netPrice: p.Price_Agency || p.Price,
            currency: "THB",
            updatedAt: new Date().toISOString()
          });
        }
        
        // Child Price
        if (p.Price_Child) {
          prices.push({
            id: `pr_ch_${depId}`,
            departureId: depId,
            paxType: "CHILD",
            sellingPrice: p.Price_Child,
            netPrice: p.Price_Child_Agency || p.Price_Child,
            currency: "THB",
            updatedAt: new Date().toISOString()
          });
        }
      }
    } else if (supplierId === 'SUP_GO365') {
      // Mock for now
    } else {
      // TourFactory and CheckInGroup
      const periods = payload.periods || [];
      for (const p of periods) {
        if (!p.id || !p.start || !p.end) continue;
        const depId = `${prefix}_dep_${p.id}`;
        departures.push({
          id: depId,
          tourId,
          supplierId,
          externalDepartureId: p.id.toString(),
          startDate: new Date(p.start).toISOString(),
          endDate: new Date(p.end).toISOString(),
          totalSeats: p.seat || 0,
          remainingSeats: p.available || 0,
          status: p.available > 0 ? "AVAILABLE" : "FULL",
          updatedAt: new Date().toISOString()
        });

        // Adult Price
        if (p.price) {
          prices.push({
            id: `pr_ad_${depId}`,
            departureId: depId,
            paxType: "ADULT",
            sellingPrice: p.price,
            netPrice: p.netPrice || p.price,
            currency: "THB",
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return { departures, prices };
  }
}
