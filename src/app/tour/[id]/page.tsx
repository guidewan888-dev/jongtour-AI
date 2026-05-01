import Link from "next/link";
import { MapPin, Calendar, Clock, FileText, ChevronRight, Info } from "lucide-react";
import { notFound } from "next/navigation";
import DeparturesTable from "./DeparturesTable";
import BookingWidget from "./BookingWidget";

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
                  href="#"
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-md font-bold text-xs transition-colors shrink-0" 
                  title="ดาวน์โหลด PDF (ระบบจะใส่หัวกระดาษบริษัทให้อัตโนมัติ)"
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
