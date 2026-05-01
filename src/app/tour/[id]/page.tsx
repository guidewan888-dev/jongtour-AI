import Link from "next/link";
import { MapPin, Calendar, Clock, FileText, ChevronRight, Info, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function TourDetailsContent({ params }: { params: { id: string } }) {
  // ดึงข้อมูลทัวร์จาก Database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
  
  const res = await fetch(`${supabaseUrl}/rest/v1/Tour?id=eq.${params.id}&select=*,departures:TourDeparture(*)`, {
    headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
    cache: "no-store"
  });
  
  if (!res.ok) {
    console.error("FETCH ERROR:", res.status, res.statusText, await res.text());
    notFound();
  }
  const tours = await res.json();
  const tour = tours[0];

  if (!tour) {
    notFound(); // 404 page
  }

  // หาวันเดินทางที่ถูกที่สุด
  const lowestPrice = (tour.departures?.length || 0) > 0 
    ? Math.min(...(tour.departures || []).map((d: any) => d.price)) 
    : tour.price;

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20 pt-4">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 mb-4 text-sm text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-orange-600 transition-colors">หน้าหลัก</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/destinations/${(tour.destination || "").toLowerCase()}`} className="hover:text-orange-600 transition-colors">{tour.destination}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-800 font-medium truncate">{tour.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header Section (เรียบๆ ทางการ) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-bold border border-gray-200">
                รหัสทัวร์: {tour.id.substring(0, 8).toUpperCase()}
              </span>
              {tour.source === "API_ZEGO" && (
                <div className="h-6 w-auto flex items-center">
                  <img src="/images/wholesales/download.png" alt="LET'S GO" className="h-full w-auto object-contain" />
                </div>
              )}
              {tour.source === "API_GO365" && (
                <div className="h-6 w-auto flex items-center">
                  <img src="/images/wholesales/download.jfif" alt="GO365" className="h-full w-auto object-contain" />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">{tour.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{tour.destination}</span>
              </div>
              <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{tour.durationDays} วัน {tour.durationDays - 1 > 0 ? tour.durationDays - 1 : 0} คืน</span>
              </div>
              {tour.airlineCode && (
                <>
                  <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <img src={`https://images.kiwi.com/airlines/64x64/${tour.airlineCode}.png`} alt={tour.airlineCode} className="w-6 h-6 object-contain rounded-full shadow-sm bg-white" /> 
                    <span className="font-medium font-mono">{tour.airlineCode}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tour Image */}
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-6">
            <img 
              src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} 
              alt={tour.title} 
              className="w-full h-auto max-h-[500px] object-contain rounded bg-gray-50"
            />
          </div>
          
          {/* Overview & Download PDF */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-600" /> รายละเอียดแพ็กเกจ
              </h2>
              <a 
                href="#"
                className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-md font-bold text-sm transition-colors" 
                title="ดาวน์โหลด PDF (ระบบจะใส่หัวกระดาษบริษัทให้อัตโนมัติ)"
              >
                <FileText className="w-4 h-4" />
                ดาวน์โหลดโปรแกรมทัวร์
              </a>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {tour.description || "สัมผัสประสบการณ์การเดินทางที่เหนือกว่า พร้อมไกด์ผู้เชี่ยวชาญดูแลตลอดการเดินทาง พักสบาย เดินทางสะดวก คุ้มค่าทุกวินาที"}
            </p>
          </div>

          {/* Departures Table (เรียบๆ ทางการ) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6" id="departures-table">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" /> ตารางวันเดินทางและราคา
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">วันเดินทาง</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ราคาผู้ใหญ่</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ที่นั่งทั้งหมด</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ที่นั่งว่าง</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">สถานะ</th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">ทำรายการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tour.departures && tour.departures.length > 0 ? (
                    tour.departures.map((dep: any) => {
                      const startDateStr = new Date(dep.startDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                      const endDateStr = new Date(dep.endDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                      
                      let statusEl;
                      if (dep.availableSeats <= 0) {
                        statusEl = <span className="text-red-600 bg-red-50 px-2 py-1 rounded font-bold">เต็ม</span>;
                      } else if (dep.availableSeats <= 5) {
                        statusEl = <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold">ใกล้เต็ม</span>;
                      } else {
                        statusEl = <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold">ว่าง</span>;
                      }

                      return (
                        <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">
                            {startDateStr} - {endDateStr}
                          </td>
                          <td className="px-4 py-4 font-bold text-gray-900 text-lg">฿{dep.price.toLocaleString()}</td>
                          <td className="px-4 py-4 text-gray-600">{dep.totalSeats || '-'}</td>
                          <td className="px-4 py-4 text-gray-600">{dep.availableSeats}</td>
                          <td className="px-4 py-4">{statusEl}</td>
                          <td className="px-4 py-4">
                            {dep.availableSeats > 0 ? (
                              <Link href={`/checkout/${tour.id}?departureId=${dep.id}`} className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-4 rounded transition-colors text-xs">
                                จองเลย
                              </Link>
                            ) : (
                              <button className="bg-gray-300 text-gray-500 font-bold py-1.5 px-4 rounded text-xs cursor-not-allowed" disabled>
                                เต็ม
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        ยังไม่มีรอบเดินทางในขณะนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Formal Booking Panel (ไม่ทับแบนเนอร์) */}
        <aside className="w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
            
            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
              <h3 className="font-bold text-lg text-center">ทำรายการจอง / สอบถาม</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                <span className="text-gray-500 text-sm block mb-1">ราคาเริ่มต้นต่อท่าน</span>
                <span className="text-3xl font-black text-orange-600">
                  ฿ {lowestPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">เลือกรอบเดินทาง</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">-- กรุณาเลือกรอบเดินทาง --</option>
                    {tour.departures && tour.departures.map((dep: any) => (
                      <option key={dep.id} value={dep.id} disabled={dep.availableSeats <= 0}>
                        {new Date(dep.startDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short'})} - {new Date(dep.endDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short'})} 
                        (฿{dep.price.toLocaleString()}) {dep.availableSeats <= 0 ? '[เต็ม]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">จำนวนผู้เดินทาง</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} ท่าน</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <Link href={`/checkout/${tour.id}`} className="block w-full text-center bg-orange-600 text-white py-3 rounded-md font-bold hover:bg-orange-700 transition-colors">
                    ไปหน้าจองทัวร์
                  </Link>
                </div>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">หรือ</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                  <a href="https://line.me/ti/p/~@jongtour" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#00B900] text-white py-3 rounded-md font-bold hover:bg-[#009900] transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    สอบถามทาง LINE
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </aside>

      </div>
    </main>
  );
}

export default async function TourDetailsPage(props: { params: { id: string } }) {
  try {
    return await TourDetailsContent(props);
  } catch (error: any) {
    if (error?.message === 'NEXT_NOT_FOUND') { throw error; }
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ขออภัย เกิดข้อผิดพลาดของระบบ (500)</h1>
          <p className="text-gray-700 mb-4">ไม่สามารถโหลดข้อมูลทัวร์ได้ กรุณาลองใหม่อีกครั้ง</p>
          <div className="bg-red-50 p-4 rounded-lg text-left overflow-x-auto text-xs text-red-800 font-mono mb-6 whitespace-pre-wrap break-all">
            <strong>Error:</strong> {error?.message || "Unknown Server Error"}
          </div>
          <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700">
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }
}
