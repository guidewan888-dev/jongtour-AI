import { Search, Calendar, Users, MapPin, Building2, Ticket, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function TourManagementPage({ searchParams }: { searchParams: { error?: string, q?: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  let company = null;
  let tours: any[] = [];
  
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('*, agent:agents(*)')
      .eq('email', user.email || '')
      .single();
    
    dbUser = userData;
    if (dbUser?.agent) {
      company = dbUser.agent;
    }
  }

  // Fetch real tours with active departures
  let query = supabase
    .from('tours')
    .select(`
      *,
      departures(*),
      tour_images(imageUrl),
      tour_destinations(country, city)
    `)
    .eq('status', 'PUBLISHED')
    .order('createdAt', { ascending: false });

  if (searchParams.q) {
    query = query.ilike('tourName', `%${searchParams.q}%`);
  }

  const { data: fetchedTours } = await query;
  
  // Filter out tours without future departures or process prices
  if (fetchedTours) {
    // Note: departure prices might be complex to fetch in one nested query depending on schema. 
    // Usually it's departure_prices or in the departures table itself.
    // For now we assume departures has adultPrice or we fetch departure_prices.
    // Actually, let's just use the departure base price if departure_prices is not directly linked in this simple query.
    // In our Prisma schema, it's TourDeparturePrice or similar? Wait, departures have prices.
    
    const { data: pricesData } = await supabase.from('departure_prices').select('*');

    tours = fetchedTours.map(tour => {
      const futureDepartures = (tour.departures || [])
        .filter((d: any) => new Date(d.startDate) >= new Date())
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
      const departuresWithPrices = futureDepartures.map((d: any) => {
        const prices = pricesData?.filter(p => p.departureId === d.id) || [];
        return { ...d, prices };
      });

      return {
        ...tour,
        departures: departuresWithPrices
      };
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">ค้นหาทัวร์ (B2B Tour Catalog)</h2>
          <p className="text-sm text-gray-500 mt-1">เลือกโปรแกรมทัวร์ และรอบเดินทางสำหรับลูกค้าของคุณ (ระบบคำนวณราคาส่งให้เรียบร้อยแล้ว)</p>
        </div>
      </div>

      {searchParams.error === "insufficient_credit" && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold">!</span>
          </div>
          <div>
            <p className="font-bold">วงเงินเครดิตไม่เพียงพอ</p>
            <p className="text-sm">ยอดเงินเครดิตที่เหลือของท่านไม่เพียงพอสำหรับการจองนี้ กรุณาชำระยอดค้างชำระเพื่อเพิ่มวงเงิน</p>
          </div>
        </div>
      )}
      
      {searchParams.error === "seats_full" && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
           <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold">!</span>
          </div>
          <div>
            <p className="font-bold">ที่นั่งไม่เพียงพอ</p>
            <p className="text-sm">รอบเดินทางนี้ที่นั่งเต็มหรือมีจำนวนที่นั่งเหลือน้อยกว่าจำนวนผู้เดินทางที่คุณเลือก</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <form className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="ค้นหาชื่อทัวร์, โค้ดทัวร์ หรือ ประเทศ..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
            <Filter size={16} /> กรองข้อมูล
          </button>
          <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
            ค้นหา
          </button>
        </div>
      </form>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 gap-6">
        {tours.map((tour) => {
          // Get cheapest price
          let minPrice = 0;
          if (tour.departures.length > 0 && tour.departures[0].prices.length > 0) {
             const adults = tour.departures[0].prices.filter((p: any) => p.paxType === 'ADULT');
             if (adults.length > 0) {
                minPrice = Math.min(...adults.map((p: any) => p.price));
             }
          } else if (tour.departures.length > 0) {
             // Fallback if price is directly on departure
             minPrice = tour.departures[0].adultPrice || 0;
          }
          
          return (
            <div key={tour.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row group">
              <div className="w-full md:w-72 h-56 md:h-auto bg-gray-100 shrink-0 overflow-hidden relative">
                 <img 
                    src={tour.tour_images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"} 
                    alt={tour.tourName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <MapPin size={12} className="text-orange-500" /> 
                    {tour.tour_destinations?.[0]?.country || 'Multiple'}
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {tour.id.substring(0,8).toUpperCase()}
                      </span>
                      {company?.discountRate > 0 && (
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded border border-orange-200">
                          รับคอมมิชชัน {company.discountRate}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2 leading-tight">{tour.tourName}</h3>
                  </div>
                  
                  <div className="text-left lg:text-right shrink-0 bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[200px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ราคาขายหน้าร้าน</p>
                    <p className="text-sm font-semibold text-gray-500 line-through mb-2">฿{minPrice > 0 ? minPrice.toLocaleString() : "N/A"}</p>
                    
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">ราคาส่ง B2B (Net Price)</p>
                    <div className="flex items-end justify-start lg:justify-end gap-1">
                      <p className="text-2xl font-black text-blue-700">
                        ฿{minPrice > 0 ? (minPrice * (1 - (company?.discountRate || 0)/100)).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mt-2 flex-1">
                  {tour.highlights || "แพ็กเกจทัวร์คุณภาพ ออกเดินทางแน่นอน พร้อมบริการระดับพรีเมียม"}
                </p>

                <div className="mt-6">
                  <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                    <Calendar size={14} className="text-orange-500" /> รอบเดินทางที่เปิดจอง ({tour.departures.length})
                  </p>
                  
                  {tour.departures.length === 0 ? (
                    <div className="text-sm font-bold text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">ยังไม่มีรอบเดินทางที่เปิดจองในขณะนี้</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {tour.departures.slice(0, 3).map((dep: any) => (
                        <div key={dep.id} className="border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all bg-white group/dep">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-sm text-gray-800">
                              {new Date(dep.startDate).toLocaleDateString('th-TH', {day:'numeric', month:'short'})} - {new Date(dep.endDate).toLocaleDateString('th-TH', {day:'numeric', month:'short'})}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${dep.remainingSeats > 5 ? 'bg-emerald-100 text-emerald-700' : dep.remainingSeats > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                              ว่าง {dep.remainingSeats} ที่
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/b2b/checkout/${dep.id}`} className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-bold transition-colors ${dep.remainingSeats > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200' : 'bg-gray-100 text-gray-400 pointer-events-none'}`}>
                              {dep.remainingSeats > 0 ? 'จองทัวร์' : 'เต็มแล้ว'}
                            </Link>
                            <Link href={`/b2b/quotations/create/${dep.id}`} className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-bold transition-colors bg-white text-blue-600 border border-blue-200 hover:bg-blue-50`}>
                              เสนอราคา
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {tour.departures.length > 3 && (
                    <button className="text-xs text-blue-600 font-bold mt-3 hover:text-blue-800 flex items-center gap-1">ดูรอบเดินทางทั้งหมด <ChevronRight size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {tours.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">ไม่พบโปรแกรมทัวร์</h3>
            <p className="text-gray-500 text-sm">ลองปรับเปลี่ยนคำค้นหา หรือเลือกฟิลเตอร์ใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}
