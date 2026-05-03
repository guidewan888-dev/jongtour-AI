import Link from "next/link";
import { MapPin, Calendar, Clock, FileText, ChevronRight, Info, Plane, Star, Download, ShieldCheck, CheckCircle2, ChevronDown, MessageSquareText, FileQuestion, ThumbsUp, Hotel, Utensils } from "lucide-react";
import { notFound } from "next/navigation";
import DeparturesTable from "./DeparturesTable";
import BookingWidget from "./BookingWidget";
import { destinationConfig, findPathByKeyword, getDestinationData } from "@/lib/destinations";
import { createClient } from '@supabase/supabase-js';

import { Badge } from "@/components/ui-new/Badge";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI'
  );

  const { data: tour } = await supabase
    .from('tours')
    .select('tourName, destinations:tour_destinations(country), images:tour_images(imageUrl)')
    .eq('id', params.id)
    .single();

  if (!tour) return { title: 'Not Found - Jongtour' };

  const dest = tour.destinations?.[0]?.country || 'ทัวร์ต่างประเทศ';
  const imgUrl = tour.images?.[0]?.imageUrl || 'https://jongtour.com/images/wholesales/CH7.jpg';

  return {
    title: `${tour.tourName} | จองทัวร์${dest} - Jongtour`,
    description: `แพ็กเกจทัวร์${dest} ${tour.tourName} จองง่าย คุ้มค่าที่สุดกับ Jongtour AI`,
    openGraph: {
      title: `${tour.tourName} | จองทัวร์${dest} - Jongtour`,
      description: `แพ็กเกจทัวร์${dest} ${tour.tourName} จองง่าย คุ้มค่าที่สุดกับ Jongtour AI`,
      images: [
        {
          url: imgUrl,
          width: 800,
          height: 600,
          alt: tour.tourName,
        },
      ],
    },
  };
}

