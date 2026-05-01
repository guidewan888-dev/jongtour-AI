import Link from "next/link";
import { MapPin, Calendar, Clock, FileText, ChevronRight, Info } from "lucide-react";
import { notFound } from "next/navigation";
import DeparturesTable from "./DeparturesTable";
import BookingWidget from "./BookingWidget";
import { destinationConfig, findPathByKeyword, getDestinationData } from "@/lib/destinations";

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

  const destPath = findPathByKeyword(tour.destination || "");
  const { breadcrumbs } = destPath ? getDestinationData(destPath) : { breadcrumbs: [] };

  const wholesaleMap: Record<string, { slug: string, name: string, logo: string }> = {
    "API_ZEGO": { slug: "letsgo", name: "Let's Go Group", logo: "/images/wholesales/download.png" },
    "API_GO365": { slug: "go365", name: "GO 365 Travel", logo: "/images/wholesales/download.jfif" },
    "CHECKIN": { slug: "checkingroup", name: "Check In Group", logo: "/images/wholesales/CH7.jpg" },
    "TOUR_FACTORY": { slug: "tourfactory", name: "Tour Factory", logo: "/images/wholesales/Tour-Factory.jpg" }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20 pt-4">
      
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 mb-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
        <Link href="/" className="hover:text-orange-600 transition-colors">หน้าหลัก</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        
        {breadcrumbs.length > 1 ? (
          // ถ้าหา breadcrumbs เจอ
          breadcrumbs.slice(1).map((crumb, idx) => (
            <div key={crumb.url} className="flex items-center gap-2">
              <Link href={crumb.url} className="hover:text-orange-600 transition-colors">
                {crumb.name}
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </div>
          ))
        ) : (
          // ถ้าหาไม่เจอ ให้ fallback
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{tour.destination || "ไม่ระบุ"}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </div>
        )}
        
        <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-md lg:max-w-xl">{tour.title}</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 flex flex-col xl:flex-row gap-6">
        
        {/* Left Sidebar (Hidden on smaller screens, 3-column on XL) */}
        <aside className="hidden xl:block w-[280px] shrink-0 space-y-6">
          
          {/* Filter: Wholesale */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">โฮลเซลล์ (Wholesale)</h3>
            <div className="space-y-3">
              {Object.keys(wholesaleMap).map(wsKey => {
                const wsConfig = wholesaleMap[wsKey];
                return (
                  <Link href={`/wholesale/${wsConfig.slug}`} key={wsKey} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 border-2 border-transparent rounded overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-orange-500 transition-colors p-1">
                      <img src={wsConfig.logo} alt={wsConfig.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">{wsConfig.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Filter: Categories/Destinations Tree */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">จุดหมายปลายทางยอดฮิต</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              
              {/* ญี่ปุ่น */}
              <div className="pt-2 border-t border-gray-50 first:border-0 first:pt-0">
                <Link href="/destinations/asia/japan" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                  ญี่ปุ่น (JAPAN) <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                  <Link href="/destinations/asia/japan/tokyo" className="text-sm text-gray-600 hover:text-orange-600 block">โตเกียว</Link>
                  <Link href="/destinations/asia/japan/osaka" className="text-sm text-gray-600 hover:text-orange-600 block">โอซาก้า</Link>
                  <Link href="/destinations/asia/japan/hokkaido" className="text-sm text-gray-600 hover:text-orange-600 block">ฮอกไกโด</Link>
                  <Link href="/destinations/asia/japan/fukuoka" className="text-sm text-gray-600 hover:text-orange-600 block">ฟุกุโอกะ</Link>
                  <Link href="/destinations/asia/japan/kyoto" className="text-sm text-gray-600 hover:text-orange-600 block">เกียวโต</Link>
                  <Link href="/destinations/asia/japan/okinawa" className="text-sm text-gray-600 hover:text-orange-600 block">โอกินาว่า</Link>
                </div>
              </div>

              {/* จีน */}
              <div className="pt-2 border-t border-gray-50">
                <Link href="/destinations/asia/china" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                  จีน (CHINA) <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                  <Link href="/destinations/asia/china/chengdu" className="text-sm text-gray-600 hover:text-orange-600 block">เฉิงตู</Link>
                  <Link href="/destinations/asia/china/shanghai" className="text-sm text-gray-600 hover:text-orange-600 block">เซี่ยงไฮ้</Link>
                  <Link href="/destinations/asia/china/zhangjiajie" className="text-sm text-gray-600 hover:text-orange-600 block">จางเจียเจี้ย</Link>
                  <Link href="/destinations/asia/china/chongqing" className="text-sm text-gray-600 hover:text-orange-600 block">ฉงชิ่ง</Link>
                  <Link href="/destinations/asia/china/beijing" className="text-sm text-gray-600 hover:text-orange-600 block">ปักกิ่ง</Link>
                  <Link href="/destinations/asia/china/kunming" className="text-sm text-gray-600 hover:text-orange-600 block">คุนหมิง</Link>
                  <Link href="/destinations/asia/china/guilin" className="text-sm text-gray-600 hover:text-orange-600 block">กุ้ยหลิน</Link>
                  <Link href="/destinations/asia/china/xian" className="text-sm text-gray-600 hover:text-orange-600 block">ซีอาน</Link>
                  <Link href="/destinations/asia/china/silk-road" className="text-sm text-gray-600 hover:text-orange-600 block">เส้นทางสายไหม</Link>
                  <Link href="/destinations/asia/china/xinjiang" className="text-sm text-gray-600 hover:text-orange-600 block">ซินเจียง</Link>
                  <Link href="/destinations/asia/china/tibet" className="text-sm text-gray-600 hover:text-orange-600 block">ทิเบต</Link>
                  <Link href="/destinations/asia/china/lijiang" className="text-sm text-gray-600 hover:text-orange-600 block">ลี่เจียง</Link>
                  <Link href="/destinations/asia/china/yichang" className="text-sm text-gray-600 hover:text-orange-600 block">อี้ชาง</Link>
                  <Link href="/destinations/asia/china/hangzhou" className="text-sm text-gray-600 hover:text-orange-600 block">หังโจว</Link>
                  <Link href="/destinations/asia/china/dali" className="text-sm text-gray-600 hover:text-orange-600 block">ต้าหลี่</Link>
                  <Link href="/destinations/asia/china/guangzhou" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว</Link>
                  <Link href="/destinations/asia/china/harbin" className="text-sm text-gray-600 hover:text-orange-600 block">ฮาร์บิ้น</Link>
                  <Link href="/destinations/asia/china/luoyang" className="text-sm text-gray-600 hover:text-orange-600 block">ลั่วหยาง</Link>
                  <Link href="/destinations/asia/china/wangxian" className="text-sm text-gray-600 hover:text-orange-600 block">หุบเขาเทวดา</Link>
                  <Link href="/destinations/asia/china/enshi" className="text-sm text-gray-600 hover:text-orange-600 block">เอินซือ</Link>
                  <Link href="/destinations/asia/china/qingdao" className="text-sm text-gray-600 hover:text-orange-600 block">ชิงเต่า</Link>
                  <Link href="/destinations/asia/china/dalian" className="text-sm text-gray-600 hover:text-orange-600 block">ต้าเหลียน</Link>
                  <Link href="/destinations/asia/china/inner-mongolia" className="text-sm text-gray-600 hover:text-orange-600 block">มองโกเลีย</Link>
                  <Link href="/destinations/asia/china/zhuhai" className="text-sm text-gray-600 hover:text-orange-600 block">จู่ไห่</Link>

                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 mb-1 block">เส้นทางพิเศษ</span>
                    <Link href="/destinations/asia/china/no-shopping" className="text-sm text-gray-600 hover:text-orange-600 block">ทัวร์ไม่ลงร้าน</Link>
                    <Link href="/destinations/asia/china/chongqing-zhangjiajie" className="text-sm text-gray-600 hover:text-orange-600 block">ฉงชิ่ง-จางเจียเจี้ย</Link>
                    <Link href="/destinations/asia/china/shanghai-beijing" className="text-sm text-gray-600 hover:text-orange-600 block">เซี่ยงไฮ้-ปักกิ่ง</Link>
                    <Link href="/destinations/asia/china/zhuhai-macau" className="text-sm text-gray-600 hover:text-orange-600 block">จู่ไห่-มาเก๊า</Link>
                    <Link href="/destinations/asia/china/guangzhou-macau" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว-มาเก๊า</Link>
                    <Link href="/destinations/asia/china/guangzhou-hongkong" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว-ฮ่องกง</Link>
                  </div>
                </div>
              </div>

              {/* ทัวร์เอเชีย */}
              <div className="pt-2 border-t border-gray-50">
                <Link href="/destinations/asia" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                  เอเชีย (ASIA) <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                  <Link href="/destinations/asia/south-korea" className="text-sm text-gray-600 hover:text-orange-600 block">เกาหลีใต้ (Korea)</Link>
                  <Link href="/destinations/asia/taiwan" className="text-sm text-gray-600 hover:text-orange-600 block">ไต้หวัน (Taiwan)</Link>
                  <Link href="/destinations/asia/hongkong" className="text-sm text-gray-600 hover:text-orange-600 block">ฮ่องกง (Hong Kong)</Link>
                  <Link href="/destinations/asia/macau" className="text-sm text-gray-600 hover:text-orange-600 block">มาเก๊า (Macau)</Link>
                  <Link href="/destinations/asia/vietnam" className="text-sm text-gray-600 hover:text-orange-600 block">เวียดนาม (Vietnam)</Link>
                  <Link href="/destinations/asia/singapore" className="text-sm text-gray-600 hover:text-orange-600 block">สิงคโปร์ (Singapore)</Link>
                  <Link href="/destinations/asia/malaysia" className="text-sm text-gray-600 hover:text-orange-600 block">มาเลเซีย (Malaysia)</Link>
                  <Link href="/destinations/asia/indonesia" className="text-sm text-gray-600 hover:text-orange-600 block">อินโดนีเซีย (Indonesia)</Link>
                  <Link href="/destinations/asia/india" className="text-sm text-gray-600 hover:text-orange-600 block">อินเดีย (India)</Link>
                  <Link href="/destinations/asia/maldives" className="text-sm text-gray-600 hover:text-orange-600 block">มัลดีฟส์ (Maldives)</Link>
                </div>
              </div>

              {/* ยุโรป & ตะวันออกกลาง */}
              <div className="pt-2 border-t border-gray-50">
                <Link href="/destinations/europe" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                  ยุโรป & ตะวันออกกลาง <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                  <Link href="/destinations/europe/switzerland" className="text-sm text-gray-600 hover:text-orange-600 block">สวิตเซอร์แลนด์</Link>
                  <Link href="/destinations/europe/italy" className="text-sm text-gray-600 hover:text-orange-600 block">อิตาลี</Link>
                  <Link href="/destinations/europe/france" className="text-sm text-gray-600 hover:text-orange-600 block">ฝรั่งเศส</Link>
                  <Link href="/destinations/europe/uk" className="text-sm text-gray-600 hover:text-orange-600 block">อังกฤษ</Link>
                  <Link href="/destinations/europe/germany" className="text-sm text-gray-600 hover:text-orange-600 block">เยอรมนี</Link>
                  <Link href="/destinations/europe/austria" className="text-sm text-gray-600 hover:text-orange-600 block">ออสเตรีย</Link>
                  <Link href="/destinations/europe/czech" className="text-sm text-gray-600 hover:text-orange-600 block">เช็ก</Link>
                  <Link href="/destinations/europe/spain" className="text-sm text-gray-600 hover:text-orange-600 block">สเปน</Link>
                  <Link href="/destinations/europe/netherlands" className="text-sm text-gray-600 hover:text-orange-600 block">เนเธอร์แลนด์</Link>
                  <Link href="/destinations/europe/finland" className="text-sm text-gray-600 hover:text-orange-600 block">ฟินแลนด์</Link>
                  <div className="my-2 pt-2 border-t border-gray-100"></div>
                  <Link href="/destinations/middle-east/turkey" className="text-sm text-gray-600 hover:text-orange-600 block">ตุรกี</Link>
                  <Link href="/destinations/europe/georgia" className="text-sm text-gray-600 hover:text-orange-600 block">จอร์เจีย</Link>
                  <Link href="/destinations/middle-east/egypt" className="text-sm text-gray-600 hover:text-orange-600 block">อียิปต์</Link>
                  <Link href="/destinations/middle-east/jordan" className="text-sm text-gray-600 hover:text-orange-600 block">จอร์แดน</Link>
                  <Link href="/destinations/africa/morocco" className="text-sm text-gray-600 hover:text-orange-600 block">โมร็อกโก</Link>
                </div>
              </div>
              
              {/* อเมริกา & โอเชียเนีย */}
              <div className="pt-2 border-t border-gray-50">
                <div className="font-bold text-sm text-gray-800 flex justify-between items-center mb-2">
                  อเมริกา & โอเชียเนีย
                </div>
                <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                  <Link href="/destinations/america/usa" className="text-sm text-gray-600 hover:text-orange-600 block">อเมริกา</Link>
                  <Link href="/destinations/america/canada" className="text-sm text-gray-600 hover:text-orange-600 block">แคนาดา</Link>
                  <div className="my-2 pt-2 border-t border-gray-100"></div>
                  <Link href="/destinations/oceania/australia" className="text-sm text-gray-600 hover:text-orange-600 block">ออสเตรเลีย</Link>
                  <Link href="/destinations/oceania/new-zealand" className="text-sm text-gray-600 hover:text-orange-600 block">นิวซีแลนด์</Link>
                </div>
              </div>
              
            </div>
          </div>
        </aside>

        {/* Middle Column: Content */}
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

          {/* Tour Image & Highlights (Side by Side) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-6 items-start">
            
            {/* Left: Tour Image */}
            <div className="w-full md:w-[280px] shrink-0">
              <img 
                src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} 
                alt={tour.title} 
                className="w-full h-auto aspect-auto object-contain rounded border border-gray-100 shadow-sm bg-gray-50"
              />
            </div>
            
            {/* Right: Overview & Download PDF */}
            <div className="flex-1 min-w-0 w-full flex flex-col">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 shrink-0">
                  <Info className="w-5 h-5 text-orange-600" /> ไฮไลท์แพ็กเกจ
                </h2>
                <a 
                  href={tour.pdfUrl || "#"}
                  target={tour.pdfUrl ? "_blank" : "_self"}
                  rel={tour.pdfUrl ? "noopener noreferrer" : ""}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-colors shrink-0 ${
                    tour.pdfUrl 
                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" 
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-default"
                  }`}
                  title={tour.pdfUrl ? "ดาวน์โหลดโปรแกรมทัวร์ (PDF)" : "ไม่มีไฟล์ PDF สำหรับโปรแกรมนี้"}
                  style={{ pointerEvents: tour.pdfUrl ? "auto" : "none" }}
                >
                  <FileText className="w-4 h-4" />
                  ดาวน์โหลดโปรแกรมทัวร์
                </a>
              </div>
              
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm max-h-[350px] overflow-y-auto pr-3 custom-scrollbar bg-gray-50/50 p-4 rounded-md border border-gray-50">
                {tour.description || "สัมผัสประสบการณ์การเดินทางที่เหนือกว่า พร้อมไกด์ผู้เชี่ยวชาญดูแลตลอดการเดินทาง พักสบาย เดินทางสะดวก คุ้มค่าทุกวินาที"}
              </div>
            </div>
            
          </div>

          {/* Departures Table (Client Component) */}
          <DeparturesTable departures={tour.departures || []} tourId={tour.id} />

          {/* PDF Viewer (แทนที่แผนการเดินทางแบบตัวหนังสือ) */}
          {tour.pdfUrl && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 mb-6" id="program-pdf">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" /> โปรแกรมทัวร์ (PDF)
              </h2>
              <div className="w-full aspect-[1/1.4] md:aspect-auto md:h-[800px] rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                <iframe 
                  src={`${tour.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-full border-none"
                  title="Tour Program PDF"
                  loading="lazy"
                >
                  <p>เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF กรุณา <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ดาวน์โหลดไฟล์</a> แทน</p>
                </iframe>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Formal Booking Panel (ไม่ทับแบนเนอร์) */}
        <aside className="w-full lg:w-[350px] shrink-0">
          <BookingWidget lowestPrice={lowestPrice} tourId={tour.id} departures={tour.departures || []} />
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
