import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export default async function AgentHomePage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;

  // We fetch some featured tours. Since this is an agent, they can sell ALL tours in the system
  // unless we add specific agent-tour visibility rules later.
  const featuredTours = await prisma.tour.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { take: 1 },
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 1,
        include: { prices: true }
      }
    }
  });

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative py-24 px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ backgroundColor: 'var(--theme-color)' }}
      >
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
            ค้นหาแพ็กเกจทัวร์ทั่วโลก
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow">
            เราคัดสรรโปรแกรมทัวร์คุณภาพดีที่สุด ราคาคุ้มค่า พร้อมบริการดูแลตลอดการเดินทาง
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-full shadow-xl flex flex-col sm:flex-row items-center max-w-4xl mx-auto w-full gap-2">
            <div className="flex-1 flex items-center w-full sm:w-auto px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-full transition-colors cursor-text">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="ค้นหาประเทศ, เมือง, หรือชื่อทัวร์..." 
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>
            <button 
              className="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-full text-white font-bold shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: 'var(--theme-color)' }}
            >
              ค้นหาทัวร์
            </button>
          </div>
        </div>
      </div>

      {/* Featured Tours */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">โปรแกรมทัวร์แนะนำ</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTours.map(tour => {
            const nextDeparture = tour.departures[0];
            return (
              <Link href={`/agent/${subdomain}/tour/${tour.id}`} key={tour.id} className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {tour.images?.[0]?.imageUrl ? (
                    <img 
                      src={tour.images[0].imageUrl} 
                      alt={tour.tourName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {tour.durationDays} วัน {tour.durationDays > 1 ? tour.durationDays - 1 : 0} คืน
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {tour.tourName}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ราคาเริ่มต้น</p>
                      <p className="text-xl font-black" style={{ color: 'var(--theme-color)' }}>
                        ฿{(tour.departures?.[0]?.prices?.[0]?.sellingPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    {nextDeparture && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">เดินทางเร็วสุด</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(nextDeparture.startDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
