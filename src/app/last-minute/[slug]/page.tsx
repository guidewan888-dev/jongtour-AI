import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Star, Clock, ChevronRight, Flame } from "lucide-react";
import { notFound } from "next/navigation";

// ใช้ ISR Cache 1 นาที เพื่อให้เว็บเร็วขึ้น และข้อมูลยังอัปเดตอยู่
export const revalidate = 60;

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

export default async function WholesaleLastMinutePage({ params, searchParams }: { params: { slug: string }, searchParams?: { dest?: string } }) {
  const wholesale = wholesaleConfig[params.slug];
  if (!wholesale) {
    notFound();
  }

  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const supplierAlias = wholesale.source.toLowerCase();

  const toursData = await prisma.tour.findMany({
    where: {
      supplier: { canonicalName: supplierAlias },
      status: 'PUBLISHED',
      departures: {
        some: {
          startDate: {
            gte: today,
            lte: next30Days
          }
        }
      }
    },
    include: {
      departures: {
        where: { startDate: { gte: today, lte: next30Days } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      },
      destinations: true,
      images: { take: 1 },
      supplier: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const validTours = toursData.map(t => ({
    id: t.id,
    title: t.tourName,
    durationDays: t.durationDays,
    destination: t.destinations?.[0]?.country || "ไม่ระบุ",
    imageUrl: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    source: t.supplier?.bookingMethod || "UNKNOWN",
    departures: t.departures.map(d => ({
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      price: d.prices?.[0]?.sellingPrice || 0
    })),
    price: t.departures.length > 0 ? Math.min(...t.departures.map(d => d.prices?.[0]?.sellingPrice || 0)) : 0
  }));

  // Group tours by destination
  const toursByDestination = validTours.reduce((acc: Record<string, any[]>, tour: any) => {
    const dest = tour.destination || 'จุดหมายปลายทางอื่นๆ';
    if (!acc[dest]) acc[dest] = [];
    acc[dest].push(tour);
    return acc;
  }, {});

  const activeDest = searchParams?.dest?.toUpperCase();
  const allDestinationKeys = Object.keys(toursByDestination).sort();
  
  let matchedKeys: string[] = [];
  if (activeDest) {
    matchedKeys = allDestinationKeys.filter(k => {
       const mapped = countryMap[activeDest];
       const upperK = k.toUpperCase();
       return upperK === activeDest || upperK.includes(activeDest) || activeDest.includes(upperK) || (mapped && k.includes(mapped.th));
    });
  }

  const destinationKeysToRender = matchedKeys.length > 0
    ? matchedKeys 
    : allDestinationKeys;

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20">
      
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-rose-600 to-orange-500">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${wholesale.coverImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-10">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full p-2 mb-4 shadow-xl border-4 border-white/20 overflow-hidden flex items-center justify-center relative">
             <img src={wholesale.logo} alt={wholesale.name} className="max-w-[80%] max-h-[80%] object-contain" />
             <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                <Flame className="w-5 h-5 fill-white" />
             </div>
          </div>
          <span className="text-rose-300 font-bold tracking-wider uppercase text-sm md:text-base mb-2 block">
            ทัวร์ไฟไหม้จาก
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg flex justify-center items-center gap-3">
             {wholesale.name}
          </h1>
          <p className="text-base md:text-lg text-rose-50 max-w-2xl mx-auto font-medium">
             รวมโปรลดกระหน่ำ หั่นราคา เที่ยวสุดคุ้มกับแพ็กเกจทัวร์ออกเดินทางเร็วๆ นี้
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        
        {/* Breadcrumbs */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap border border-gray-100">
          <Link href="/" className="hover:text-rose-600 font-medium transition-colors">หน้าหลัก</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/last-minute" className="hover:text-rose-600 font-medium transition-colors">ทัวร์ไฟไหม้</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-800 font-bold">{wholesale.name}</span>
        </div>

        {validTours.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Flame className="w-12 h-12 text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">ยังไม่มีทัวร์ไฟไหม้ของ {wholesale.name}</h3>
            <p className="text-gray-500 text-base">โปรดติดตามโปรโมชั่นเด็ดๆ จากโฮลเซลล์นี้ได้เร็วๆ นี้</p>
            <Link href="/last-minute" className="mt-8 inline-block px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm">
               ดูทัวร์ไฟไหม้โฮลเซลล์อื่น
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Nav Links for Destinations */}
            {allDestinationKeys.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-sm font-bold text-gray-700">เลือกเส้นทาง:</span>
                <Link 
                  href={`/last-minute/${params.slug}`} 
                  className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${!activeDest ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-gray-50 hover:bg-rose-50 text-gray-600 border-gray-200 hover:text-rose-600'}`}
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
                      href={`/last-minute/${params.slug}?dest=${encodeURIComponent(dest)}`} 
                      className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${isActive ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-gray-50 hover:bg-rose-50 text-gray-600 border-gray-200 hover:text-rose-600'}`}
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
              const displayDest = mapped ? mapped.th : dest;
              const flag = mapped ? mapped.flag : '';

              return (
                <div key={dest} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">{flag}</span>
                        {displayDest}
                      </h2>
                      <p className="text-sm text-gray-500 mt-2 font-medium">พบ {toursByDestination[dest].length} โปรแกรมทัวร์ไฟไหม้</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {toursByDestination[dest].map((tour: any) => {
                        let dateDisplay = "เร็วๆ นี้";
                        if (tour.departures && tour.departures.length > 0) {
                          const sorted = [...tour.departures].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                          const firstDate = new Date(sorted[0].startDate);
                          const lastDate = new Date(sorted[sorted.length - 1].startDate);
                          
                          const formatMonth = (d: Date) => d.toLocaleDateString("th-TH", { month: "short", year: "numeric" });
                          const m1 = formatMonth(firstDate);
                          const m2 = formatMonth(lastDate);
                          
                          if (m1 === m2) {
                            dateDisplay = `เดินทาง ${m1}`;
                          } else {
                            dateDisplay = `เดินทาง ${m1} - ${m2}`;
                          }
                        }

                        const lowestPrice = tour.departures && tour.departures.length > 0 
                          ? Math.min(...tour.departures.map((d: any) => d.price)) 
                          : tour.price;

                        return (
                          <div key={tour.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(225,29,72,0.08)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.15)] transition-all group flex flex-col h-full border border-rose-100">
                            
                            <div className="relative bg-gray-100 overflow-hidden flex items-center justify-center">
                              <div className="absolute top-0 left-0 bg-rose-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold z-10 shadow-sm flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-white" /> ลดพิเศษ
                              </div>
                              <img 
                                src={tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"} 
                                alt={tour.title} 
                                className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <div className="p-3.5 flex-1 flex flex-col">
                              <Link href={`/tour/${tour.id}`} className="block flex-1">
                                <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 group-hover:text-rose-600 transition-colors line-clamp-2">
                                  {tour.title}
                                </h3>
                                <div className="flex gap-0.5 mb-2">
                                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                                </div>
                              </Link>

                              <div className="flex flex-wrap gap-1.5 mb-3">
                                <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-gray-100">
                                  <Clock className="w-3 h-3" /> {tour.durationDays} วัน {tour.durationDays > 1 ? tour.durationDays - 1 : 0} คืน
                                </div>
                                <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-green-100">
                                   <Calendar className="w-3 h-3" /> {dateDisplay}
                                </div>
                              </div>

                              <div className="flex justify-between items-end pt-2 border-t border-gray-50 mt-auto">
                                <div className="text-right w-full">
                                  <p className="text-base font-black text-rose-600 leading-none">
                                    ฿ {lowestPrice.toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-gray-400 mt-1">ราคาเริ่มต้น</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
