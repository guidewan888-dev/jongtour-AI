import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Clock, Plane, Filter, ChevronDown, Building2, Flame, CheckCircle2, AlertCircle, MessageSquare, Search, Sparkles, HelpCircle, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supplierName = params.slug === 'letgo-group' ? "Let's Go Group" : 
                       params.slug === 'go365' ? "Go365" : 
                       params.slug === 'check-in-group' ? "Check In Group" : 
                       params.slug === 'tour-factory' ? "Tour Factory" : params.slug;
  return {
    title: `แพ็กเกจทัวร์ ${supplierName} (Wholesale) | จองทัวร์ราคาส่ง - Jongtour`,
    description: `รวมแพ็กเกจทัวร์จาก ${supplierName} ทั้งหมด ทัวร์ไฟไหม้ ทัวร์คอนเฟิร์มเดินทาง จองตรงราคาถูกกว่า ปลอดภัย 100%`,
  };
}

export default async function WholesalePage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Map slug to actual supplier_id
  const supplierMap: Record<string, string> = {
    'letgo-group': 'SUP_LETGO',
    'go365': 'SUP_GO365',
    'check-in-group': 'SUP_CHECKIN',
    'tour-factory': 'SUP_TOURFACTORY'
  };

  const supplierId = supplierMap[params.slug];
  
  if (!supplierId) {
    notFound();
  }

  // Fetch Supplier Info
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();

  const fallbackName = params.slug === 'letgo-group' ? "Let's Go Group" : 
                       params.slug === 'go365' ? "Go365" : 
                       params.slug === 'check-in-group' ? "Check In Group" : 
                       params.slug === 'tour-factory' ? "Tour Factory" : params.slug;

  const supplierName = supplier?.name || fallbackName;
  const supplierLogo = `/images/wholesales/${params.slug === 'letgo-group' ? 'download.png' : params.slug === 'go365' ? 'download.jfif' : params.slug === 'check-in-group' ? 'CH7.jpg' : 'Tour-Factory.jpg'}`;

  // Fetch Tours strictly filtered by supplierId
  const { data: tourData } = await supabase
    .from('tours')
    .select(`
      id, tourName, tourCode, durationDays,
      images:tour_images(imageUrl),
      departures(startDate, remainingSeats, prices(sellingPrice), status),
      supplier:suppliers(displayName)
    `)
    .eq('supplierId', supplierId)
    .limit(20);

  let tours = tourData || [];

  // Categorize tours
  const allTours = tours.map((t: any) => {
    const validDeps = t.departures?.filter((d: any) => new Date(d.startDate) > new Date()) || [];
    const minPrice = validDeps.length > 0 ? Math.min(...validDeps.map((d: any) => d.prices?.[0]?.sellingPrice || 999999)) : 0;
    
    const isFlashSale = validDeps.some((d: any) => new Date(d.startDate).getTime() - new Date().getTime() < 14 * 24 * 60 * 60 * 1000);
    const isConfirmed = validDeps.some((d: any) => d.status === 'CONFIRMED' || d.remainingSeats < 10);
    const lowSeats = validDeps.some((d: any) => d.remainingSeats > 0 && d.remainingSeats <= 5);

    return {
      id: t.id,
      title: t.tourName,
      code: t.tourCode,
      days: t.durationDays,
      image: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      price: minPrice,
      supplier: t.supplier?.displayName || supplierName,
      isFlashSale,
      isConfirmed,
      lowSeats,
      bookingUrl: `/tour/${t.id}`
    };
  }).filter((t: any) => t.price > 0);

  const flashSaleTours = allTours.filter(t => t.isFlashSale);
  const confirmedTours = allTours.filter(t => t.isConfirmed);

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Wholesale Hero Section */}
      <div className="bg-trust-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-2xl p-4 shadow-xl shrink-0 flex items-center justify-center border-4 border-trust-800">
              <img src={supplierLogo} alt={supplierName} className="max-w-full max-h-full object-contain" />
           </div>
           <div className="flex-1 text-center md:text-left text-white">
              <div className="flex items-center justify-center md:justify-start gap-2 text-trust-300 text-xs font-bold tracking-wider mb-4">
                <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">Wholesale</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">{supplierName}</span>
              </div>
              <Badge variant="outline" className="text-trust-300 border-trust-700 mb-3 bg-trust-800/50">Official Wholesale Partner</Badge>
              <h1 className="text-3xl md:text-5xl font-black mb-4">{supplierName}</h1>
              <p className="text-trust-200 text-sm md:text-base max-w-2xl mb-6">ผู้จัดจำหน่ายแพ็กเกจทัวร์ (Wholesale) ระดับแนวหน้า ที่มีโปรแกรมทัวร์ครอบคลุมเส้นทางยอดฮิต ทั้งเอเชีย ยุโรป และทั่วโลก มั่นใจได้ในคุณภาพและราคาที่เป็นมาตรฐาน</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <div className="bg-trust-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-trust-700 text-center">
                    <p className="text-[10px] text-trust-400 uppercase tracking-wider">โปรแกรมทั้งหมด</p>
                    <p className="text-xl font-black text-white">{allTours.length}</p>
                 </div>
                 <div className="bg-trust-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-trust-700 text-center">
                    <p className="text-[10px] text-trust-400 uppercase tracking-wider">เส้นทางยอดฮิต</p>
                    <p className="text-sm font-bold text-white mt-1">ญี่ปุ่น, จีน, เกาหลี</p>
                 </div>
                 <Button variant="brand" className="shadow-lg" asChild>
                    <Link href="#contact">ติดต่อขอใบเสนอราคา</Link>
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* AI Search Locked to Supplier */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
         <div className="bg-white rounded-2xl shadow-floating border border-border p-6 mb-12">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-trust-900 font-bold">
                  <span className="text-xl">✨ ค้นหาทัวร์เฉพาะของ {supplierName}</span>
               </div>
               <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">{supplierId}</Badge>
            </div>
            {/* The AI Search Bar will receive supplierId context via its implementation or URL params */}
            <AiSearchBar placeholder={`พิมพ์โจทย์ เช่น "อยากไปจางเจียเจี้ยเดือนหน้า" แล้วให้ AI หาโปรแกรมของ ${supplierName} ให้...`} />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
         
         {/* Popular Countries for this Wholesale */}
         <div className="mb-16">
            <h2 className="text-2xl font-black text-trust-900 mb-6 text-center">เส้นทางยอดฮิตของ {supplierName}</h2>
            <div className="flex flex-wrap justify-center gap-4">
               {['ญี่ปุ่น', 'จีน', 'เกาหลี', 'ไต้หวัน', 'ฮ่องกง', 'ยุโรป'].map(country => {
                  const countrySlugMap: Record<string, string> = {
                     'ญี่ปุ่น': 'japan', 'จีน': 'china', 'เกาหลี': 'korea', 'ไต้หวัน': 'taiwan', 'ฮ่องกง': 'hongkong', 'ยุโรป': 'europe'
                  };
                  return (
                     <Link key={country} href={`/country/${countrySlugMap[country] || 'other'}`} className="group flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-border shadow-sm hover:border-primary hover:shadow-md transition-all">
                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                     </div>
                     <span className="font-bold text-trust-900 group-hover:text-primary transition-colors">ทัวร์{country}</span>
                  </Link>
                  );
               })}
            </div>
         </div>
         
         {/* Flash Sale Section */}
         {flashSaleTours.length > 0 && (
            <div className="mb-16">
               <div className="flex items-center gap-3 mb-6">
                  <Flame className="w-8 h-8 text-destructive" />
                  <h2 className="text-2xl font-black text-trust-900">ทัวร์ไฟไหม้ {supplierName}</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {flashSaleTours.slice(0, 4).map((tour: any) => (
                     <TourCard key={tour.id} tour={tour} />
                  ))}
               </div>
            </div>
         )}

         {/* Confirmed Tours Section */}
         {confirmedTours.length > 0 && (
            <div className="mb-16">
               <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <h2 className="text-2xl font-black text-trust-900">ทัวร์คอนเฟิร์มเดินทางแน่นอน</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {confirmedTours.slice(0, 4).map((tour: any) => (
                     <TourCard key={tour.id} tour={tour} />
                  ))}
               </div>
            </div>
         )}

         {/* All Tours */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-trust-900 flex items-center gap-2">
               <Building2 className="w-6 h-6 text-primary" /> โปรแกรมทัวร์ทั้งหมดของ {supplierName}
            </h2>
         </div>

         {allTours.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border shadow-sm max-w-4xl mx-auto">
               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plane className="w-12 h-12 text-muted-foreground opacity-50" />
               </div>
               <h3 className="text-2xl font-black text-trust-900 mb-3">ยังไม่มีโปรแกรมทัวร์เปิดรับจองสำหรับ Wholesale นี้</h3>
               <p className="text-trust-600 mb-8 max-w-lg mx-auto">
                  ขออภัยครับ ขณะนี้ทางระบบยังไม่ได้รับข้อมูลโปรแกรมใหม่จาก {supplierName} 
                  คุณสามารถให้ AI ค้นหาจาก Wholesale เจ้าอื่นแทน หรือฝากข้อมูลติดต่อไว้ให้เราแจ้งเตือนได้ครับ
               </p>
               <div className="flex justify-center gap-4">
                  <Button variant="brand" className="gap-2"><Sparkles className="w-4 h-4" /> ใช้ AI ค้นหาทัวร์ทั้งหมด</Button>
                  <Button variant="outline" className="gap-2"><MessageSquare className="w-4 h-4" /> แจ้งเตือนเมื่อมีโปรแกรม</Button>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {allTours.map((tour: any) => (
                  <TourCard key={tour.id} tour={tour} />
               ))}
            </div>
         )}

         {/* FAQ Section */}
         <div className="mt-20 mb-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-trust-900 mb-8 text-center flex items-center justify-center gap-2"><HelpCircle className="w-6 h-6 text-primary" /> คำถามที่พบบ่อย (FAQ)</h2>
            <div className="space-y-4">
               {[
                  { q: `จองแพ็กเกจของ ${supplierName} ผ่าน Jongtour ปลอดภัยไหม?`, a: "ปลอดภัย 100% ครับ เราเป็นพันธมิตรอย่างเป็นทางการกับ Wholesale โดยตรง การจองทุกครั้งจะออกเอกสารใบแจ้งหนี้จากระบบที่เชื่อมต่อกับโฮลเซลล์โดยตรง" },
                  { q: `ราคาที่แสดงเป็นราคาที่ดีที่สุดหรือไม่?`, a: "ราคาหน้าเว็บถูกดึงมาจากระบบของ Wholesale โดยตรง และมักจะเป็นราคาโปรโมชันหรือทัวร์ไฟไหม้ที่อัปเดตแบบเรียลไทม์" },
                  { q: `หากสนใจจัดกรุ๊ปเหมาส่วนตัว (Private Group) ทำได้หรือไม่?`, a: `ทำได้ครับ หากท่านชื่นชอบบริการของ ${supplierName} สามารถติดต่อเจ้าหน้าที่ของเราเพื่อขอใบเสนอราคาแบบจัดกรุ๊ปเหมาในเส้นทางที่ต้องการได้ทันที` }
               ].map((faq, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                     <p className="font-bold text-trust-900 mb-2 flex gap-2"><span className="text-primary">Q:</span> {faq.q}</p>
                     <p className="text-muted-foreground text-sm flex gap-2"><span className="text-trust-400">A:</span> {faq.a}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* CTA Section */}
         <div id="contact" className="mt-20 bg-gradient-to-br from-trust-900 to-slate-900 rounded-3xl p-10 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">สนใจแพ็กเกจของ {supplierName} ?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto relative z-10">ให้ทีมงานมืออาชีพของเราช่วยคุณจัดการจอง หรือขอใบเสนอราคาสำหรับกรุ๊ปเหมาของ Wholesale เจ้านี้โดยเฉพาะ</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Button variant="brand" size="lg" className="gap-2 shadow-lg shadow-primary/30 text-base h-12 px-8">
                  <Users className="w-5 h-5" /> ขอใบเสนอราคากรุ๊ปเหมา
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  <MessageSquare className="w-5 h-5" /> ติดต่อแอดมิน
               </Button>
            </div>
         </div>

      </div>
    </main>
  );
}

