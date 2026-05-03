import { Search, Calendar, Users, MapPin, Building2, Ticket, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma'; // Optional: Use Prisma or Supabase directly

export const dynamic = 'force-dynamic';

export default async function TourManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  let company = null;
  
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email || "" },
      include: { agent: true }
    });
    if (dbUser?.agent) {
      company = dbUser.agent;
    }
  }

  // Fetch real tours with active departures
  const tours = await prisma.tour.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      supplier: true,
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">ค้นหาทัวร์ (B2B Tour Catalog)</h2>
          <p className="text-sm text-slate-500">เลือกโปรแกรมทัวร์ และรอบเดินทางสำหรับลูกค้าของคุณ</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อทัวร์, โค้ดทัวร์ หรือ ประเทศ..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tour Grid */}
      <div className="grid grid-cols-1 gap-6">
        {tours.map((tour) => {
          // Get cheapest price
          let minPrice = 0;
          if (tour.departures.length > 0 && tour.departures[0].prices.length > 0) {
             const adults = tour.departures[0].prices.filter(p => p.paxType === 'ADULT');
             if (adults.length > 0) {
                minPrice = Math.min(...adults.map(p => p.price));
             }
          }
          
          return (
            <div key={tour.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 shrink-0">
                 {/* Placeholder for Tour Image */}
                 <img src={tour.tourImages?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"} alt={tour.tourName} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {tour.id.substring(0,8).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin size={12}/> {tour.tourDestinations?.[0]?.country || 'Multiple'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{tour.tourName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">ราคาเริ่มต้น</p>
                    <p className="text-xl font-black text-indigo-600">฿{minPrice > 0 ? minPrice.toLocaleString() : "N/A"}</p>
                    {company?.discountRate > 0 && (
                      <p className="text-xs text-emerald-600 font-bold mt-1">ส่วนลด B2B {company.discountRate}%</p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-2 flex-1 mt-2">
                  {tour.highlights || "แพ็กเกจทัวร์คุณภาพ ออกเดินทางแน่นอน"}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1"><Calendar size={14}/> รอบเดินทางที่เปิดจอง ({tour.departures.length})</p>
                  
                  {tour.departures.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">ยังไม่มีรอบเดินทางที่เปิดจองในขณะนี้</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tour.departures.slice(0, 3).map((dep) => (
                        <div key={dep.id} className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-800">
                              {new Date(dep.startDate).toLocaleDateString('th-TH', {day:'numeric', month:'short'})} - {new Date(dep.endDate).toLocaleDateString('th-TH', {day:'numeric', month:'short'})}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${dep.remainingSeats > 5 ? 'bg-emerald-100 text-emerald-700' : dep.remainingSeats > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                              ว่าง {dep.remainingSeats} ที่
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/b2b/checkout/${dep.id}`} className={`block w-full text-center py-1.5 rounded text-xs font-bold transition-colors ${dep.remainingSeats > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 pointer-events-none'}`}>
                              {dep.remainingSeats > 0 ? 'จองทัวร์' : 'เต็มแล้ว'}
                            </Link>
                            <Link href={`/b2b/quotations/create/${dep.id}`} className={`block w-full text-center py-1.5 rounded text-xs font-bold transition-colors bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50`}>
                              เสนอราคา
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {tour.departures.length > 3 && (
                    <button className="text-xs text-indigo-600 font-bold mt-3 hover:underline">ดูรอบเดินทางทั้งหมด...</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
