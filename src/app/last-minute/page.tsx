import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Star, ChevronRight, Clock, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LastMinutePage() {
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const toursData = await prisma.tour.findMany({
    where: {
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
  
  const wholesaleMap: Record<string, { slug: string, name: string, logo: string }> = {
    "API_ZEGO": { slug: "letsgo", name: "Let's Go Group", logo: "/images/wholesales/download.png" },
    "API_GO365": { slug: "go365", name: "GO 365 Travel", logo: "/images/wholesales/download.jfif" },
    "CHECKIN": { slug: "checkingroup", name: "Check In Group", logo: "/images/wholesales/CH7.jpg" },
    "TOUR_FACTORY": { slug: "tourfactory", name: "Tour Factory", logo: "/images/wholesales/Tour-Factory.jpg" }
  };

  const toursByWholesale = validTours.reduce((acc: Record<string, any[]>, tour: any) => {
    const ws = tour.source || 'MANUAL';
    if (!acc[ws]) acc[ws] = [];
    acc[ws].push(tour);
    return acc;
  }, {});

  const wholesaleKeys = Object.keys(toursByWholesale).sort((a, b) => {
    const order = ['API_ZEGO', 'API_GO365', 'CHECKIN', 'TOUR_FACTORY', 'MANUAL'];
    return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20">
      
      {/* 1. Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-rose-600 to-orange-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <div className="flex justify-center mb-4">
            <span className="bg-white text-rose-600 font-black tracking-wider uppercase text-sm md:text-base px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Flame className="w-5 h-5 fill-rose-600" /> ด่วน! จำนวนจำกัด
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg flex justify-center items-center gap-4">
            🔥 ทัวร์ไฟไหม้ 🔥
          </h1>
          <p className="text-base md:text-lg text-rose-50 max-w-2xl mx-auto font-medium bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10 inline-block">
            ลดกระหน่ำ หั่นราคา เที่ยวสุดคุ้มกับแพ็กเกจทัวร์ออกเดินทางเร็วๆ นี้
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        
        {/* 2. Breadcrumbs */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap border border-gray-100">
          <Link href="/" className="hover:text-rose-600 font-medium transition-colors">หน้าหลัก</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-rose-600 font-bold">ทัวร์ไฟไหม้</span>
        </div>

        {/* 3. Main Content */}
        <div className="flex flex-col gap-8">
          
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-6 h-6 text-rose-600 fill-rose-600" /> แพ็กเกจทัวร์ไฟไหม้ล่าสุด ({validTours.length} โปรแกรม)
            </h2>
          </div>

          {validTours.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Flame className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">ขณะนี้ยังไม่มีแพ็กเกจทัวร์ไฟไหม้</h3>
                <p className="text-gray-500 text-sm">โปรดติดตามโปรโมชั่นเด็ดๆ ที่นี่ได้เร็วๆ นี้</p>
              </div>
          ) : (
            <div className="space-y-12">
              {wholesaleKeys.map((wsKey) => {
                const wsConfig = wholesaleMap[wsKey] || { slug: "", name: wsKey, logo: "" };
                const wsTours = toursByWholesale[wsKey];
                if (!wsTours || wsTours.length === 0) return null;
                
                return (
                  <div key={wsKey} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-rose-100/50">
                    {/* Wholesale Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                      <Link 
                        href={wsConfig.slug ? `/last-minute/${wsConfig.slug}` : '#'}
                        className={`flex items-center gap-4 group ${wsConfig.slug ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {wsConfig.logo && (
                          <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center p-1 shrink-0 group-hover:border-rose-300 transition-colors">
                            <img src={wsConfig.logo} alt={wsConfig.name} className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-105 transition-transform" />
                          </div>
                        )}
                        <div>
                          <h3 className={`text-2xl font-black text-gray-900 ${wsConfig.slug ? 'group-hover:text-rose-600 transition-colors' : ''}`}>
                            {wsConfig.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">🔥 {wsTours.length} โปรแกรมทัวร์ไฟไหม้</p>
                        </div>
                      </Link>
                      
                      {wsConfig.slug && (
                        <Link 
                          href={`/last-minute/${wsConfig.slug}`}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0"
                        >
                          ดูเพิ่มเติม
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    {/* 4 Tours Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                      {wsTours.slice(0, 4).map((tour: any) => {
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
                              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-white" /> {tour.destination || 'ไม่ระบุ'}
                              </div>
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
      </div>
    </main>
  );
}
