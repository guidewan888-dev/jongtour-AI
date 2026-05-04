import Link from "next/link";
import { ChevronRight, Calendar, Clock, Plane, Filter, ChevronDown, Flame, Timer, AlertCircle, Sparkles, HelpCircle, MessageSquare } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `โปรทัวร์ไฟไหม้ อัปเดตล่าสุด | จองด่วนราคาถูกที่สุด - Jongtour`,
  description: `รวมโปรโมชันทัวร์ไฟไหม้ แพ็กเกจราคาพิเศษ นาทีสุดท้าย ลดสูงสุด 50% อัปเดตที่นั่งแบบเรียลไทม์ หลุดจองราคาถูก`,
};

export default async function FlashSalePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Fetch only active tours with valid departures
  const { data: tourData } = await supabase
    .from('tours')
    .select(`
      id, tourName, tourCode, durationDays,
      images:tour_images(imageUrl),
      departures(startDate, remainingSeats, status, prices(sellingPrice, netPrice)),
      supplier:suppliers(displayName)
    `)
    .limit(50); // Get a larger pool to filter down in JS

  let allTours = tourData || [];

  // Logic to identify Flash Sale / Deals (presentation layer only)
  // We consider a tour "Flash Sale" if its departure is within 14 days OR it has a significant discount (selling < cost)
  const flashSaleTours = allTours.map((t: any) => {
    // Filter out past departures and find the closest one
    const validDeps = t.departures?.filter((d: any) => new Date(d.startDate) > new Date() && d.status !== 'CANCELLED') || [];
    
    if (validDeps.length === 0) return null;

    // Find the departure that triggered the flash sale (closest date or cheapest price)
    // For presentation, we just pick the first valid departure as the main data point
    const mainDep = validDeps.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
    const priceData = mainDep.prices?.[0] || {};
    
    const sellingPrice = priceData.sellingPrice || 0;
    const costPrice = priceData.netPrice || sellingPrice; // Using netPrice as original price for demonstration if available
    
    // Determine Flash Sale status
    const daysUntilDeparture = (new Date(mainDep.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    const isUrgent = daysUntilDeparture <= 14;
    const hasDiscount = sellingPrice < costPrice;
    
    if (!isUrgent && !hasDiscount && mainDep.remainingSeats >= 5) return null; // Not a flash sale candidate

    let discountPercent = 0;
    if (hasDiscount && costPrice > 0) {
       discountPercent = Math.round(((costPrice - sellingPrice) / costPrice) * 100);
    }

    return {
      id: t.id,
      title: t.tourName,
      code: t.tourCode,
      days: t.durationDays,
      image: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1508804185872-d7bad800043e",
      sellingPrice,
      originalPrice: hasDiscount ? costPrice : null,
      discountPercent,
      startDate: mainDep.startDate,
      remainingSeats: mainDep.remainingSeats,
      status: mainDep.status,
      supplier: t.supplier?.displayName || "Jongtour Partner",
      bookingUrl: `/tour/${t.id}`
    };
  }).filter(Boolean); // Remove nulls

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Flash Sale Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-primary">
        <div className="absolute inset-0">
          {/* Using a warm/fire-themed abstract background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-600 to-amber-600 opacity-90 mix-blend-multiply"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-400 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10 flex flex-col items-center text-center mt-10">
          <div className="flex items-center gap-2 text-white/80 text-xs md:text-sm font-bold tracking-wider mb-6 bg-black/20 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white flex items-center gap-1"><Flame className="w-4 h-4 text-yellow-300" /> ทัวร์ไฟไหม้</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-xl flex items-center gap-4">
            FLASH SALE <Flame className="w-12 h-12 text-yellow-300 animate-pulse" />
          </h1>
          <p className="text-xl md:text-2xl font-bold text-yellow-300 mb-6 drop-shadow-md">
            ลดแหลก แจกโปรด่วน! ทัวร์หลุดจอง ราคาพิเศษสุดๆ
          </p>
          <p className="text-base text-white/90 max-w-2xl mb-10 font-medium bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            โปรโมชันทัวร์ไฟไหม้ รวบรวมแพ็กเกจเดินทางเร็ว ที่นั่งจำนวนจำกัด และโปรโมชันลดราคาพิเศษจากทุกโฮลเซลล์ จองก่อนเต็ม!
          </p>

          <div className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden ring-4 ring-white/20">
             <AiSearchBar placeholder="AI ค้นหาทัวร์ไฟไหม้ พิมพ์เลย เช่น 'ไปญี่ปุ่นอาทิตย์หน้า ราคาไม่เกินสองหมื่น'" defaultContext={{ promotion_type: 'flash_sale' }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         
         {/* Campaign Countdown (Mockup logic for presentation) */}
         <div className="mb-10 bg-trust-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden border border-trust-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-4 relative z-10 mb-4 md:mb-0">
               <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Timer className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h3 className="font-black text-xl">โปรโมชันพิเศษ จองด่วนก่อนหมดเวลา!</h3>
                  <p className="text-trust-300 text-sm">ทัวร์ไฟไหม้ที่นั่งจำกัด ราคาพิเศษนี้จะสิ้นสุดภายใน</p>
               </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
               <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[60px] text-center border border-white/10">
                  <p className="text-2xl font-black text-primary font-mono">03</p>
                  <p className="text-[10px] text-trust-400 uppercase tracking-wider">Days</p>
               </div>
               <span className="text-2xl font-bold text-trust-500">:</span>
               <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[60px] text-center border border-white/10">
                  <p className="text-2xl font-black text-primary font-mono">14</p>
                  <p className="text-[10px] text-trust-400 uppercase tracking-wider">Hours</p>
               </div>
               <span className="text-2xl font-bold text-trust-500">:</span>
               <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[60px] text-center border border-white/10">
                  <p className="text-2xl font-black text-primary font-mono">45</p>
                  <p className="text-[10px] text-trust-400 uppercase tracking-wider">Mins</p>
               </div>
            </div>
         </div>

         {/* Filter Bar (UI Mockup as per requirement) */}
         <div className="bg-white rounded-2xl shadow-floating border border-border p-4 flex flex-wrap gap-3 items-center justify-between mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar w-full md:w-auto">
               <div className="flex items-center gap-2 text-trust-900 font-bold shrink-0 mr-2">
                  <Filter className="w-5 h-5 text-primary" /> ตัวกรอง:
               </div>
               <Button variant="outline" size="sm" className="bg-muted/50 border-transparent hover:border-primary shrink-0">ประเทศ <ChevronDown className="w-3 h-3 ml-1" /></Button>
               <Button variant="outline" size="sm" className="bg-muted/50 border-transparent hover:border-primary shrink-0">เดือนเดินทาง <ChevronDown className="w-3 h-3 ml-1" /></Button>
               <Button variant="outline" size="sm" className="bg-muted/50 border-transparent hover:border-primary shrink-0">งบประมาณ <ChevronDown className="w-3 h-3 ml-1" /></Button>
               <Button variant="outline" size="sm" className="bg-muted/50 border-transparent hover:border-primary shrink-0">ผู้จัด (Supplier) <ChevronDown className="w-3 h-3 ml-1" /></Button>
            </div>
            
            {/* Quick Status Filters */}
            <div className="flex items-center gap-2 shrink-0 border-l border-border pl-4 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0">
               <Badge variant="outline" className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200"><Timer className="w-3 h-3 mr-1" /> เหลือน้อย</Badge>
               <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> คอนเฟิร์มเดินทาง</Badge>
            </div>
         </div>

         {/* Tour Grid */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-trust-900 flex items-center gap-2">
               โปรโมชันอัปเดตล่าสุด <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">{flashSaleTours.length} รายการ</span>
            </h2>
         </div>

         {/* Flash Sale Grid */}
         {flashSaleTours.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-border shadow-sm">
               <Flame className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
               <h3 className="text-xl font-bold text-trust-900 mb-2">ยังไม่มีโปรทัวร์ไฟไหม้ในขณะนี้</h3>
               <p className="text-muted-foreground mb-6">โปรโมชันมักจะมาในช่วงใกล้เดินทาง โปรดติดตามอัปเดตหน้าเพจนี้เป็นประจำ หรือฝากข้อมูลไว้</p>
               <div className="flex justify-center gap-4">
                  <Button variant="brand" className="gap-2"><MessageSquare className="w-4 h-4" /> แจ้งเตือนทัวร์ไฟไหม้</Button>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
               {flashSaleTours.map((tour: any) => (
                  <Link href={tour.bookingUrl} key={tour.id} className="group flex h-full">
                     <Card className="flex-1 border-primary/20 hover:border-primary hover:shadow-floating transition-all duration-300 overflow-hidden flex flex-col relative ring-1 ring-primary/10">
                        {/* Urgent Badge */}
                        <div className="absolute top-0 left-0 right-0 bg-primary text-white text-[10px] font-bold text-center py-1 z-10 flex items-center justify-center gap-1">
                           <Timer className="w-3 h-3" /> จองด่วน! โปรโมชันเวลาจำกัด
                        </div>

                        <div className="relative h-48 overflow-hidden bg-muted mt-6">
                           <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-trust-900 flex items-center gap-1 shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-primary" /> {tour.days} วัน
                           </div>
                           
                           {/* Dynamic Badges */}
                           <div className="absolute top-3 left-3 flex flex-col gap-1">
                              {tour.discountPercent > 0 && (
                                 <Badge variant="destructive" className="shadow-md bg-red-600 border-0 text-[10px] px-1.5 py-0">ลด {tour.discountPercent}%</Badge>
                              )}
                              {tour.remainingSeats > 0 && tour.remainingSeats <= 5 && (
                                 <Badge variant="warning" className="shadow-md border-0 text-[10px] px-1.5 py-0"><AlertCircle className="w-3 h-3 mr-1" /> เหลือ {tour.remainingSeats} ที่สุดท้าย</Badge>
                              )}
                           </div>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                           <div className="flex justify-between items-start mb-2">
                              <div className="text-[10px] font-bold text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{tour.code}</div>
                              <div className="text-[10px] font-bold text-trust-700 bg-trust-50 border border-trust-100 px-1.5 py-0.5 rounded truncate max-w-[100px]">{tour.supplier}</div>
                           </div>
                           
                           <h3 className="font-bold text-trust-900 text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">{tour.title}</h3>
                           
                           <div className="mb-3">
                              <div className="flex items-center gap-1.5 text-xs text-trust-700 font-medium bg-muted/50 p-1.5 rounded-md border border-border/50">
                                 <Calendar className="w-3.5 h-3.5 text-primary" />
                                 เดินทาง: {new Date(tour.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                 {tour.status === 'CONFIRMED' && <span className="text-emerald-600 font-bold ml-auto flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> คอนเฟิร์ม</span>}
                              </div>
                           </div>
                           
                           <div className="mt-auto pt-3 border-t border-border flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] text-muted-foreground mb-0.5">ราคาพิเศษ</p>
                                 <div className="flex items-baseline gap-1.5">
                                    <span className="font-black text-xl text-red-600">฿{tour.sellingPrice.toLocaleString()}</span>
                                    {tour.originalPrice && tour.originalPrice > tour.sellingPrice && (
                                       <span className="text-[11px] text-muted-foreground line-through font-medium">฿{tour.originalPrice.toLocaleString()}</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <Button variant="brand" className="w-full mt-3 h-9 text-xs font-bold gap-1 shadow-md hover:shadow-lg">
                              <Flame className="w-4 h-4" /> ดูรายละเอียด / จองเลย
                           </Button>
                        </CardContent>
                     </Card>
                  </Link>
               ))}
            </div>
         )}

         {/* FAQ Section */}
         <div className="mt-24 mb-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-trust-900 mb-8 text-center flex items-center justify-center gap-2"><HelpCircle className="w-6 h-6 text-primary" /> คำถามที่พบบ่อย (FAQ) เกี่ยวกับทัวร์ไฟไหม้</h2>
            <div className="space-y-4">
               {[
                  { q: `ทัวร์ไฟไหม้ คืออะไร?`, a: "ทัวร์ไฟไหม้ หรือ Last Minute Tour คือแพ็กเกจทัวร์ที่มีกำหนดเดินทางในระยะเวลาอันใกล้ (มักจะภายใน 7-14 วัน) แล้วยังมีที่นั่งว่างเหลืออยู่ ทางโฮลเซลล์จึงนำมาลดราคาพิเศษสุดๆ เพื่อปิดกรุ๊ปให้เต็ม" },
                  { q: `ทำไมทัวร์ไฟไหม้ถึงราคาถูกมาก ไว้ใจได้ไหม?`, a: "ไว้ใจได้ 100% ครับ เป็นโปรแกรมทัวร์ปกติที่มีคุณภาพเทียบเท่าราคาเต็มทุกประการ เพียงแต่เป็นกลยุทธ์การขายที่นั่งที่เหลือในนาทีสุดท้ายของโฮลเซลล์เท่านั้น" },
                  { q: `ต้องเตรียมตัวอย่างไรหากจองทัวร์ไฟไหม้?`, a: `เนื่องจากเวลาเตรียมตัวน้อย ท่านควรมีพาสปอร์ตที่อายุเหลือมากกว่า 6 เดือนพร้อมใช้งาน และหากเป็นประเทศที่ต้องใช้วีซ่า ต้องตรวจสอบว่าท่านมีวีซ่าพร้อมหรือสามารถทำ Visa on Arrival ได้หรือไม่` }
               ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                     <p className="font-bold text-trust-900 mb-2 flex gap-2"><span className="text-primary">Q:</span> {faq.q}</p>
                     <p className="text-muted-foreground text-sm flex gap-2"><span className="text-trust-400">A:</span> {faq.a}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* CTA Section */}
         <div className="mt-10 mb-10 bg-gradient-to-br from-trust-900 to-slate-900 rounded-3xl p-10 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">ไม่อยากพลาดโปรโมชันทัวร์ไฟไหม้?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto relative z-10">ที่นั่งทัวร์ไฟไหม้มีจำกัดและมักจะหมดเร็วมาก ฝากข้อมูลให้ทีมงานของเราช่วยแจ้งเตือนทันทีที่มีโปรหลุดจองในเส้นทางที่คุณต้องการ</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Button variant="brand" size="lg" className="gap-2 shadow-lg shadow-primary/30 text-base h-12 px-8">
                  <MessageSquare className="w-5 h-5" /> สมัครรับการแจ้งเตือน
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  ติดต่อเจ้าหน้าที่
               </Button>
            </div>
         </div>
      </div>
    </main>
  );
}
