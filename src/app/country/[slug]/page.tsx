import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Clock, Plane, Sparkles, Filter, ChevronDown, CheckCircle2, Flame, AlertCircle, MessageSquare, ShieldCheck, HelpCircle, FileText, CloudSun, Utensils, Search, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const countryName = params.slug === 'japan' ? 'ญี่ปุ่น' : params.slug === 'china' ? 'จีน' : params.slug;
  return {
    title: `แพ็กเกจทัวร์${countryName} | จองทัวร์${countryName}ราคาถูก คุ้มค่าที่สุด - Jongtour`,
    description: `ค้นหาแพ็กเกจทัวร์${countryName} อัปเดตล่าสุด เปรียบเทียบราคา จองง่าย ปลอดภัย 100% พร้อมผู้เชี่ยวชาญดูแลตลอดการเดินทาง`,
  };
}

export default async function CountryPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const countryName = params.slug === 'japan' ? 'Japan' : params.slug === 'china' ? 'China' : params.slug;
  const thCountryName = params.slug === 'japan' ? 'ญี่ปุ่น' : params.slug === 'china' ? 'จีน' : params.slug;

  // Search by country via existing tour_destinations table
  const { data: dests } = await supabase
    .from('tour_destinations')
    .select('tourId')
    .ilike('country', `%${countryName}%`)
    .limit(50);

  const tourIds = dests?.map(d => d.tourId) || [];

  let tours = [];
  if (tourIds.length > 0) {
    const { data: tourData } = await supabase
      .from('tours')
      .select(`
        id, tourName, tourCode, durationDays,
        images:tour_images(imageUrl),
        departures(startDate, remainingSeats, prices(sellingPrice)),
        supplier:suppliers(name)
      `)
      .in('id', tourIds)
      .limit(12);
    tours = tourData || [];
  }

  // Formatting for presentation (No DB logic changes)
  const formattedTours = tours.map((t: any) => {
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
      supplier: t.supplier?.name || "Jongtour Partner",
      isFlashSale,
      isConfirmed,
      lowSeats,
      bookingUrl: `/tour/${t.id}`
    };
  }).filter((t: any) => t.price > 0);

  const flashSaleTours = formattedTours.filter((t: any) => t.isFlashSale);
  const confirmedTours = formattedTours.filter((t: any) => t.isConfirmed);

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-trust-900">
        <div className="absolute inset-0">
          <img 
            src={params.slug === 'japan' ? "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" : "https://images.unsplash.com/photo-1508804185872-d7bad800043e"} 
            alt={`ทัวร์${thCountryName}`} 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-trust-900 via-trust-900/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10 flex flex-col items-center text-center mt-10">
          <div className="flex items-center gap-2 text-trust-300 text-xs md:text-sm font-bold tracking-wider mb-6">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tour/search" className="hover:text-white transition-colors">ทัวร์ต่างประเทศ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">ทัวร์{thCountryName}</span>
          </div>

          <Badge variant="brand" className="mb-6 px-4 py-1.5 text-sm">แพ็กเกจยอดนิยม 2026</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            ทัวร์{thCountryName} <span className="text-primary">คุ้มที่สุด</span>
          </h1>
          <p className="text-lg text-trust-200 max-w-2xl mb-10 font-medium">
            ค้นหาแพ็กเกจทัวร์{thCountryName} อัปเดตล่าสุด เปรียบเทียบราคาจากโฮลเซลล์ชั้นนำกว่า 100 โปรแกรม จองง่าย ปลอดภัย 100%
          </p>

          <div className="flex gap-4">
             <Button variant="brand" className="shadow-lg gap-2" asChild>
                <Link href="#tours"><Search className="w-4 h-4" /> ดูโปรแกรมทั้งหมด</Link>
             </Button>
             <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2">
                <Sparkles className="w-4 h-4" /> ค้นหาทัวร์ด้วย AI
             </Button>
          </div>

          <div className="w-full max-w-4xl mt-10">
             <AiSearchBar placeholder={`AI ช่วยหาทัวร์${thCountryName} เช่น "ไป${thCountryName}เดือนหน้า ราคาไม่เกิน 30,000"`} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         {/* 3. Popular Cities */}
         <div className="mb-16">
            <h2 className="text-2xl font-black text-trust-900 mb-6 text-center">จุดหมายยอดนิยมใน{thCountryName}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {params.slug === 'japan' && ['โตเกียว', 'โอซาก้า', 'ฮอกไกโด', 'ฟุกุโอกะ', 'โอกินาว่า'].map(city => (
                  <Link key={city} href={`/country/japan/${city === 'โตเกียว' ? 'tokyo' : city === 'โอซาก้า' ? 'osaka' : city === 'ฮอกไกโด' ? 'hokkaido' : city === 'ฟุกุโอกะ' ? 'fukuoka' : 'okinawa'}`}>
                     <Card className="overflow-hidden hover:border-primary transition-all group shadow-sm border-border cursor-pointer h-full">
                        <div className="h-24 bg-muted relative overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                           <h3 className="absolute bottom-2 left-3 text-white font-black text-lg drop-shadow-md">{city}</h3>
                        </div>
                     </Card>
                  </Link>
               ))}
               {params.slug === 'china' && ['ปักกิ่ง', 'เซี่ยงไฮ้', 'เฉิงตู', 'จางเจียเจี้ย', 'คุนหมิง'].map(city => (
                  <Link key={city} href={`/country/china/${city === 'ปักกิ่ง' ? 'beijing' : city === 'เซี่ยงไฮ้' ? 'shanghai' : city === 'เฉิงตู' ? 'chengdu' : city === 'จางเจียเจี้ย' ? 'zhangjiajie' : 'kunming'}`}>
                     <Card className="overflow-hidden hover:border-red-500 transition-all group shadow-sm border-border cursor-pointer h-full">
                        <div className="h-24 bg-muted relative overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1508804185872-d7bad800043e" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                           <h3 className="absolute bottom-2 left-3 text-white font-black text-lg drop-shadow-md">{city}</h3>
                        </div>
                     </Card>
                  </Link>
               ))}
            </div>
         </div>

         {/* 5. Promotion Section */}
         {flashSaleTours.length > 0 && (
            <div className="mb-16">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-trust-900 flex items-center gap-2"><Flame className="w-6 h-6 text-destructive" /> ทัวร์ไฟไหม้{thCountryName}</h2>
                  <Link href="/deals/flash-sale" className="text-sm font-bold text-primary hover:underline">ดูทั้งหมด</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {flashSaleTours.slice(0, 4).map((tour: any) => <TourCard key={tour.id} tour={tour} />)}
               </div>
            </div>
         )}

         {/* 6. Travel Season Section */}
         <div className="mb-16 bg-muted/30 rounded-3xl p-8 border border-border">
            <h2 className="text-2xl font-black text-trust-900 mb-6 flex items-center gap-2"><CloudSun className="w-6 h-6 text-primary" /> เที่ยว{thCountryName}ฤดูไหนดี?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {params.slug === 'japan' && [
                  { name: '🌸 ซากุระ', desc: 'มีนาคม - เมษายน' },
                  { name: '🍁 ใบไม้เปลี่ยนสี', desc: 'ตุลาคม - พฤศจิกายน' },
                  { name: '⛄ หิมะ / เล่นสกี', desc: 'ธันวาคม - กุมภาพันธ์' },
                  { name: '🎏 Golden Week', desc: 'ปลายเมษายน - ต้นพฤษภาคม' }
               ].map(s => (
                  <div key={s.name} className="bg-white p-4 rounded-xl border border-border shadow-sm text-center hover:border-primary transition-colors cursor-pointer">
                     <p className="font-bold text-trust-900">{s.name}</p>
                     <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  </div>
               ))}
               {params.slug === 'china' && [
                  { name: '🧧 ตรุษจีน', desc: 'มกราคม - กุมภาพันธ์' },
                  { name: '⛄ หิมะฮาร์บิน', desc: 'ธันวาคม - กุมภาพันธ์' },
                  { name: '🏞️ จางเจียเจี้ย', desc: 'เที่ยวได้ตลอดปี' },
                  { name: '🍁 ฤดูใบไม้ร่วง', desc: 'กันยายน - พฤศจิกายน' }
               ].map(s => (
                  <div key={s.name} className="bg-white p-4 rounded-xl border border-border shadow-sm text-center hover:border-red-500 transition-colors cursor-pointer">
                     <p className="font-bold text-trust-900">{s.name}</p>
                     <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Tour Listing (All) */}
         <div id="tours" className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-10">
            <h2 className="text-2xl font-black text-trust-900">แพ็กเกจทัวร์{thCountryName}ทั้งหมด ({formattedTours.length})</h2>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="bg-white gap-2"><Calendar className="w-4 h-4" /> เดือนเดินทาง <ChevronDown className="w-3 h-3" /></Button>
               <Button variant="outline" className="bg-white gap-2"><Filter className="w-4 h-4" /> ตัวกรองเพิ่มเติม <ChevronDown className="w-3 h-3" /></Button>
            </div>
         </div>

         {/* Tour Grid or Empty State */}
         {formattedTours.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border shadow-sm max-w-4xl mx-auto">
               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plane className="w-12 h-12 text-muted-foreground opacity-50" />
               </div>
               <h3 className="text-2xl font-black text-trust-900 mb-3">ยังไม่มีโปรแกรมทัวร์{thCountryName} ในขณะนี้</h3>
               <p className="text-trust-600 mb-8 max-w-lg mx-auto">
                  ขออภัยครับ โปรแกรมสำหรับประเทศนี้อาจจะเต็มหมดแล้ว หรือกำลังรออัปเดตจากพาร์ทเนอร์โฮลเซลล์ 
                  คุณสามารถให้ AI ช่วยหาประเทศใกล้เคียง หรือฝากข้อมูลให้เจ้าหน้าที่แจ้งเตือนเมื่อมีโปรแกรมใหม่ได้ครับ
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                  {/* Option 1: AI Search */}
                  <Card className="border-primary/20 shadow-sm hover:border-primary transition-colors">
                     <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                              <Sparkles className="w-5 h-5" />
                           </div>
                           <h4 className="font-bold text-trust-900">ให้ AI ช่วยหาเส้นทางอื่น</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">พิมพ์บอกความต้องการ เช่น "แนะนำประเทศแถบเอเชียที่ไปเที่ยวช่วงเดือนหน้า"</p>
                        <AiSearchBar placeholder="พิมพ์ความต้องการของคุณที่นี่..." />
                     </CardContent>
                  </Card>

                  {/* Option 2: Lead Gen */}
                  <Card className="border-border shadow-sm hover:border-trust-400 transition-colors bg-muted/30">
                     <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-trust-700">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <h4 className="font-bold text-trust-900">แจ้งเตือนเมื่อมีโปรแกรม</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">ทิ้งเบอร์ติดต่อหรือ Line ID ไว้ แอดมินจะรีบแจ้งทันทีที่มีทัวร์{thCountryName}อัปเดตใหม่</p>
                        <form className="flex flex-col gap-2">
                           <input type="text" placeholder="ชื่อ - นามสกุล" className="h-10 px-3 rounded-lg border border-border text-sm w-full outline-none focus:border-primary" />
                           <input type="text" placeholder="เบอร์โทร / Line ID" className="h-10 px-3 rounded-lg border border-border text-sm w-full outline-none focus:border-primary" />
                           <Button type="button" variant="brand" className="w-full mt-2">ฝากข้อมูลติดต่อ</Button>
                        </form>
                     </CardContent>
                  </Card>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {formattedTours.map((tour: any) => (
                  <TourCard key={tour.id} tour={tour} />
               ))}
            </div>
         )}

         {/* 7. Travel Guide Section */}
         <div className="mt-20 mb-16">
            <h2 className="text-2xl font-black text-trust-900 mb-8 text-center">คู่มือเตรียมตัวเที่ยว{thCountryName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><FileText className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">วีซ่าและเอกสาร</h3>
                     <p className="text-sm text-muted-foreground">{params.slug === 'japan' ? 'คนไทยเข้าญี่ปุ่นได้โดยไม่ต้องขอวีซ่า พำนักได้ไม่เกิน 15 วัน เพียงแค่เตรียมพาสปอร์ตที่มีอายุเหลือมากกว่า 6 เดือน' : 'สำหรับกรุ๊ปทัวร์ บางโปรแกรมอาจรวมค่าวีซ่ากรุ๊ปแล้ว หรือฟรีวีซ่าสำหรับคนไทย โปรดตรวจสอบในแต่ละโปรแกรม'}</p>
                  </CardContent>
               </Card>
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><CloudSun className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">สภาพอากาศ</h3>
                     <p className="text-sm text-muted-foreground">ตรวจสอบอุณหภูมิในแต่ละฤดูเพื่อเตรียมเครื่องแต่งกายให้พร้อม โดยเฉพาะฤดูหนาวที่ต้องเตรียมเสื้อกันหนาวให้เพียงพอ</p>
                  </CardContent>
               </Card>
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><Utensils className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">อาหารท้องถิ่น</h3>
                     <p className="text-sm text-muted-foreground">เตรียมท้องให้พร้อมสำหรับเมนูยอดฮิต และโปรดแจ้งทีมงานล่วงหน้าหากท่านแพ้อาหารหรือรับประทานมังสวิรัติ</p>
                  </CardContent>
               </Card>
            </div>
         </div>

         {/* 8. CTA Section */}
         <div className="mt-10 mb-10 bg-trust-900 rounded-3xl p-10 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">ยังหาโปรแกรมทัวร์{thCountryName}ที่ถูกใจไม่เจอ?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto relative z-10">ให้ AI ช่วยหา หรือติดต่อผู้เชี่ยวชาญของเราเพื่อช่วยเลือกโปรแกรม หรือจัดกรุ๊ปเหมาส่วนตัว (Private Group) ในราคาพิเศษ</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Button variant="brand" size="lg" className="gap-2 shadow-lg shadow-primary/30 text-base h-12 px-8">
                  <Sparkles className="w-5 h-5" /> ให้ AI ช่วยออกแบบทริป
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  <Users className="w-5 h-5" /> จัดกรุ๊ปเหมาส่วนตัว
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
               <div className="text-[10px] font-bold text-muted-foreground mb-1 font-mono">{tour.code}</div>
               <h3 className="font-bold text-trust-900 text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">{tour.title}</h3>
               
               <div className="mt-auto pt-3 border-t border-border flex justify-between items-end">
                  <div>
                     <p className="text-[10px] text-muted-foreground">ราคาเริ่มต้น</p>
                     <p className="font-black text-lg text-primary">฿{tour.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] text-muted-foreground mb-0.5">ให้บริการโดย</p>
                     <p className="text-[10px] font-bold text-trust-700 max-w-[100px] truncate">{tour.supplier}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </Link>
   );
}
