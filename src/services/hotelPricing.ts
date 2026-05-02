import { prisma } from "@/lib/prisma";

const CACHE_TTL_HOURS = 24;

// Mock base prices per night in THB based on star rating
const mockBasePriceByStar: Record<number, number> = {
  3: 2000,
  4: 3500,
  5: 7500,
};

// Cost multipliers by region/city for realism
const regionMultiplier: Record<string, number> = {
  "ญี่ปุ่น": 1.5,
  "โตเกียว": 1.8,
  "ยุโรป": 2.5,
  "สวิสเซอร์แลนด์": 3.0,
  "สิงคโปร์": 1.7,
  "ฮ่องกง": 1.5,
  "เกาหลี": 1.2,
  "เวียดนาม": 0.8,
};

export async function getEstimatedHotelPrice(
  cityOrCountry: string, 
  hotelStars: number, 
  durationDays: number, 
  pax: number,
  startDate: Date = new Date()
) {
  // Normalize parameters
  const stars = [3, 4, 5].includes(hotelStars) ? hotelStars : 3;
  const nights = Math.max(1, durationDays - 1);
  const rooms = Math.max(1, Math.ceil(pax / 2));
  
  // Helper for Algorithmic Pricing
  const applyHotelAlgorithm = (basePrice: number) => {
    let finalPrice = basePrice;
    
    // 1. Seasonality
    const month = startDate.getMonth() + 1; // 1-12
    if ([4, 12, 1].includes(month)) { // Peak Season
      finalPrice *= 1.30;
    } else if ([10, 11].includes(month)) { // Shoulder Season
      finalPrice *= 1.10;
    } else if ([5, 6, 7, 8, 9].includes(month)) { // Low Season
      finalPrice *= 0.85;
    }

    // 2. Weekend Multiplier (Check if any night is Fri/Sat)
    let hasWeekend = false;
    for (let i = 0; i < nights; i++) {
      const currentNight = new Date(startDate);
      currentNight.setDate(currentNight.getDate() + i);
      const dayOfWeek = currentNight.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        hasWeekend = true;
        break;
      }
    }
    
    if (hasWeekend) {
      finalPrice *= 1.15; // 15% surcharge for weekends
    }

    return Math.round(finalPrice);
  };

  try {
    // 1. Check cache
    const cached = await prisma.hotelPriceCache.findFirst({
      where: {
        city: cityOrCountry,
        hotelStars: stars,
      },
      orderBy: { fetchedAt: 'desc' }
    });

    let rawBasePrice = 0;
    let provider = "";
    let fetchedAt = new Date();

    if (cached) {
      const ageHours = (Date.now() - cached.fetchedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours < CACHE_TTL_HOURS) {
        console.log(`[Hotel Cache HIT] Using cached price for ${cityOrCountry} (${stars} Star)`);
        rawBasePrice = cached.pricePerNight;
        provider = cached.provider;
        fetchedAt = cached.fetchedAt;
      }
    }

    // 2. Cache MISS or EXPIRED -> Call "API" (Mocked here)
    if (rawBasePrice === 0) {
      console.log(`[Hotel Cache MISS] Fetching new price for ${cityOrCountry} (${stars} Star) from Mock API...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Calculate mock price based on region
      const matchedKey = Object.keys(regionMultiplier).find(key => cityOrCountry.includes(key));
      const multiplier = matchedKey ? regionMultiplier[matchedKey] : 1.0;
      
      const staticBasePrice = mockBasePriceByStar[stars] || 2000;
      // Fluctuation +- 10%
      const fluctuation = 1 + ((Math.random() * 0.2) - 0.1); 
      
      rawBasePrice = Math.round(staticBasePrice * multiplier * fluctuation);
      provider = "SERPAPI_MOCK";

      // 3. Save to Cache
      const newRecord = await prisma.hotelPriceCache.create({
        data: {
          city: cityOrCountry,
          hotelStars: stars,
          pricePerNight: rawBasePrice, // Save RAW market rate
          currency: "THB",
          provider: provider
        }
      });
      fetchedAt = newRecord.fetchedAt;
    }

    const pricePerNight = applyHotelAlgorithm(rawBasePrice);

    // 4. Calculate Total Costs
    const hotelTotal = pricePerNight * nights * rooms;
    const taxEstimate = hotelTotal * 0.07;
    const serviceFee = 300; // Fixed booking service fee
    const grandTotal = Math.round(hotelTotal + taxEstimate + serviceFee);

    return {
      pricePerNight,
      nights,
      rooms,
      totalCost: grandTotal,
      currency: "THB",
      source: rawBasePrice === cached?.pricePerNight ? 'CACHE' : 'LIVE_API',
      provider,
      fetchedAt
    };

  } catch (error) {
    console.error("Hotel pricing error:", error);
    // Fallback if DB fails
    const rawFallback = (mockBasePriceByStar[stars] || 2000);
    const pricePerNight = applyHotelAlgorithm(rawFallback);
    const fallbackTotal = pricePerNight * nights * rooms * 1.07 + 300;
    
    return {
      pricePerNight,
      nights,
      rooms,
      totalCost: Math.round(fallbackTotal),
      currency: "THB",
      source: 'FALLBACK',
      provider: 'STATIC_FALLBACK',
      fetchedAt: new Date()
    };
  }
}
