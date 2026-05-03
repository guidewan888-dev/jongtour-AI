import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { MapPin, Calendar, Star, Clock, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

// ใช้ ISR Cache 1 นาที เพื่อให้เว็บเร็วขึ้น และข้อมูลยังอัปเดตอยู่
export const dynamic = "force-dynamic";

const wholesaleConfig: Record<string, { name: string, logo: string, source: string, description: string, coverImage: string }> = {
  "letsgo": {
    name: "Let's Go Group",
    logo: "/images/wholesales/download.png",
    source: "API_ZEGO",
    description: "โฮลเซลล์ทัวร์ชั้นนำผู้เชี่ยวชาญเส้นทางเอเชีย จัดเต็มทุกความประทับใจในราคาคุ้มค่า พร้อมบริการที่ได้มาตรฐาน",
    coverImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000"
  },
  "go365": {
    name: "GO 365 Travel",
    logo: "/images/wholesales/download.jfif",
    source: "API_GO365",
    description: "ผู้ให้บริการทัวร์คุณภาพ ครอบคลุมหลากหลายเส้นทางทั่วโลก พาคุณเที่ยวครบ จบในที่เดียว เที่ยวได้ทุกวัน 365 วัน",
    coverImage: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000"
  },
  "checkingroup": {
    name: "Check In Group",
    logo: "/images/wholesales/CH7.jpg",
    source: "CHECKIN",
    description: "พาคุณเช็คอินทุกจุดหมายยอดฮิต จัดทริปสบายๆ ในสไตล์ที่คุณชอบ ตอบโจทย์ทุกไลฟ์สไตล์การเดินทาง",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000"
  },
  "tourfactory": {
    name: "Tour Factory",
    logo: "/images/wholesales/Tour-Factory.jpg",
    source: "TOUR_FACTORY",
    description: "โรงงานผลิตความสุขทางการท่องเที่ยว สร้างสรรค์ทริปในฝันของคุณด้วยแพ็กเกจทัวร์สุดพิเศษ",
    coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000"
  }
};

const countryMap: Record<string, { th: string, flag: string }> = {
  "CHINA": { th: "จีน", flag: "🇨🇳" },
  "EGYPT": { th: "อียิปต์", flag: "🇪🇬" },
  "ENGLAND": { th: "อังกฤษ", flag: "🇬🇧" },
  "EUROPE": { th: "ยุโรป", flag: "🇪🇺" },
  "FRANCE": { th: "ฝรั่งเศส", flag: "🇫🇷" },
  "GEORGIA": { th: "จอร์เจีย", flag: "🇬🇪" },
  "HONG KONG": { th: "ฮ่องกง", flag: "🇭🇰" },
  "INDIA": { th: "อินเดีย", flag: "🇮🇳" },
  "ITALY": { th: "อิตาลี", flag: "🇮🇹" },
  "JAPAN": { th: "ญี่ปุ่น", flag: "🇯🇵" },
  "SINGAPORE": { th: "สิงคโปร์", flag: "🇸🇬" },
  "TAIWAN": { th: "ไต้หวัน", flag: "🇹🇼" },
  "TURKIYE": { th: "ตุรกี", flag: "🇹🇷" },
  "VIETNAM": { th: "เวียดนาม", flag: "🇻🇳" },
  "SOUTH KOREA": { th: "เกาหลีใต้", flag: "🇰🇷" },
  "MACAU": { th: "มาเก๊า", flag: "🇲🇴" },
  "MALAYSIA": { th: "มาเลเซีย", flag: "🇲🇾" },
  "INDONESIA": { th: "อินโดนีเซีย", flag: "🇮🇩" },
  "MALDIVES": { th: "มัลดีฟส์", flag: "🇲🇻" },
  "SWITZERLAND": { th: "สวิตเซอร์แลนด์", flag: "🇨🇭" },
  "UK": { th: "สหราชอาณาจักร", flag: "🇬🇧" },
  "GERMANY": { th: "เยอรมนี", flag: "🇩🇪" },
  "AUSTRIA": { th: "ออสเตรีย", flag: "🇦🇹" },
  "CZECH": { th: "เช็ก", flag: "🇨🇿" },
  "SPAIN": { th: "สเปน", flag: "🇪🇸" },
  "NETHERLANDS": { th: "เนเธอร์แลนด์", flag: "🇳🇱" },
  "FINLAND": { th: "ฟินแลนด์", flag: "🇫🇮" },
  "JORDAN": { th: "จอร์แดน", flag: "🇯🇴" },
  "MOROCCO": { th: "โมร็อกโก", flag: "🇲🇦" }
};

export default async function WholesaleLandingPage({ params, searchParams }: { params: { slug: string }, searchParams?: { dest?: string } }) {
  const wholesale = wholesaleConfig[params.slug];
  if (!wholesale) {
    notFound();
  }

  const supplierAliasMap: Record<string, string> = {
    "API_ZEGO": "let'sgo",
    "API_GO365": "go365",
    "CHECKIN": "checkingroup",
    "TOUR_FACTORY": "tourfactory"
  };
  const supplierAlias = supplierAliasMap[wholesale.source] || wholesale.source.toLowerCase();
  
  let toursData: any[] = [];
  let prismaError: string | null = null;
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI'
    );

    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        supplier:suppliers(*),
        departures(*, prices(*)),
        destinations:tour_destinations(*),
        images:tour_images(*)
      `)
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    const today = new Date();
    toursData = (data || [])
      .filter((t: any) => t.supplier && t.supplier.canonicalName === supplierAlias)
      .map((t: any) => {
        const futureDeps = (t.departures || []).filter((d: any) => new Date(d.startDate) >= today);
        futureDeps.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return { ...t, departures: futureDeps };
      }).filter((t: any) => t.departures.length > 0);

  } catch (error: any) {
    console.error("Supabase error in wholesale:", error);
    prismaError = error?.message || String(error);
  }

  if (prismaError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg m-10 text-red-800 font-mono text-xs whitespace-pre-wrap">
        <h2>Database Connection Error</h2>
        <p>{prismaError}</p>
      </div>
    );
  }

  const validTours = toursData.map(t => ({
    id: t.id,
    title: t.tourName,
    description: "แพ็กเกจทัวร์คุณภาพ ออกเดินทางแน่นอน",
    durationDays: t.durationDays,
    destination: t.destinations?.[0]?.country || "ไม่ระบุ",
    imageUrl: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    departures: t.departures.map(d => ({
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      price: d.prices?.[0]?.sellingPrice || 0
    })),
    price: 0
  }));

  // Group tours by destination
  const toursByDestination = validTours.reduce((acc: Record<string, any[]>, tour: any) => {
    const dest = tour.destination || 'จุดหมายปลายทางอื่นๆ';
    if (!acc[dest]) acc[dest] = [];
    acc[dest].push(tour);
    return acc;
  }, {});

  const destParam = Array.isArray(searchParams?.dest) ? searchParams.dest[0] : searchParams?.dest;
  const activeDest = destParam?.toUpperCase();
  const allDestinationKeys = Object.keys(toursByDestination).sort();
  
  let matchedKeys: string[] = [];
  if (activeDest) {
    matchedKeys = allDestinationKeys.filter(k => {
       const mapped = countryMap[k.toUpperCase()];
       const upperK = k.toUpperCase();
       return upperK === activeDest || upperK.includes(activeDest) || activeDest.includes(upperK) || (mapped && mapped.th === activeDest) || (mapped && mapped.th.includes(activeDest));
    });
  }

  const destinationKeysToRender = matchedKeys.length > 0
    ? matchedKeys 
    : allDestinationKeys;

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20">
      
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${wholesale.coverImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-10">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 mb-6 shadow-xl border-4 border-white/20 overflow-hidden flex items-center justify-center">
             <img src={wholesale.logo} alt={wholesale.name} className="max-w-[80%] max-h-[80%] object-contain" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            {wholesale.name}
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto font-medium">
            {wholesale.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        
        {/* Breadcrumbs */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap border border-gray-100">
          <Link href="/" className="hover:text-orange-600 font-medium transition-colors">หน้าหลัก</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-bold">{wholesale.name}</span>
        </div>

        {validTours.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">แพ็กเกจทัวร์กำลังทยอยอัปเดต</h3>
            <p className="text-gray-500 text-base">สำหรับโฮลเซลล์นี้ ระบบกำลังทำการเชื่อมต่อและดึงข้อมูลแพ็กเกจทัวร์ล่าสุด โปรดรอติดตามเร็วๆ นี้</p>
            <Link href="/" className="mt-8 inline-block px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
               กลับสู่หน้าหลัก
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Nav Links for Destinations */}
            {allDestinationKeys.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-sm font-bold text-gray-700">เลือกเส้นทาง:</span>
                <Link 
                  href={`/wholesale/${params.slug}`} 
                  className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${!activeDest ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 hover:bg-orange-50 text-gray-600 border-gray-200'}`}
                >
                  ดูทั้งหมด ({validTours.length})
                </Link>
                {allDestinationKeys.map(dest => {
                  const mapped = countryMap[dest.toUpperCase()];
                  const displayName = mapped ? `${mapped.flag} ${mapped.th}` : dest;
                  const isActive = activeDest === dest;
                  return (
                    <Link 
                      key={dest} 
                      href={`/wholesale/${params.slug}?dest=${encodeURIComponent(dest)}`} 
                      className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${isActive ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 hover:bg-orange-50 text-gray-600 border-gray-200'}`}
                    >
                      {displayName} ({toursByDestination[dest].length})
                    </Link>
                  );
                })}
              </div>
            )}

            {destinationKeysToRender.map((dest) => {
              // try to find reverse map if dest is in Thai
              let mapped = countryMap[dest.toUpperCase()];
              if (!mapped) {
                 const foundKey = Object.keys(countryMap).find(k => dest.includes(countryMap[k].th));
                 if (foundKey) mapped = countryMap[foundKey];
              }

              const displayTitle = mapped ? `ทัวร์${mapped.th} ${mapped.flag}` : `ทัวร์${dest}`;
              
              return (
              <div key={dest} id={dest} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-orange-100">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800">{displayTitle}</h2>
                  <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">
                    {toursByDestination[dest].length} โปรแกรม
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {toursByDestination[dest].map((tour: any) => {
                    // Calculate dates
                    let dateDisplay = "เร็วๆ นี้";
                    if (tour.departures && tour.departures.length > 0) {
                      const sorted = [...tour.departures].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                      const firstDate = new Date(sorted[0].startDate);
                      const lastDate = new Date(sorted[sorted.length - 1].startDate);
                      
                      const formatMonth = (d: Date) => d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
                      const m1 = formatMonth(firstDate);
                      const m2 = formatMonth(lastDate);
                      
                      if (m1 === m2) {
                        dateDisplay = `เดินทาง ${m1}`;
                      } else {
                        dateDisplay = `เดินทาง ${m1} - ${m2}`;
                      }
                    }

                    // Find lowest price
                    const lowestPrice = tour.departures && tour.departures.length > 0 
                      ? Math.min(...tour.departures.map((d: any) => d.price)) 
                      : tour.price;

                    return (
                      <div key={tour.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all group flex flex-col h-full border border-gray-200">
                        
                        {/* Tour Image */}
                        <div className="relative bg-gray-100 overflow-hidden flex items-center justify-center">
                          {tour.price > lowestPrice && (
                            <div className="absolute top-0 left-0 bg-orange-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold z-10 shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" /> ได้รับรางวัล
                            </div>
                          )}
                          <img 
                            src={tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"} 
                            alt={tour.title} 
                            className="w-full aspect-square object-contain bg-white"
                          />
                          
                          {/* Map Pin Badge */}
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white" /> {tour.destination}
                          </div>
                        </div>

                        {/* Tour Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <Link href={`/tour/${tour.id}`} className="block flex-1">
                            <h3 className="font-bold text-orange-600 text-base leading-snug mb-1 group-hover:underline transition-colors line-clamp-2">
                              {tour.title}
                            </h3>
                            <div className="flex gap-0.5 mb-2">
                              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {tour.description}
                            </p>
                          </Link>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-gray-200">
                              <Clock className="w-3 h-3" /> {tour.durationDays} วัน {tour.durationDays > 1 ? tour.durationDays - 1 : 0} คืน
                            </div>
                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-green-200">
                               <Calendar className="w-3 h-3" /> {dateDisplay}
                            </div>
                          </div>

                          {/* Footer / Price Box */}
                          <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-auto">
                            <div className="flex flex-col">
                              <img src={wholesale.logo} alt={wholesale.name} className="h-8 md:h-10 w-auto object-contain mb-1" />
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-black text-gray-900 leading-none">
                                ฿ {lowestPrice.toLocaleString()}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-1">รวมภาษีและค่าธรรมเนียมแล้ว</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </main>
  );
}
