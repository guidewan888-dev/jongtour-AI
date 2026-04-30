import Link from "next/link";
import prisma from "@/lib/prisma";
import { MapPin, Calendar, Clock, Plane, CheckCircle2, Star, Share2, Heart, ShieldCheck, MessageCircle, ChevronRight, Info } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function TourDetailsContent({ params }: { params: { id: string } }) {
  // ดึงข้อมูลทัวร์จาก Database
  console.log("FETCHING TOUR ID:", params.id);
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
    console.error("NO TOUR FOUND");
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
          
          {/* Header Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-bold border border-orange-200">แพ็กเกจทัวร์แนะนำ</span>
              {tour.source === "API_ZEGO" && (
                <div className="h-6 w-auto bg-white rounded flex items-center px-2 py-0.5 border border-gray-200 shadow-sm">
                  <img src="/images/logos/letsgo-logo.png" alt="LET'S GO" className="h-full w-auto object-contain" />
                </div>
              )}
              {tour.source === "API_GO365" && (
                <div className="h-6 w-auto bg-white rounded flex items-center px-2 py-0.5 border border-gray-200 shadow-sm">
                  <img src="/images/logos/go365-logo.png" alt="GO365" className="h-full w-auto object-contain" />
                </div>
              )}
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold">รหัส: {tour.id.substring(0, 8).toUpperCase()}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2">{tour.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5 font-medium text-orange-600"><MapPin className="w-4 h-4" /> {tour.destination}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {tour.durationDays} วัน {tour.durationDays - 1 > 0 ? tour.durationDays - 1 : 0} คืน</span>
              {tour.airlineCode && (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="flex items-center gap-1.5">
                    <img src={`https://images.kiwi.com/airlines/64x64/${tour.airlineCode}.png`} alt={tour.airlineCode} className="w-4 h-4 object-contain" /> 
                    บินตรง
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <div className="bg-orange-50 px-2 py-1 rounded text-orange-600 text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-orange-600" /> 8.5 ดีเยี่ยม
              </div>
              <div className="text-gray-500 text-xs flex items-center">จาก 128 รีวิว</div>
            </div>

            {/* Action Links & Flights */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4 mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-100">
                  รายละเอียดโปรแกรมทัวร์
                </span>
                <button className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1">
                  <Plane className="w-3 h-3" /> โปรแกรมย่อ 1
                </button>
                <button className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1">
                  <Plane className="w-3 h-3" /> โปรแกรมย่อ 2
                </button>
                <button className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-200 hover:bg-amber-200 transition-colors">
                  🔗 Short Link
                </button>
                <button className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-200 hover:bg-amber-200 transition-colors">
                  🔗 Full Link
                </button>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                  <Plane className="w-4 h-4 text-emerald-500" /> VZ830 <span className="text-gray-400 font-normal">23:55 - 07:55</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                  <Plane className="w-4 h-4 text-emerald-500" /> VZ831 <span className="text-gray-400 font-normal">08:55 - 14:30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agoda Style Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-6 rounded-2xl overflow-hidden">
            <div className="md:col-span-3 md:row-span-2 relative h-full group">
              <img 
                src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} 
                alt={tour.title} 
                className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white/90 backdrop-blur shadow-md hover:bg-white rounded-full flex items-center justify-center text-gray-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 bg-white/90 backdrop-blur shadow-md hover:bg-white rounded-full flex items-center justify-center text-rose-500 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="hidden md:block bg-gray-200 h-full relative">
              <img src="https://images.unsplash.com/photo-1542051812871-7585024d2719?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer" alt="Gallery 1" />
            </div>
            <div className="hidden md:block bg-gray-200 h-full relative">
              <img src="https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer" alt="Gallery 2" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-all">
                <span className="text-white font-bold text-sm border-2 border-white px-4 py-2 rounded-lg backdrop-blur-sm">ดูรูปทั้งหมด +12</span>
              </div>
            </div>
          </div>
          
          {/* Overview Tab */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6" id="overview">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" /> ภาพรวมแพ็กเกจ (Overview)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">
              {tour.description || "สัมผัสประสบการณ์การเดินทางที่เหนือกว่า พร้อมไกด์ผู้เชี่ยวชาญดูแลตลอดการเดินทาง พักสบาย เดินทางสะดวก คุ้มค่าทุกวินาที"}
            </p>
            
            <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">สิ่งอำนวยความสะดวกยอดนิยม</h3>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
                <li className="flex flex-col items-center justify-center text-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> 
                  <span className="text-xs font-medium text-gray-700">โรงแรม 4 ดาว</span>
                </li>
                <li className="flex flex-col items-center justify-center text-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> 
                  <span className="text-xs font-medium text-gray-700">รวมค่าเข้าชม</span>
                </li>
                <li className="flex flex-col items-center justify-center text-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> 
                  <span className="text-xs font-medium text-gray-700">อาหารครบมื้อ</span>
                </li>
                <li className="flex flex-col items-center justify-center text-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> 
                  <span className="text-xs font-medium text-gray-700">ไกด์นำเที่ยว</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Itinerary Timeline */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6" id="itinerary">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" /> แผนการเดินทาง (Itinerary)
            </h2>
            
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {[...Array(Math.max(0, tour.durationDays || 0))].map((_, i) => {
                const day = i + 1;
                return (
                  <div key={day} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-10">
                    {/* Timeline Dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-600 text-white font-bold shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {day}
                    </div>
                    
                    {/* Content Box */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl bg-white border border-gray-100 shadow-sm group-hover:shadow-md transition-all group-hover:border-orange-200">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" /> วันที่ {day}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">
                        {day === 1 ? "สนามบินสุวรรณภูมิ - เดินทาง" : 
                         day === tour.durationDays ? "เดินทางกลับ - กรุงเทพฯ" : 
                         "ท่องเที่ยวตามอัธยาศัย / ชมเมือง"}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        รายละเอียดการเดินทางในวันที่ {day} สำหรับแพ็กเกจนี้ ลูกค้าจะได้เพลิดเพลินกับสถานที่ท่องเที่ยวที่คัดสรรมาเป็นอย่างดี พร้อมรับประทานอาหารพื้นเมืองสุดอร่อย
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Departures Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6" id="departures-table">
            <div className="bg-orange-500 text-white p-4">
              <h2 className="text-lg font-bold flex items-center gap-2 justify-center">
                <Calendar className="w-5 h-5" /> รอบเดินทาง (Departures)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-orange-500 text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">เดินทาง</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">บัส</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">ราคา</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">พักเดี่ยว</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">ทารก</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">มัดจำ</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">ที่นั่ง</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">จอง</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap border-r border-orange-400/30">รับได้</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tour.departures.length > 0 ? (
                    tour.departures.map((dep: any) => {
                      const startDateStr = new Date(dep.startDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                      const endDateStr = new Date(dep.endDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                      return (
                        <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">คอนเฟิร์ม</span>
                              <span className="font-medium text-gray-800">{startDateStr} - {endDateStr}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">A</td>
                          <td className="px-4 py-4 font-bold text-gray-900">{dep.price.toLocaleString()}</td>
                          <td className="px-4 py-4 text-gray-600">6,000</td>
                          <td className="px-4 py-4 text-gray-600">6,000</td>
                          <td className="px-4 py-4 text-gray-600">15,000</td>
                          <td className="px-4 py-4 text-gray-600">{dep.availableSeats + 12}</td>
                          <td className="px-4 py-4 text-gray-600">12</td>
                          <td className="px-4 py-4">
                            <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded">{dep.availableSeats}</span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-[10px] text-red-500 font-medium leading-tight text-left">
                              ราคาจอยไม่รวมค่าตั๋ว<br/>น้ำหนักเพิ่ม 1,210 บาท
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        ยังไม่มีรอบเดินทางในขณะนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Booking Panel (Agoda Style) */}
        <aside className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-24 overflow-hidden">
            
            {/* Header Price */}
            <div className="bg-gradient-to-b from-orange-50 to-white p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-sm font-medium">ราคาเริ่มต้น (ต่อท่าน)</span>
                {tour.price > lowestPrice && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">ลดพิเศษ</span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">
                  ฿ {lowestPrice.toLocaleString()}
                </span>
              </div>
              {tour.price > lowestPrice && (
                <div className="text-xs text-gray-400 line-through mt-1">ราคาปกติ ฿{tour.price.toLocaleString()}</div>
              )}
            </div>

            {/* Departures Selection */}
            <div className="p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">เลือกรอบวันเดินทาง:</h3>
              
              <div className="max-h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {tour.departures.length > 0 ? (
                  tour.departures.map((dep: any) => (
                    <label key={dep.id} className="block cursor-pointer group">
                      <input type="radio" name="departure" className="peer sr-only" defaultChecked={dep.price === lowestPrice} />
                      <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-orange-300 peer-checked:border-orange-600 peer-checked:bg-orange-50/50 transition-all relative overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800 text-sm">
                            {new Date(dep.startDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: '2-digit'})} - {new Date(dep.endDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: '2-digit'})}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div>
                            {dep.availableSeats <= 5 ? (
                              <span className="text-red-600 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">เหลือแค่ {dep.availableSeats} ที่</span>
                            ) : (
                              <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">ว่าง {dep.availableSeats} ที่</span>
                            )}
                          </div>
                          <span className="text-orange-600 font-black text-sm">฿{dep.price.toLocaleString()}</span>
                        </div>
                        
                        {/* Checkmark icon for selected state */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-orange-600 border-l-transparent opacity-0 peer-checked:opacity-100 transition-opacity">
                        </div>
                        <CheckCircle2 className="w-3 h-3 text-white absolute top-1 right-1 opacity-0 peer-checked:opacity-100 transition-opacity z-10" />
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm border border-gray-100">
                    โปรดติดต่อสอบถามรอบเดินทาง
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Link href={`/checkout/${tour.id}`} className="flex items-center justify-center w-full bg-orange-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors shadow-sm">
                  จองเลย
                </Link>
                
                <a href="https://line.me/ti/p/~@jongtour" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#00B900] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#009900] transition-colors shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                  สอบถามทาง LINE
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex items-start gap-3 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p>รับประกันราคาดีที่สุด จองวันนี้เพื่อล็อคที่นั่งและโปรโมชั่น</p>
                </div>
                <div className="flex items-start gap-3 text-xs text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <p>ไม่มีการเก็บค่าธรรมเนียมบัตรเครดิตแอบแฝง</p>
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