function TourCard({ tour }: { tour: any }) {
   return (
      <Link href={tour.bookingUrl} className="group h-full">
         <Card className="h-full border-border hover:border-primary/50 hover:shadow-floating transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative h-48 overflow-hidden bg-muted">
               <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-trust-900 flex items-center gap-1 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {tour.days} วัน
               </div>
               <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {tour.isFlashSale && <Badge variant="brand" className="shadow-md text-[10px] px-1.5 py-0">🔥 ไฟไหม้</Badge>}
                  {tour.isConfirmed && <Badge variant="success" className="shadow-md text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-600 border-0">✅ คอนเฟิร์มเดินทาง</Badge>}
                  {tour.lowSeats && <Badge variant="destructive" className="shadow-md text-[10px] px-1.5 py-0 bg-red-500 border-0">⏳ ที่นั่งเหลือน้อย</Badge>}
               </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-1">
                  <div className="text-[10px] font-bold text-muted-foreground font-mono">{tour.code}</div>
               </div>
               <h3 className="font-bold text-trust-900 text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">{tour.title}</h3>
               
               <div className="mt-auto pt-3 border-t border-border flex justify-between items-end">
                  <div>
                     <p className="text-[10px] text-muted-foreground">ราคาเริ่มต้น</p>
                     <p className="font-black text-lg text-primary">฿{tour.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] text-muted-foreground mb-0.5">Wholesale</p>
                     <p className="text-[10px] font-bold text-trust-700 max-w-[100px] truncate">{tour.supplier}</p>
                  </div>
               </div>
               <Button variant="outline" className="w-full mt-3 h-8 text-xs font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">ดูรายละเอียด</Button>
            </CardContent>
         </Card>
      </Link>
   );
}
