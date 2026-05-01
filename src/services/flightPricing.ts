import { prisma } from "@/utils/prisma";

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

export async function getEstimatedFlightPrice(country: string, startDate: Date, endDate: Date) {
  const originIata = "BKK";
  
  // Find a matching mock data, default to generic long-haul if not found
  const matchedKey = Object.keys(mockFlightData).find(key => country.includes(key));
  const mockInfo = matchedKey ? mockFlightData[matchedKey] : { destIata: "XXX", price: 25000 };

  const destinationIata = mockInfo.destIata;

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
        return {
          price: cached.priceAmount,
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
    const newPrice = Math.round(mockInfo.price * fluctuation);

    // 3. Save to Cache
    const newRecord = await prisma.flightPriceCache.create({
      data: {
        originIata,
        destinationIata,
        departureDate: startDate,
        returnDate: endDate,
        priceAmount: newPrice,
        currency: "THB",
        provider: "AMADEUS_MOCK_API"
      }
    });

    return {
      price: newRecord.priceAmount,
      currency: newRecord.currency,
      source: 'LIVE_API',
      provider: newRecord.provider,
      fetchedAt: newRecord.fetchedAt
    };

  } catch (error) {
    console.error("Flight pricing error:", error);
    // Fallback if DB fails
    return {
      price: mockInfo.price,
      currency: "THB",
      source: 'FALLBACK',
      provider: 'STATIC_FALLBACK',
      fetchedAt: new Date()
    };
  }
}
