import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Clock, Plane, Sparkles, Filter, ChevronDown, CheckCircle2, Flame, AlertCircle, MessageSquare, ShieldCheck, HelpCircle, FileText, CloudSun, Utensils, Search, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

const SUBREGION_CONFIG: Record<string, any> = {
  "grand-europe": {
    name: "แกรนด์ยุโรป",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
    seasons: [
      { name: "☀️ ฤดูร้อน (ซัมเมอร์)", desc: "มิถุนายน - สิงหาคม (อากาศอบอุ่น ฟ้าโปร่ง)" },
      { name: "🍂 ใบไม้เปลี่ยนสี", desc: "กันยายน - พฤศจิกายน" }
    ],
    visa: "แชงเก้นวีซ่า (Schengen Visa) 1 ครั้ง สามารถเข้าออกได้หลายประเทศในกลุ่ม"
  },
  "scandinavia": {
    name: "สแกนดิเนเวีย",
    image: "https://images.unsplash.com/photo-1520699049698-acd2fce18736",
    seasons: [
      { name: "✨ ล่าแสงเหนือ", desc: "ตุลาคม - มีนาคม" },
      { name: "☀️ พระอาทิตย์เที่ยงคืน", desc: "มิถุนายน - สิงหาคม" }
    ],
    visa: "แชงเก้นวีซ่า (Schengen Visa)"
  },
  "balkans": {
    name: "บอลข่าน",
    image: "https://images.unsplash.com/photo-1555990538-2dfa61d120a1",
    seasons: [
      { name: "☀️ ฤดูร้อน", desc: "มิถุนายน - สิงหาคม (ทะเลสวย อากาศดี)" },
      { name: "🍂 ฤดูใบไม้ร่วง", desc: "กันยายน - ตุลาคม" }
    ],
    visa: "ส่วนใหญ่ใช้แชงเก้นวีซ่าแบบ Multiple Entry ได้ โปรดสอบถามทีมงานอีกครั้งสำหรับบางประเทศ"
  }
};

const REGION_MAP: Record<string, string> = {
  "europe": "ยุโรป",
  "asia": "เอเชีย",
  "middle-east-caucasus-north-africa": "ตะวันออกกลาง",
  "america-australia": "อเมริกา"
};

export async function generateMetadata({ params }: { params: { slug: string, subregion: string } }) {
  const config = SUBREGION_CONFIG[params.subregion] || { name: params.subregion };
  return {
    title: `ทัวร์${config.name} 2569 โปรแกรมทัวร์${config.name} ราคาดี มี AI ช่วยค้นหา | Jongtour`,
    description: `ค้นหาแพ็กเกจทัวร์${config.name} อัปเดตล่าสุด เปรียบเทียบราคา จองง่าย ปลอดภัย 100% พร้อมผู้เชี่ยวชาญดูแลตลอดการเดินทาง`,
    alternates: {
      canonical: `https://jongtour.com/region/${params.slug}/${params.subregion}`
    }
  };
}

