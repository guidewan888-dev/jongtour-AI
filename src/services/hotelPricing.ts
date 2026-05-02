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

interface CachedHotel {
  name: string;
  stars: number;
  theme: string;
  highlight: string;
  imageUrl: string;
}

export const hotelInventoryCache: Record<string, CachedHotel[]> = {
  "โอซาก้า": [
    { name: "Sotetsu Fresa Inn Osaka-Namba", stars: 3, theme: "shopping", highlight: "ใจกลางนัมบะ ใกล้แหล่งช้อปปิ้งและร้านอาหาร เดินทางสะดวกสบายสุดๆ", imageUrl: "https://images.unsplash.com/photo-1590447158019-883d815f8bc1?w=800&q=80" },
    { name: "Sotetsu Fresa Inn Osaka-Namba", stars: 3, theme: "family", highlight: "มีห้องแฟมิลี่ คุ้มค่า ปลอดภัย ใกล้สถานีรถไฟ เดินน้อยเหมาะกับครอบครัว", imageUrl: "https://images.unsplash.com/photo-1590447158019-883d815f8bc1?w=800&q=80" },
    { name: "Cross Hotel Osaka", stars: 4, theme: "couple", highlight: "ดีไซน์โมเดิร์น บรรยากาศโรแมนติก เดินเพียง 1 นาทีถึงป้ายกูลิโกะโดทงโบริ", imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800&q=80" },
    { name: "Swissotel Nankai Osaka", stars: 5, theme: "luxury", highlight: "โรงแรมหรูระดับ 5 ดาว อยู่เหนือสถานี Namba วิวเมืองโอซาก้าแบบพาโนรามา", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
    { name: "Swissotel Nankai Osaka", stars: 5, theme: "family", highlight: "ห้องพักกว้างขวางระดับ 5 ดาว เดินทางจากสนามบินรวดเร็ว ไม่ต้องต่อรถ", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" }
  ],
  "เกียวโต": [
    { name: "Hotel Resol Kyoto", stars: 3, theme: "culture", highlight: "ตกแต่งสไตล์เซน เงียบสงบ ใกล้รถไฟใต้ดิน สัมผัสวัฒนธรรมเกียวโต", imageUrl: "https://images.unsplash.com/photo-1590447158019-883d815f8bc1?w=800&q=80" },
    { name: "Kyoto Granbell Hotel", stars: 4, theme: "couple", highlight: "ผสานความโมเดิร์นกับความดั้งเดิม มีออนเซ็นสวยงาม บรรยากาศโรแมนติก", imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800&q=80" },
    { name: "The Ritz-Carlton, Kyoto", stars: 5, theme: "luxury", highlight: "Ultra Luxury ติดแม่น้ำคาโมงาวะ บริการระดับเวิลด์คลาส พร้อมดินเนอร์สุดหรู", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
    { name: "The Ritz-Carlton, Kyoto", stars: 5, theme: "family", highlight: "มีบริการสุดพิเศษสำหรับเด็กๆ พื้นที่กว้างขวาง ปลอดภัย และหรูหรา", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" }
  ],
  "โตเกียว": [
    { name: "APA Hotel Shinjuku Kabukicho Tower", stars: 3, theme: "shopping", highlight: "ใจกลางชินจูกุ ดงช้อปปิ้งและร้านอาหาร แช่ออนเซ็นรวมได้ฟรี", imageUrl: "https://images.unsplash.com/photo-1590447158019-883d815f8bc1?w=800&q=80" },
    { name: "Hotel Gracery Shinjuku", stars: 4, theme: "family", highlight: "ตึกก็อดซิลล่าสุดฮิต เด็กๆ ชอบมาก ใกล้สถานีชินจูกุเดินทางง่าย", imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800&q=80" },
    { name: "Hotel Gracery Shinjuku", stars: 4, theme: "shopping", highlight: "ใจกลางชินจูกุ แหล่งช้อปปิ้ง 24 ชม. ตื่นปุ๊บช้อปปิ้งได้เลย", imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800&q=80" },
    { name: "The Ritz-Carlton, Tokyo", stars: 5, theme: "luxury", highlight: "หรูหราที่สุดในย่าน Roppongi วิวภูเขาไฟฟูจิและโตเกียวทาวเวอร์", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
    { name: "The Ritz-Carlton, Tokyo", stars: 5, theme: "couple", highlight: "ดินเนอร์สุดโรแมนติก พร้อมวิวโตเกียวทาวเวอร์ยามค่ำคืน", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" }
  ],
  "default": [
    { name: "Standard City Hotel", stars: 3, theme: "budget", highlight: "ที่พักสะอาด ปลอดภัย เดินทางสะดวกสบาย เหมาะสำหรับผู้ที่เน้นการท่องเที่ยวชิลๆ", imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?w=800&q=80" },
    { name: "Standard City Hotel", stars: 3, theme: "family", highlight: "ห้องพักขนาดกะทัดรัดแต่มีสิ่งอำนวยความสะดวกครบครัน ใกล้ระบบขนส่งสาธารณะ", imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?w=800&q=80" },
    { name: "Premium Grand Hotel", stars: 4, theme: "couple", highlight: "ห้องพักดีไซน์สวยงาม บรรยากาศเป็นส่วนตัว พร้อมสิ่งอำนวยความสะดวกระดับพรีเมียม", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80" },
    { name: "Premium Grand Hotel", stars: 4, theme: "shopping", highlight: "ทำเลทองใจกลางเมือง สะดวกสบายในการช้อปปิ้งและตะลอนชิม", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80" },
    { name: "Luxury Resort & Spa", stars: 5, theme: "luxury", highlight: "บริการระดับ 5 ดาว พร้อมสปาและห้องอาหารสุดหรู เพื่อการพักผ่อนอย่างแท้จริง", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
    { name: "Luxury Resort & Spa", stars: 5, theme: "family", highlight: "มี Kids Club และสระว่ายน้ำขนาดใหญ่ พื้นที่สำหรับครอบครัวได้ทำกิจกรรมร่วมกัน", imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" }
  ]
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

    // 5. Get Available Hotel Candidates from Cache
    let availableHotels: CachedHotel[] = [];
    const countryKey = Object.keys(hotelInventoryCache).find(key => cityOrCountry.includes(key));
    if (countryKey) {
      availableHotels = hotelInventoryCache[countryKey].filter(h => h.stars === stars);
    }
    if (availableHotels.length === 0) {
      availableHotels = hotelInventoryCache["default"].filter(h => h.stars === stars);
    }

    return {
      pricePerNight,
      nights,
      rooms,
      totalCost: grandTotal,
      currency: "THB",
      source: rawBasePrice === cached?.pricePerNight ? 'CACHE' : 'LIVE_API',
      provider,
      fetchedAt,
      availableHotels
    };

  } catch (error) {
    console.error("Hotel pricing error:", error);
    // Fallback if DB fails
    const rawFallback = (mockBasePriceByStar[stars] || 2000);
    const pricePerNight = applyHotelAlgorithm(rawFallback);
    const fallbackTotal = pricePerNight * nights * rooms * 1.07 + 300;
    
    let availableHotels: CachedHotel[] = [];
    const countryKey = Object.keys(hotelInventoryCache).find(key => cityOrCountry.includes(key));
    if (countryKey) {
      availableHotels = hotelInventoryCache[countryKey].filter(h => h.stars === stars);
    }
    if (availableHotels.length === 0) {
      availableHotels = hotelInventoryCache["default"].filter(h => h.stars === stars);
    }

    return {
      pricePerNight,
      nights,
      rooms,
      totalCost: Math.round(fallbackTotal),
      currency: "THB",
      source: 'FALLBACK',
      provider: 'STATIC_FALLBACK',
      fetchedAt: new Date(),
      availableHotels
    };
  }
}
