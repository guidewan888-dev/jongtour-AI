import { prisma } from "@/lib/prisma";

// Mock base prices per activity in THB
const mockActivityBasePrice = 1500;

// Cost multipliers by region/city
const regionMultiplier: Record<string, number> = {
  "ญี่ปุ่น": 1.5, // ~2250 THB
  "ยุโรป": 2.5, // ~3750 THB
  "สวิสเซอร์แลนด์": 3.0,
  "สิงคโปร์": 1.8,
  "ฮ่องกง": 1.6,
  "เกาหลี": 1.3,
  "เวียดนาม": 0.6, // ~900 THB
};

export async function getEstimatedActivityPrice(
  country: string,
  durationDays: number,
  pax: number
) {
  // Estimate number of paid activities/attractions
  // Usually 1 main paid activity per day, excluding travel days
  const numActivities = Math.max(1, durationDays - 2);
  
  try {
    // 1. Check cache (Find any valid generic activity for this country)
    const cached = await prisma.activityPriceCache.findFirst({
      where: {
        destinationCountry: country,
        expiresAt: { gt: new Date() } // Valid cache check
      },
      orderBy: { fetchedAt: 'desc' }
    });

    let pricePerActivity = 0;
    let provider = "";
    let fetchedAt = new Date();

    if (cached) {
      console.log(`[Activity Cache HIT] Using cached price for ${country}`);
      pricePerActivity = cached.priceFromAmount;
      provider = cached.provider;
      fetchedAt = cached.fetchedAt;
    }

    // 2. Cache MISS or EXPIRED -> Call "API" (Mocked here)
    if (pricePerActivity === 0) {
      console.log(`[Activity Cache MISS] Fetching new price for ${country} from Mock API...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate mock price based on region
      const matchedKey = Object.keys(regionMultiplier).find(key => country.includes(key));
      const multiplier = matchedKey ? regionMultiplier[matchedKey] : 1.0;
      
      // Fluctuation +- 15%
      const fluctuation = 1 + ((Math.random() * 0.3) - 0.15); 
      
      pricePerActivity = Math.round(mockActivityBasePrice * multiplier * fluctuation);
      provider = "VIATOR_MOCK_API";

      // 3. Save to Cache with 24 hours expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const newRecord = await prisma.activityPriceCache.create({
        data: {
          provider: provider,
          destinationCountry: country,
          productName: `Generic Attraction Ticket in ${country}`,
          category: "attraction",
          priceFromAmount: pricePerActivity,
          currency: "THB",
          expiresAt: expiresAt,
          note: "Mocked baseline price for F.I.T. estimation"
        }
      });
      fetchedAt = newRecord.fetchedAt;
    }

    // 4. Calculate Total Costs
    // Using user's logic: adultTotal = priceFrom * adults
    // We assume all pax are adults for estimation simplicity
    const adults = pax;
    const subtotalPerActivity = pricePerActivity * adults;
    const grandTotal = subtotalPerActivity * numActivities;

    return {
      pricePerActivity,
      numActivities,
      totalCost: grandTotal,
      currency: "THB",
      source: pricePerActivity === cached?.priceFromAmount ? 'CACHE' : 'LIVE_API',
      provider,
      fetchedAt
    };

  } catch (error) {
    console.error("Activity pricing error:", error);
    // Fallback if DB fails
    const matchedKey = Object.keys(regionMultiplier).find(key => country.includes(key));
    const fallbackPrice = mockActivityBasePrice * (matchedKey ? regionMultiplier[matchedKey] : 1.0);
    const fallbackTotal = fallbackPrice * pax * numActivities;
    
    return {
      pricePerActivity: fallbackPrice,
      numActivities,
      totalCost: Math.round(fallbackTotal),
      currency: "THB",
      source: 'FALLBACK',
      provider: 'STATIC_FALLBACK',
      fetchedAt: new Date()
    };
  }
}