export default async function SubRegionPage({ params }: { params: { slug: string, subregion: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const config = SUBREGION_CONFIG[params.subregion] || { name: params.subregion, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a", seasons: [], visa: "" };
  const thSubRegionName = config.name;
  const thRegionName = REGION_MAP[params.slug] || params.slug;

  const { data: tourData } = await supabase
    .from('tours')
    .select(`
      id, tourName, tourCode, durationDays,
      images:tour_images(imageUrl),
      departures(startDate, remainingSeats, prices(sellingPrice)),
      supplier:suppliers(displayName)
    `)
    .ilike('tourName', `%${thSubRegionName}%`)
    .limit(16);

  let tours = tourData || [];

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
      image: t.images?.[0]?.imageUrl || config.image,
      price: minPrice,
      supplier: t.supplier?.displayName || "Jongtour Partner",
      isFlashSale,
      isConfirmed,
      lowSeats,
      bookingUrl: `/tour/${t.id}`
    };
  }).filter((t: any) => t.price > 0);

  const flashSaleTours = formattedTours.filter((t: any) => t.isFlashSale);

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-trust-900">
        <div className="absolute inset-0">
          <img 
            src={config.image} 
            alt={`ทัวร์${thSubRegionName}`} 
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-trust-900 via-trust-900/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10 flex flex-col items-center text-center mt-10">
          <div className="flex items-center gap-2 text-trust-300 text-xs md:text-sm font-bold tracking-wider mb-6 bg-trust-900/50 px-4 py-1.5 rounded-full border border-trust-700/50 backdrop-blur-md">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/region/${params.slug}`} className="hover:text-white transition-colors">ทัวร์{thRegionName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">ทัวร์{thSubRegionName}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            ทัวร์<span className="text-primary">{thSubRegionName}</span>
          </h1>
          <p className="text-lg text-trust-200 max-w-2xl mb-10 font-medium">
            ค้นหาแพ็กเกจทัวร์{thSubRegionName} อัปเดตล่าสุด เปรียบเทียบราคาจากโฮลเซลล์ชั้นนำ จองง่าย ปลอดภัย 100%
          </p>

          <div className="w-full max-w-4xl mt-10">
             <AiSearchBar placeholder={`AI ช่วยหาทัวร์${thSubRegionName} เช่น "ไป${thSubRegionName}เดือนหน้า ราคาไม่เกิน 80,000"`} defaultContext={{ region: params.slug, subregion: thSubRegionName }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         
         {config.seasons.length > 0 && (
           <div className="mb-16 bg-muted/30 rounded-3xl p-8 border border-border">
              <h2 className="text-2xl font-black text-trust-900 mb-6 flex items-center gap-2"><CloudSun className="w-6 h-6 text-primary" /> เที่ยว{thSubRegionName}ช่วงไหนดี?</h2>
              <div className="grid grid-cols-2 gap-4">
                 {config.seasons.map((s: any) => (
                    <div key={s.name} className="bg-white p-4 rounded-xl border border-border shadow-sm text-center hover:border-primary transition-colors cursor-pointer flex flex-col justify-center min-h-[100px]">
                       <p className="font-bold text-trust-900">{s.name}</p>
                       <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
         )}

         {/* Tour Listing (All) */}
         <div id="tours" className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-10">
            <h2 className="text-2xl font-black text-trust-900">แพ็กเกจทัวร์{thSubRegionName}ทั้งหมด ({formattedTours.length})</h2>
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
               <h3 className="text-2xl font-black text-trust-900 mb-3">ยังไม่มีโปรแกรมทัวร์{thSubRegionName} ในขณะนี้</h3>
               <p className="text-trust-600 mb-8 max-w-lg mx-auto">
                  ขออภัยครับ โปรแกรมสำหรับภูมิภาคนี้อาจจะเต็มหมดแล้ว หรือกำลังรออัปเดตจากพาร์ทเนอร์โฮลเซลล์ 
                  คุณสามารถให้ AI ช่วยหาภูมิภาคใกล้เคียง หรือฝากข้อมูลให้เจ้าหน้าที่แจ้งเตือนเมื่อมีโปรแกรมใหม่ได้ครับ
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
                        <p className="text-sm text-muted-foreground mb-4">พิมพ์บอกความต้องการ เช่น "แนะนำทัวร์โซนยุโรปตะวันออก ที่อากาศกำลังดี"</p>
                        <AiSearchBar placeholder="พิมพ์ความต้องการของคุณที่นี่..." defaultContext={{ region: params.slug }} />
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
                        <p className="text-sm text-muted-foreground mb-4">ทิ้งเบอร์ติดต่อหรือ Line ID ไว้ แอดมินจะรีบแจ้งทันทีที่มีทัวร์{thSubRegionName}อัปเดตใหม่</p>
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

         {/* CTA Section */}
         <div className="mt-10 mb-10 bg-trust-900 rounded-3xl p-10 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">ต้องการจัดกรุ๊ปทัวร์ส่วนตัวใน{thSubRegionName}?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto relative z-10">ติดต่อผู้เชี่ยวชาญของเราเพื่อช่วยออกแบบเส้นทาง เลือกโรงแรม และจัดกรุ๊ปเหมาส่วนตัว (Private Group) ในราคาพิเศษที่ปรับได้ตามงบประมาณ</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Button variant="brand" size="lg" className="gap-2 shadow-lg shadow-primary/30 text-base h-12 px-8">
                  <Sparkles className="w-5 h-5" /> ให้ AI ช่วยออกแบบทริป
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  <Users className="w-5 h-5" /> กรอกแบบฟอร์มจัดกรุ๊ปเหมา
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
