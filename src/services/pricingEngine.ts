import { getEstimatedFlightPrice } from "@/services/flightPricing";
import { getEstimatedHotelPrice } from "@/services/hotelPricing";
import { getEstimatedActivityPrice } from "@/services/activityPricing";

export interface PricingOptions {
  country: string;
  pax: number;
  durationDays: number;
  hotelStars: number;
  includeFlights: boolean;
  includeHotels: boolean;
  includeTransport: boolean;
  includeGuide: boolean;
  includeInsurance: boolean;
  airlinePreference?: "lowcost" | "fullservice"; // Deprecated
  airlineCode?: string;
  startDate?: Date; // Add startDate
  referenceTourPrice?: number; // From Tour API (Wholesale Base)
}

export async function calculateFitPrice(options: PricingOptions) {
  const {
    country,
    pax: rawPax,
    durationDays: rawDays,
    hotelStars,
    includeFlights,
    includeHotels,
    includeTransport,
    includeGuide,
    includeInsurance,
    airlinePreference,
    airlineCode,
    startDate,
    referenceTourPrice,
  } = options;

  const pax = Math.max(1, rawPax);
  const durationDays = Math.max(1, rawDays);
  
  // Use provided startDate or default to 30 days from now
  const start = startDate ? new Date(startDate) : new Date();
  if (!startDate) {
    start.setDate(start.getDate() + 30);
  }

  // 1. Region Detection (Europe/Americas vs Asia)
  const isEurope = /ยุโรป|สวิส|ฝรั่งเศส|อิตาลี|อังกฤษ|อเมริกา|ออสเตรเลีย|นิวซีแลนด์/.test(country);

  // 2. Fixed Costs (Transportation & Staff)
  let transportTotal = 0;
  if (includeTransport) {
    let transportRatePerDay = 0;
    if (pax <= 6) {
      transportRatePerDay = isEurope ? 20000 : 10000; // Van
    } else if (pax <= 20) {
      transportRatePerDay = isEurope ? 25000 : 15000; // Mini Bus
    } else {
      transportRatePerDay = isEurope ? 35000 : 25000; // Coach
    }
    transportTotal = transportRatePerDay * durationDays;
  }

  let guideTotal = 0;
  if (includeGuide) {
    const guideRatePerDay = isEurope ? 3500 : 2000;
    guideTotal = guideRatePerDay * durationDays;
  }

  const fixedCostTotal = transportTotal + guideTotal;
  const fixedCostPerPax = fixedCostTotal / pax;

  // 3. Variable Costs (Meals, Visa, Insurance)
  // Meals
  const mealRate = isEurope ? 1200 : 800;
  const numMeals = Math.max(0, (durationDays - 1) * 2); // Assume lunch & dinner
  let mealTotalPerPax = mealRate * numMeals;
  // Add 1 special meal per trip
  mealTotalPerPax += 2500;

  // Insurance
  const insurancePerPax = includeInsurance ? 500 : 0;

  // Visa
  const requiresVisa = /ยุโรป|สวิส|ฝรั่งเศส|อิตาลี|อังกฤษ|อเมริกา|ออสเตรเลีย|จีน|นิวซีแลนด์/.test(country);
  const visaPerPax = requiresVisa ? 6500 : 0;

  const variableCostPerPax = mealTotalPerPax + insurancePerPax + visaPerPax;

  // 4. Cache Costs (Flights, Hotels, Activities) OR Wholesale Reference Price
  let flightCostPerPax = 0;
  let hotelCostPerPax = 0;
  let activityCostPerPax = 0;
  let cacheCostPerPax = 0;

  if (referenceTourPrice && referenceTourPrice > 0) {
    // If we have a reference wholesale tour, use its price as the base for flight, hotel, and activities.
    // The fixedCost (van/guide) will be added on top to convert it from a 30-pax wholesale tour to a private tour.
    cacheCostPerPax = referenceTourPrice;
  } else {
    // Normal fallback dynamic calculation
    if (includeFlights) {
      const end = new Date(start);
      end.setDate(end.getDate() + durationDays);
      const flightData = await getEstimatedFlightPrice(country, start, end, airlineCode || airlinePreference);
      flightCostPerPax = flightData.price;
    }

    if (includeHotels) {
      const hotelData = await getEstimatedHotelPrice(country, hotelStars, durationDays, pax, start);
      hotelCostPerPax = hotelData.totalCost / pax;
    }

    // Activities (Assume always included if this is a tour)
    const activityData = await getEstimatedActivityPrice(country, durationDays, pax);
    activityCostPerPax = activityData.totalCost / pax;

    cacheCostPerPax = flightCostPerPax + hotelCostPerPax + activityCostPerPax;
  }

  // 5. Grand Total & Markup
  const totalCostPerPax = fixedCostPerPax + variableCostPerPax + cacheCostPerPax;
  
  // 20% Markup
  const sellingPricePerPax = Math.round(totalCostPerPax * 1.20);

  return {
    sellingPricePerPax,
    breakdownPerPax: {
      fixed: {
        transport: transportTotal / pax,
        guide: guideTotal / pax,
      },
      variable: {
        meals: mealTotalPerPax,
        insurance: insurancePerPax,
        visa: visaPerPax,
      },
      cache: {
        flight: flightCostPerPax,
        hotel: hotelCostPerPax,
        activity: activityCostPerPax,
      },
      totalCost: totalCostPerPax
    }
  };
}
