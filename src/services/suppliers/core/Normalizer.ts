import { RawDeparture, RawTour } from './SupplierAdapter';

export class Normalizer {
  private static asNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private static pushPrice(params: {
    prices: any[];
    depId: string;
    suffix: string;
    paxType: string;
    sellingPrice: number;
    netPrice?: number;
  }) {
    const selling = this.asNumber(params.sellingPrice);
    if (selling <= 0) return;

    const net = this.asNumber(params.netPrice);
    params.prices.push({
      id: `pr_${params.suffix}_${params.depId}`,
      departureId: params.depId,
      paxType: params.paxType,
      sellingPrice: selling,
      netPrice: net > 0 ? net : selling,
      currency: "THB",
      updatedAt: new Date().toISOString()
    });
  }

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
        const totalSeatsRaw = this.asNumber(p.GroupSize || p.group || p.seat);
        const hasRemaining =
          (p.Seat !== null && p.Seat !== undefined && p.Seat !== '')
          || (p.available !== null && p.available !== undefined && p.available !== '');
        const remainingFromPayload = hasRemaining ? this.asNumber(p.Seat ?? p.available) : null;
        const booked = this.asNumber(p.Book || p.join || p.booked);
        const totalSeats = totalSeatsRaw > 0 ? totalSeatsRaw : (remainingFromPayload && remainingFromPayload > 0 ? remainingFromPayload : 0);
        let remainingSeats = remainingFromPayload;

        if (remainingSeats === null) {
          remainingSeats = totalSeats > 0 ? Math.max(totalSeats - booked, 0) : 0;
        }
        if (totalSeats > 0) {
          remainingSeats = Math.min(Math.max(remainingSeats, 0), totalSeats);
        }

        const statusRaw = String(p.PeriodStatus || p.status || '').toLowerCase();
        const isClosed = statusRaw.includes('close') || statusRaw.includes('full') || statusRaw.includes('cancel');

        departures.push({
          id: depId,
          tourId,
          supplierId,
          externalDepartureId: p.PeriodID.toString(),
          startDate: new Date(p.PeriodStartDate).toISOString(),
          endDate: new Date(p.PeriodEndDate).toISOString(),
          totalSeats,
          remainingSeats,
          status: isClosed ? "FULL" : (remainingSeats > 0 ? "AVAILABLE" : "FULL"),
          updatedAt: new Date().toISOString()
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'ad',
          paxType: "ADULT",
          sellingPrice: p.Price,
          netPrice: p.Price_Agency || p.Price
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'ch',
          paxType: "CHILD",
          sellingPrice: p.Price_Child || p.Price_ChildNB || p.Price_Child_NB,
          netPrice: p.Price_Child_Agency || p.Price_Child
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'inf',
          paxType: "INFANT",
          sellingPrice: p.Price_Infant,
          netPrice: p.Price_Infant_Agency || p.Price_Infant
        });

        // Single supplement and deposit are stored as dedicated pax types
        this.pushPrice({
          prices,
          depId,
          suffix: 'si',
          paxType: "SINGLE_SUPP",
          sellingPrice: p.Price_Single_Bed || p.Price_Single || p.PriceForOne
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'dp',
          paxType: "DEPOSIT",
          sellingPrice: p.Deposit || p.Deposit_End
        });
      }
    } else if (supplierId === 'SUP_GO365') {
      const periods = payload.periods || payload.Periods || [];
      for (const p of periods) {
        const depExternalId = p.period_id || p.id;
        const start = p.period_date || p.start || p.startDate;
        const end = p.period_back || p.end || p.endDate;
        if (!depExternalId || !start || !end) continue;

        const depId = `${prefix}_dep_${depExternalId}`;
        const totalSeats = this.asNumber(p.period_total || p.period_quota || p.totalSeats || p.seat);
        const remainingSeats = this.asNumber(p.period_available || p.available || p.seats_left);
        const statusRaw = String(p.status || p.period_status || '').toLowerCase();
        const isOpen = p.period_visible === 2 || statusRaw.includes('open') || statusRaw.includes('available') || remainingSeats > 0;

        departures.push({
          id: depId,
          tourId,
          supplierId,
          externalDepartureId: depExternalId.toString(),
          startDate: new Date(start).toISOString(),
          endDate: new Date(end).toISOString(),
          totalSeats,
          remainingSeats,
          status: isOpen ? "AVAILABLE" : "FULL",
          updatedAt: new Date().toISOString()
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'ad',
          paxType: "ADULT",
          sellingPrice: p.period_price_start || p.period_price_min || p.price
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'si',
          paxType: "SINGLE_SUPP",
          sellingPrice: p.period_price_single || p.price_single || p.priceSingleRoomAdd
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'dp',
          paxType: "DEPOSIT",
          sellingPrice: p.period_deposit || p.deposit || p.booking_fee
        });
      }
    } else {
      // TourFactory and CheckInGroup
      const periods = payload.periods || [];
      for (const p of periods) {
        if (!p.id || !p.start || !p.end) continue;
        const depId = `${prefix}_dep_${p.id}`;
        const totalSeats = this.asNumber(p.seat || p.group || p.totalSeats);
        const remainingSeats = this.asNumber(p.available || p.seats_left || p.seatAvailable);

        departures.push({
          id: depId,
          tourId,
          supplierId,
          externalDepartureId: p.id.toString(),
          startDate: new Date(p.start).toISOString(),
          endDate: new Date(p.end).toISOString(),
          totalSeats,
          remainingSeats,
          status: remainingSeats > 0 ? "AVAILABLE" : "FULL",
          updatedAt: new Date().toISOString()
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'ad',
          paxType: "ADULT",
          sellingPrice: p.price,
          netPrice: p.netPrice || p.price
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'ch',
          paxType: "CHILD",
          sellingPrice: p.priceChild || p.price_child || p.price_childwithbed || p.priceChildNoBed || p.price_childnobed,
          netPrice: p.netPriceChild || p.priceChild || p.price
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'inf',
          paxType: "INFANT",
          sellingPrice: p.priceInfant || p.price_inf || p.price_infant
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'si',
          paxType: "SINGLE_SUPP",
          sellingPrice: p.priceSingleRoomAdd || p.priceForOne || p.price_sgl
        });

        this.pushPrice({
          prices,
          depId,
          suffix: 'dp',
          paxType: "DEPOSIT",
          sellingPrice: p.deposit || p.price_deposit || p.priceDeposit
        });
      }
    }

    return { departures, prices };
  }
}
