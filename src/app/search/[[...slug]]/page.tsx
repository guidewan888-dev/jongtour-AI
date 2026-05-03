import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { Map, Calendar, Users, Star, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({ 
  params,
  searchParams 
}: { 
  params: { slug?: string[] },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const slug = params?.slug || [];
  const supplierId = typeof searchParams?.supplier_id === 'string' ? searchParams.supplier_id : undefined;
  
  let destinationFilter = undefined;

  if (slug.includes("japan") || slug.includes("thailand")) {
    destinationFilter = "Japan";
  } else if (slug.includes("europe")) {
    destinationFilter = "Europe";
  } else if (slug.includes("south-korea") || slug.includes("korea")) {
    destinationFilter = "South Korea";
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI'
  );

  let query = supabase
    .from('tours')
    .select(`
      *,
      departures(*, prices(*)),
      destinations:tour_destinations(*),
      images:tour_images(*),
      supplier:suppliers(*)
    `)
    .eq('status', 'PUBLISHED')
    .order('createdAt', { ascending: false })
    .limit(30);

  if (supplierId) {
    query = query.eq('supplierId', supplierId);
  }

  const { data, error } = await query;
  let toursData = data || [];

  if (destinationFilter && toursData.length > 0) {
    toursData = toursData.filter((t: any) => 
      t.destinations?.some((d: any) => 
        d.country?.toLowerCase().includes(destinationFilter!.toLowerCase())
      )
    );
  }

  const today = new Date();
  const tours = toursData.map((t: any) => {
    const futureDeps = (t.departures || []).filter((d: any) => new Date(d.startDate) >= today);
    futureDeps.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return {
      id: t.id,
      title: t.tourName,
      description: "แพ็กเกจทัวร์คุณภาพ ออกเดินทางแน่นอน",
      durationDays: t.durationDays,
      destination: t.destinations?.[0]?.country || "ไม่ระบุ",
      imageUrl: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
      source: t.supplier?.bookingMethod || "UNKNOWN",
      departures: futureDeps.map((d: any) => ({
        id: d.id,
        startDate: d.startDate,
        endDate: d.endDate,
        price: d.prices?.[0]?.sellingPrice || 0
      })),
      price: futureDeps.length > 0 ? Math.min(...futureDeps.map((d: any) => d.prices?.[0]?.sellingPrice || 0)) : 0
    };
  }).filter(t => t.departures.length > 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* Search Header */}
      <div className="bg-slate-900 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ค้นหาแพ็กเกจทัวร์ <span className="text-orange-500">ทั่วโลก</span>
          </h1>
          
          <div className="bg-white p-2 rounded-full flex items-center shadow-xl max-w-3xl">
            <input 
              type="text" 
              placeholder="ค้นหาประเทศ, เมือง หรือชื่อทัวร์..." 
              className="flex-1 px-6 py-3 outline-none text-gray-700 bg-transparent text-lg"
              defaultValue={destinationFilter || ""}
            />
            <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <Filter className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-gray-800 text-lg">ตัวกรอง</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-700 mb-3">ช่วงราคา</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> ต่ำกว่า 20,000 ฿</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> 20,000 - 40,000 ฿</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> 40,000 ฿ ขึ้นไป</label>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-3">ระยะเวลา</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> 1-3 วัน</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> 4-6 วัน</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-orange-500" /> 7 วันขึ้นไป</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Search Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">พบทัวร์ทั้งหมด <span className="font-bold text-gray-800">{tours.length}</span> รายการ</p>
            <select className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl outline-none focus:border-orange-500 text-sm font-medium">
              <option>แนะนำ</option>
              <option>ราคา ต่ำ-สูง</option>
              <option>ราคา สูง-ต่ำ</option>
            </select>
          </div>

          {tours.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบแพ็กเกจทัวร์</h2>
              <p className="text-gray-500 mb-6">ลองเปลี่ยนคำค้นหาหรือเลือกตัวกรองใหม่</p>
              <Link href="/search" className="bg-orange-100 text-orange-600 font-bold px-6 py-2 rounded-xl hover:bg-orange-200 transition-colors">
                ดูทัวร์ทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tours.map((tour) => (
                <div key={tour.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full">
                  
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"} 
                      alt={tour.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                      <Map className="w-3.5 h-3.5 text-orange-500" /> {tour.destination}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    
                    <Link href={`/tour/${tour.id}`} className="block">
                      <h3 className="font-bold text-gray-800 text-lg leading-snug mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {tour.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                      {tour.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {tour.durationDays} วัน {tour.durationDays - 1} คืน
                      </div>
                      {tour.source !== "MANUAL" && (
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                          ⚡ API Sync ({tour.source})
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">ราคาเริ่มต้น</p>
                        <p className="text-xl font-black text-orange-500">
                          {tour.price.toLocaleString()} <span className="text-sm font-medium">฿</span>
                        </p>
                      </div>
                      <Link 
                        href={`/tour/${tour.id}`} 
                        className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-orange-500 transition-colors shadow-sm"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