export async function TourDetailsContent({ params, agentId }: { params: { id: string }, agentId?: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI'
  );

  const { data: tourRaw, error } = await supabase
    .from('tours')
    .select(`
      *,
      supplier:suppliers(*),
      destinations:tour_destinations(*),
      images:tour_images(*),
      departures(*, prices(*))
    `)
    .eq('id', params.id)
    .single();

  let tour = tourRaw;
  if (tour) {
    const today = new Date();
    const validDeps = (tour.departures || []).filter((d: any) => new Date(d.startDate) >= today);
    validDeps.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    tour.departures = validDeps;
  }

  if (!tour) {
    notFound(); 
  }

  const mappedDepartures = tour.departures.map((d: any) => ({
    id: d.id,
    startDate: d.startDate,
    endDate: d.endDate,
    totalSeats: d.totalSeats,
    availableSeats: d.remainingSeats,
    price: d.prices?.[0]?.sellingPrice || 0
  }));

  const lowestPrice = mappedDepartures.length > 0 
    ? Math.min(...mappedDepartures.map((d: any) => d.price)) 
    : 0;

  const tourDestination = tour.destinations?.[0]?.country || "";

  // Mock Itinerary Data for UI demonstration
  const itinerary = Array.from({ length: tour.durationDays || 3 }).map((_, i) => ({
     day: i + 1,
     title: i === 0 ? "ออกเดินทางจาก กรุงเทพฯ - สู่จุดหมายปลายทาง" : i === (tour.durationDays - 1) ? "เดินทางกลับ กรุงเทพฯ โดยสวัสดิภาพ" : "ท่องเที่ยวอิสระ หรือ ตามโปรแกรม",
     desc: "สัมผัสประสบการณ์สุดพิเศษพร้อมไกด์ดูแลตลอดการเดินทาง พักผ่อนตามอัธยาศัย",
     meals: i === 0 ? "เย็น" : "เช้า, กลางวัน, เย็น"
  }));

  return (
    <main className="min-h-screen bg-background pb-32 font-sans relative">
      
      {/* Top Banner & Breadcrumb */}
      <div className="bg-trust-900 text-white pt-6 pb-28">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-xs md:text-sm text-trust-300 overflow-x-auto whitespace-nowrap hide-scrollbar mb-6">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/tour/search" className="hover:text-white transition-colors">ค้นหาทัวร์</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-white font-medium">รหัสทัวร์: {tour.tourCode}</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
           <div>
              <div className="flex gap-2 mb-3">
                 <Badge variant="brand" className="bg-primary/20 text-primary-100 border-transparent">AI Match: 98% ⚡</Badge>
                 <Badge variant="outline" className="text-trust-200 border-trust-600 bg-trust-800/50">ยอดนิยม</Badge>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">{tour.tourName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-trust-200 text-sm">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary"/> {tourDestination}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary"/> {tour.durationDays} วัน {tour.durationDays - 1 > 0 ? tour.durationDays - 1 : 0} คืน</div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary"/> ให้บริการโดย {tour.supplier?.name || "Jongtour Partner"}</div>
              </div>
           </div>
           
           {/* Mobile Price Hidden here, shown in sticky bottom */}
           <div className="hidden md:block text-right bg-trust-800/40 p-4 rounded-xl border border-trust-700 backdrop-blur-md">
              <p className="text-trust-300 text-xs mb-1">ราคาเริ่มต้น</p>
              <div className="text-4xl font-black text-primary">฿{lowestPrice.toLocaleString()}</div>
              <p className="text-trust-400 text-[10px] mt-1">/ท่าน รวมภาษีแล้ว</p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Hero Gallery */}
          <Card className="overflow-hidden border-border shadow-soft p-1">
             <div className="w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden relative group">
               <img 
                 src={tour.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} 
                 alt={tour.tourName} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge variant="success" className="shadow-lg backdrop-blur-md bg-emerald-500/90 py-1.5 px-3">จองด่วน มีที่ว่าง</Badge>
               </div>
             </div>
             
             {/* Key Highlights Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted text-center hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                   <Plane className="w-6 h-6 text-primary mb-2" />
                   <span className="text-xs font-bold text-trust-900">สายการบิน</span>
                   <span className="text-[10px] text-muted-foreground">Full Service</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted text-center hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                   <Hotel className="w-6 h-6 text-primary mb-2" />
                   <span className="text-xs font-bold text-trust-900">ที่พักมาตรฐาน</span>
                   <span className="text-[10px] text-muted-foreground">ระดับ 4-5 ดาว</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted text-center hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                   <Utensils className="w-6 h-6 text-primary mb-2" />
                   <span className="text-xs font-bold text-trust-900">อาหารครบมื้อ</span>
                   <span className="text-[10px] text-muted-foreground">เมนูพิเศษทุกวัน</span>
                </div>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary-50 text-center hover:bg-primary-100 transition-colors border border-primary-200 group">
                   <Download className="w-6 h-6 text-primary mb-2 group-hover:-translate-y-1 transition-transform" />
                   <span className="text-xs font-bold text-primary-800">โหลดโปรแกรม</span>
                   <span className="text-[10px] text-primary-600">PDF File</span>
                </button>
             </div>
          </Card>

          {/* Embedded AI Assistant Panel */}
          <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-1 shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
             <div className="bg-white rounded-[14px] p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center shadow-inner shrink-0">
                      <MessageSquareText className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="font-bold text-trust-900 flex items-center gap-1.5">ถาม Jongtour AI เกี่ยวกับทัวร์นี้ <Sparkles className="w-4 h-4 text-primary"/></h3>
                      <p className="text-xs text-muted-foreground">AI สามารถวิเคราะห์โปรแกรม เช็คสภาพอากาศ และแนะนำการแต่งตัวได้ทันที</p>
                   </div>
                </div>
                <Button variant="brand" className="w-full md:w-auto shadow-floating rounded-full px-6 gap-2" onClick={() => document.getElementById('ai-chat-btn')?.click()}>
                   ถาม AI เลยตอนนี้
                </Button>
             </div>
          </div>

          {/* Quick Summary / Highlight */}
          <Card className="border-border shadow-soft">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-trust-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> ไฮไลท์โปรแกรมทัวร์
              </h2>
              <div className="prose prose-sm md:prose-base prose-slate max-w-none text-muted-foreground leading-relaxed">
                 <p className="font-medium text-trust-800 mb-4">สัมผัสประสบการณ์การเดินทางที่เหนือกว่า พร้อมไกด์ผู้เชี่ยวชาญดูแลตลอดการเดินทาง พักสบาย เดินทางสะดวก คุ้มค่าทุกวินาที</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> เที่ยวชมหมู่บ้านมรดกโลก ชิราคาวาโกะ</div>
                    <div className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> ช้อปปิ้งจุใจที่ย่านชินจูกุและฮาราจูกุ</div>
                    <div className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> แช่ออนเซ็นธรรมชาติแท้ 100%</div>
                    <div className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> พิเศษ! บุฟเฟต์ขาปูยักษ์ไม่อั้น พร้อมเครื่องดื่ม</div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Itinerary by Day */}
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-trust-900 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" /> แผนการเดินทาง (Itinerary)
             </h2>
             <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {itinerary.map((day, idx) => (
                   <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 font-bold text-sm">
                         วันที่ {day.day}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-16 md:ml-0 p-5 rounded-2xl shadow-sm border border-border bg-white hover:border-primary/50 transition-colors">
                         <h3 className="font-bold text-trust-900 text-sm md:text-base mb-2">{day.title}</h3>
                         <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{day.desc}</p>
                         <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-trust-700 font-medium">
                            <Utensils className="w-3.5 h-3.5 text-primary" /> มื้ออาหาร: {day.meals}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Departures Table Section */}
          <div id="departures" className="scroll-mt-24">
             <h2 className="text-xl font-bold text-trust-900 mb-4 flex items-center gap-2">
               <Plane className="w-5 h-5 text-primary" /> เลือกรอบวันเดินทาง (Departures)
             </h2>
             <div className="bg-white rounded-2xl shadow-soft border border-border overflow-hidden p-2">
                <DeparturesTable departures={mappedDepartures} tourId={tour.id} />
             </div>
          </div>

          {/* Included / Excluded & Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border-border shadow-sm border-t-4 border-t-emerald-500">
                <CardContent className="p-6">
                   <h3 className="font-bold text-trust-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> อัตรานี้รวม (Included)</h3>
                   <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• ค่าตั๋วเครื่องบินไป-กลับ พร้อมน้ำหนักกระเป๋า</li>
                      <li>• ค่าโรงแรมที่พักตามรายการ (ห้องละ 2-3 ท่าน)</li>
                      <li>• ค่าอาหารทุกมื้อตามที่ระบุในรายการ</li>
                      <li>• ค่าเข้าชมสถานที่ต่างๆ ตามรายการ</li>
                      <li>• ประกันอุบัติเหตุระหว่างการเดินทาง</li>
                   </ul>
                </CardContent>
             </Card>
             <Card className="border-border shadow-sm border-t-4 border-t-destructive">
                <CardContent className="p-6">
                   <h3 className="font-bold text-trust-900 mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-destructive" /> อัตรานี้ไม่รวม (Excluded)</h3>
                   <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• ค่าวีซ่า (ถ้ามี หรือสำหรับชาวต่างชาติ)</li>
                      <li>• ทิปไกด์ท้องถิ่นและคนขับรถ (ประมาณ 1,500 บาท)</li>
                      <li>• ค่าใช้จ่ายส่วนตัวนอกเหนือจากรายการ</li>
                      <li>• ภาษีมูลค่าเพิ่ม 7% และหัก ณ ที่จ่าย 3% (กรณีขอใบกำกับภาษี)</li>
                   </ul>
                </CardContent>
             </Card>
          </div>

          {/* FAQ Section */}
          <Card className="border-border shadow-soft bg-muted/30">
             <CardContent className="p-6 md:p-8">
               <h2 className="text-xl font-bold text-trust-900 mb-6 flex items-center gap-2">
                 <FileQuestion className="w-5 h-5 text-primary" /> คำถามที่พบบ่อย (FAQ)
               </h2>
               <div className="space-y-4">
                  <details className="group bg-white rounded-xl border border-border p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm">
                     <summary className="flex justify-between items-center font-bold text-trust-900 text-sm">
                        จองทัวร์แล้วสามารถยกเลิกได้หรือไม่?
                        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                     </summary>
                     <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        สามารถยกเลิกได้ตามเงื่อนไขที่บริษัทกำหนด หากยกเลิกก่อนเดินทาง 30 วัน คืนเงินมัดจำเต็มจำนวน (หักค่าใช้จ่ายที่เกิดขึ้นจริง)
                     </p>
                  </details>
                  <details className="group bg-white rounded-xl border border-border p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm">
                     <summary className="flex justify-between items-center font-bold text-trust-900 text-sm">
                        มีบริการรับทำวีซ่าให้ด้วยหรือไม่?
                        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                     </summary>
                     <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        เรามีบริการให้คำปรึกษาและช่วยเตรียมเอกสารสำหรับการยื่นวีซ่า โดยจะมีเจ้าหน้าที่ติดต่อกลับหลังจากทำการจองเรียบร้อยแล้ว
                     </p>
                  </details>
               </div>
             </CardContent>
          </Card>

        </div>

        {/* Right Sidebar: Sticky Booking Panel */}
        <aside className="w-full lg:w-[380px] shrink-0 hidden md:block">
           <div className="sticky top-24 space-y-6">
              
              {/* Main Booking Widget */}
              <div className="bg-white rounded-2xl shadow-floating border border-border overflow-hidden">
                 <div className="bg-trust-900 p-6 text-center border-b border-trust-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                       <Plane className="w-32 h-32 transform translate-x-1/4 -translate-y-1/4" />
                    </div>
                    <Badge variant="brand" className="mb-2 bg-white/10 text-white border-transparent">โปรโมชันพิเศษจำกัดเวลา</Badge>
                    <p className="text-trust-300 text-sm mb-1">ราคาเริ่มต้นเพียง</p>
                    <div className="text-4xl font-black text-primary drop-shadow-md">฿{lowestPrice.toLocaleString()}</div>
                    <p className="text-trust-400 text-xs mt-2">ราคาสุทธิ ไม่มีบวกเพิ่ม</p>
                 </div>
                 <div className="p-6">
                    <BookingWidget lowestPrice={lowestPrice} tourId={tour.id} departures={mappedDepartures} />
                    
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                       <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary-50">
                          <FileText className="w-4 h-4" /> ขอใบเสนอราคา
                       </Button>
                       <Button variant="ghost" className="w-full gap-2 text-trust-600 hover:text-primary hover:bg-primary-50">
                          <MessageSquareText className="w-4 h-4" /> สอบถามเจ้าหน้าที่
                       </Button>
                    </div>
                 </div>
              </div>

              {/* Trust Indicators */}
              <Card className="bg-primary-50 border-primary-100 shadow-none">
                 <CardContent className="p-5">
                    <h3 className="font-bold text-trust-900 text-sm mb-4">ทำไมถึงควรจองกับ Jongtour?</h3>
                    <ul className="space-y-3">
                       <li className="flex gap-3 items-start">
                          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-trust-900">บริษัทจดทะเบียนถูกต้อง</p>
                             <p className="text-xs text-trust-700">มีใบอนุญาตประกอบธุรกิจนำเที่ยวจาก ททท.</p>
                          </div>
                       </li>
                       <li className="flex gap-3 items-start">
                          <ThumbsUp className="w-5 h-5 text-primary shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-trust-900">รีวิวเชื่อถือได้ 100%</p>
                             <p className="text-xs text-trust-700">จากลูกค้าที่เดินทางจริงมากกว่า 10,000 ท่าน</p>
                          </div>
                       </li>
                    </ul>
                 </CardContent>
              </Card>

           </div>
        </aside>

      </div>

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
         <div>
            <p className="text-xs text-muted-foreground font-medium">เริ่มต้นที่</p>
            <p className="text-2xl font-black text-primary">฿{lowestPrice.toLocaleString()}</p>
         </div>
         <Button size="lg" className="shadow-floating px-8" onClick={() => {
            document.getElementById('departures')?.scrollIntoView({ behavior: 'smooth' });
         }}>
            เลือกรอบเดินทาง
         </Button>
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
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-floating border border-destructive/20 max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">ขออภัย เกิดข้อผิดพลาดของระบบ (500)</h1>
          <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลทัวร์ได้ กรุณาลองใหม่อีกครั้ง</p>
          <div className="bg-destructive/10 p-4 rounded-lg text-left overflow-x-auto text-xs text-destructive-dark font-mono mb-6 whitespace-pre-wrap break-all">
            <strong>Error:</strong> {error?.message || "Unknown Server Error"}
          </div>
          <Link href="/">
             <Button variant="brand" className="px-8 rounded-full">กลับหน้าหลัก</Button>
          </Link>
        </div>
      </main>
    );
  }
}
