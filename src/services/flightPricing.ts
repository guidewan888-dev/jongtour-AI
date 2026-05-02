import { prisma } from "@/lib/prisma";

const CACHE_TTL_HOURS = 24;

// Simple dictionary to map countries to a generic IATA code and mock price
// In a real scenario, the AI or the frontend would pass the actual IATA code.
const mockFlightData: Record<string, { destIata: string, price: number }> = {
  "ญี่ปุ่น": { destIata: "NRT", price: 18000 },
  "เกาหลี": { destIata: "ICN", price: 15000 },
  "จีน": { destIata: "PEK", price: 12000 },
  "ยุโรป": { destIata: "CDG", price: 35000 },
  "สวิสเซอร์แลนด์": { destIata: "ZRH", price: 38000 },
  "ฝรั่งเศส": { destIata: "CDG", price: 35000 },
  "อิตาลี": { destIata: "FCO", price: 33000 },
  "ไต้หวัน": { destIata: "TPE", price: 8500 },
  "ฮ่องกง": { destIata: "HKG", price: 7000 },
  "สิงคโปร์": { destIata: "SIN", price: 6000 },
  "เวียดนาม": { destIata: "HAN", price: 5500 },
};

export async function getEstimatedFlightPrice(country: string, startDate: Date, endDate: Date, airlinePreference: "lowcost" | "fullservice" = "lowcost") {
  const originIata = "BKK";
  
  // Find a matching mock data, default to generic long-haul if not found
  const matchedKey = Object.keys(mockFlightData).find(key => country.includes(key));
  const mockInfo = matchedKey ? mockFlightData[matchedKey] : { destIata: "XXX", price: 25000 };

  const destinationIata = mockInfo.destIata;

  // Helper for Algorithmic Pricing
  const applyFlightAlgorithm = (basePrice: number) => {
    let finalPrice = basePrice;
    
    // 1. Airline Preference
    if (airlinePreference === "fullservice") finalPrice *= 1.5;
    else finalPrice *= 0.8;

    // 2. Seasonality
    const month = startDate.getMonth() + 1; // 1-12
    if ([4, 12, 1].includes(month)) { // Peak Season: April, Dec, Jan
      finalPrice *= 1.30;
    } else if ([10, 11].includes(month)) { // Shoulder Season: Oct, Nov
      finalPrice *= 1.10;
    } else if ([5, 6, 7, 8, 9].includes(month)) { // Low Season
      finalPrice *= 0.85;
    }

    // 3. Advance Booking Window
    const daysUntilFlight = Math.max(0, Math.floor((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    if (daysUntilFlight <= 7) {
      finalPrice *= 1.40; // Very urgent
    } else if (daysUntilFlight <= 21) {
      finalPrice *= 1.20; // Somewhat urgent
    } else if (daysUntilFlight > 90) {
      finalPrice *= 0.90; // Early bird
    }

    return Math.round(finalPrice);
  };

  try {
    // 1. Check cache
    const cached = await prisma.flightPriceCache.findFirst({
      where: {
        originIata,
        destinationIata,
      },
      orderBy: { fetchedAt: 'desc' }
    });

    if (cached) {
      const ageHours = (Date.now() - cached.fetchedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours < CACHE_TTL_HOURS) {
        console.log(`[Flight Cache HIT] Using cached price for ${originIata}-${destinationIata}`);
        
        const finalPrice = applyFlightAlgorithm(cached.priceAmount);

        return {
          price: finalPrice,
          currency: cached.currency,
          source: 'CACHE',
          provider: cached.provider,
          fetchedAt: cached.fetchedAt
        };
      }
    }

    // 2. Cache MISS or EXPIRED -> Call "API" (Mocked here)
    console.log(`[Flight Cache MISS] Fetching new price for ${originIata}-${destinationIata} from Mock API...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate slight fluctuation for realism (+- 5%)
    const fluctuation = 1 + ((Math.random() * 0.1) - 0.05);
    const rawBasePrice = Math.round(mockInfo.price * fluctuation);

    // 3. Save to Cache
    const newRecord = await prisma.flightPriceCache.create({
      data: {
        originIata,
        destinationIata,
        departureDate: startDate,
        returnDate: endDate,
        priceAmount: rawBasePrice, // Save the RAW market base price
        currency: "THB",
        provider: "AMADEUS_MOCK_API"
      }
    });

    const finalPrice = applyFlightAlgorithm(rawBasePrice);

    return {
      price: finalPrice,
      currency: newRecord.currency,
      source: 'LIVE_API',
      provider: newRecord.provider,
      fetchedAt: newRecord.fetchedAt
    };

  } catch (error) {
    console.error("Flight pricing error:", error);
    // Fallback if DB fails
    const finalPrice = applyFlightAlgorithm(mockInfo.price);
    return {
      price: finalPrice,
      currency: "THB",
      source: 'FALLBACK',
      provider: 'STATIC_FALLBACK',
      fetchedAt: new Date()
    };
  }
}
