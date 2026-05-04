import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Clock, Plane, Sparkles, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string, city: string } }) {
  const cityNameMap: Record<string, string> = {
    // Asia
    'tokyo': 'โตเกียว', 'osaka': 'โอซาก้า', 'kyoto': 'เกียวโต', 'hokkaido': 'ฮอกไกโด', 
    'fukuoka': 'ฟุกุโอกะ', 'okinawa': 'โอกินาว่า', 'kansai': 'คันไซ', 'kyushu': 'คิวชู', 
    'tohoku': 'โทโฮคุ', 'fuji': 'ฟูจิ', 'sakura': 'ซากุระ', 'autumn': 'ใบไม้เปลี่ยนสี', 
    'winter': 'หิมะ', 'flash-sale': 'ไฟไหม้', 'beijing': 'ปักกิ่ง', 'shanghai': 'เซี่ยงไฮ้', 
    'chengdu': 'เฉิงตู', 'chongqing': 'ฉงชิ่ง', 'xian': 'ซีอาน', 'kunming': 'คุนหมิง', 
    'zhangjiajie': 'จางเจียเจี้ย', 'guilin': 'กุ้ยหลิน', 'lijiang': 'ลี่เจียง', 'dali': 'ต้าหลี่', 
    'shangri-la': 'แชงกรีล่า', 'chinese-new-year': 'ตรุษจีน', 'new-year': 'ปีใหม่',
    // Europe
    'paris': 'ปารีส', 'nice': 'นีซ', 'lyon': 'ลียง', 'marseille': 'มาร์แซย์',
    'zurich': 'ซูริก', 'geneva': 'เจนีวา', 'lucerne': 'ลูเซิร์น', 'zermatt': 'เซอร์แมท',
    'rome': 'โรม', 'venice': 'เวนิส', 'milan': 'มิลาน', 'florence': 'ฟลอเรนซ์',
    'london': 'ลอนดอน', 'manchester': 'แมนเชสเตอร์', 'edinburgh': 'เอดินบะระ', 'liverpool': 'ลิเวอร์พูล',
    // Middle East / Others
    'cairo': 'ไคโร', 'alexandria': 'อเล็กซานเดรีย', 'luxor': 'ลักซอร์', 'aswan': 'อัสวาน',
    'tbilisi': 'ทบิลิซี', 'gudauri': 'กูดาวรี', 'batumi': 'บาทูมี', 'kazbegi': 'คาซเบกิ',
    'istanbul': 'อิสตันบูล', 'cappadocia': 'คัปปาโดเกีย', 'pamukkale': 'ปามุคคาเล่', 'antalya': 'อันตัลยา',
    'dubai': 'ดูไบ', 'amman': 'อัมมาน', 'petra': 'เพตรา', 'dead-sea': 'เดดซี', 'wadi-rum': 'วาดิรัม',
    'marrakech': 'มาราเกช', 'casablanca': 'คาซาบลังกา', 'fes': 'เฟส', 'chefchaouen': 'เชฟชาอุน',
    // America & Australia
    'new-york': 'นิวยอร์ก', 'los-angeles': 'ลอสแอนเจลิส', 'las-vegas': 'ลาสเวกัส', 'san-francisco': 'ซานฟรานซิสโก',
    'toronto': 'โทรอนโต', 'vancouver': 'แวนคูเวอร์', 'banff': 'แบนฟ์', 'niagara': 'น้ำตกไนแองการ่า',
    'sydney': 'ซิดนีย์', 'melbourne': 'เมลเบิร์น', 'gold-coast': 'โกลด์โคสต์', 'perth': 'เพิร์ท',
    'auckland': 'โอ๊คแลนด์', 'queenstown': 'ควีนส์ทาวน์', 'christchurch': 'ไครสต์เชิร์ช', 'rotorua': 'โรโตรัว',
    // Misc
    'private-group': 'กรุ๊ปส่วนตัว'
  };

  const countryNameMap: Record<string, string> = {
    'japan': 'ญี่ปุ่น', 'china': 'จีน', 'korea': 'เกาหลี', 'taiwan': 'ไต้หวัน', 'hong-kong': 'ฮ่องกง', 'singapore': 'สิงคโปร์', 'vietnam': 'เวียดนาม',
    'egypt': 'อียิปต์', 'georgia': 'จอร์เจีย', 'turkey': 'ตุรกี', 'dubai': 'ดูไบ (UAE)', 'jordan': 'จอร์แดน', 'morocco': 'โมร็อกโก',
    'france': 'ฝรั่งเศส', 'switzerland': 'สวิตเซอร์แลนด์', 'italy': 'อิตาลี', 'uk': 'อังกฤษ', 'germany': 'เยอรมนี', 'austria': 'ออสเตรีย',
    'spain': 'สเปน', 'portugal': 'โปรตุเกส', 'czech-republic': 'เช็ก', 'hungary': 'ฮังการี', 'iceland': 'ไอซ์แลนด์',
    'united-states': 'สหรัฐอเมริกา', 'canada': 'แคนาดา', 'australia': 'ออสเตรเลีย', 'new-zealand': 'นิวซีแลนด์'
  };

  const countryName = countryNameMap[params.slug] || params.slug;
  const cityName = cityNameMap[params.city] || params.city;

  return {
    title: `ทัวร์${cityName} 2569 โปรแกรมทัวร์${cityName} ราคาดี มี AI ช่วยค้นหา | Jongtour`,
    description: `ค้นหาแพ็กเกจทัวร์${cityName} ประเทศ${countryName} อัปเดตล่าสุด เปรียบเทียบราคา จองง่าย ปลอดภัย 100% พร้อมผู้เชี่ยวชาญดูแลตลอดการเดินทาง`,
    alternates: {
      canonical: `https://jongtour.com/country/${params.slug}/${params.city}`
    }
  };
}

export default async function CityPage({ params }: { params: { slug: string, city: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const countryNameMap: Record<string, string> = {
    'japan': 'ญี่ปุ่น', 'china': 'จีน', 'korea': 'เกาหลี', 'taiwan': 'ไต้หวัน', 'hong-kong': 'ฮ่องกง', 'singapore': 'สิงคโปร์', 'vietnam': 'เวียดนาม',
    'egypt': 'อียิปต์', 'georgia': 'จอร์เจีย', 'turkey': 'ตุรกี', 'dubai': 'ดูไบ (UAE)', 'jordan': 'จอร์แดน', 'morocco': 'โมร็อกโก',
    'france': 'ฝรั่งเศส', 'switzerland': 'สวิตเซอร์แลนด์', 'italy': 'อิตาลี', 'uk': 'อังกฤษ', 'germany': 'เยอรมนี', 'austria': 'ออสเตรีย',
    'spain': 'สเปน', 'portugal': 'โปรตุเกส', 'czech-republic': 'เช็ก', 'hungary': 'ฮังการี', 'iceland': 'ไอซ์แลนด์',
    'united-states': 'สหรัฐอเมริกา', 'canada': 'แคนาดา', 'australia': 'ออสเตรเลีย', 'new-zealand': 'นิวซีแลนด์'
  };
  const thCountryName = countryNameMap[params.slug] || params.slug;
  const englishCountryName = params.slug;
  
  const cityNameMap: Record<string, string> = {
    'tokyo': 'โตเกียว', 'osaka': 'โอซาก้า', 'kyoto': 'เกียวโต', 'hokkaido': 'ฮอกไกโด', 
    'fukuoka': 'ฟุกุโอกะ', 'okinawa': 'โอกินาว่า', 'kansai': 'คันไซ', 'kyushu': 'คิวชู', 
    'tohoku': 'โทโฮคุ', 'fuji': 'ฟูจิ', 'sakura': 'ซากุระ', 'autumn': 'ใบไม้เปลี่ยนสี', 
    'winter': 'หิมะ', 'flash-sale': 'ไฟไหม้', 'beijing': 'ปักกิ่ง', 'shanghai': 'เซี่ยงไฮ้', 
    'chengdu': 'เฉิงตู', 'chongqing': 'ฉงชิ่ง', 'xian': 'ซีอาน', 'kunming': 'คุนหมิง', 
    'zhangjiajie': 'จางเจียเจี้ย', 'guilin': 'กุ้ยหลิน', 'lijiang': 'ลี่เจียง', 'dali': 'ต้าหลี่', 
    'shangri-la': 'แชงกรีล่า', 'chinese-new-year': 'ตรุษจีน', 'new-year': 'ปีใหม่',
    'paris': 'ปารีส', 'nice': 'นีซ', 'lyon': 'ลียง', 'marseille': 'มาร์แซย์',
    'zurich': 'ซูริก', 'geneva': 'เจนีวา', 'lucerne': 'ลูเซิร์น', 'zermatt': 'เซอร์แมท',
    'rome': 'โรม', 'venice': 'เวนิส', 'milan': 'มิลาน', 'florence': 'ฟลอเรนซ์',
    'london': 'ลอนดอน', 'manchester': 'แมนเชสเตอร์', 'edinburgh': 'เอดินบะระ', 'liverpool': 'ลิเวอร์พูล',
    'cairo': 'ไคโร', 'alexandria': 'อเล็กซานเดรีย', 'luxor': 'ลักซอร์', 'aswan': 'อัสวาน',
    'tbilisi': 'ทบิลิซี', 'gudauri': 'กูดาวรี', 'batumi': 'บาทูมี', 'kazbegi': 'คาซเบกิ',
    'istanbul': 'อิสตันบูล', 'cappadocia': 'คัปปาโดเกีย', 'pamukkale': 'ปามุคคาเล่', 'antalya': 'อันตัลยา',
    'dubai': 'ดูไบ', 'amman': 'อัมมาน', 'petra': 'เพตรา', 'dead-sea': 'เดดซี', 'wadi-rum': 'วาดิรัม',
    'marrakech': 'มาราเกช', 'casablanca': 'คาซาบลังกา', 'fes': 'เฟส', 'chefchaouen': 'เชฟชาอุน',
    'new-york': 'นิวยอร์ก', 'los-angeles': 'ลอสแอนเจลิส', 'las-vegas': 'ลาสเวกัส', 'san-francisco': 'ซานฟรานซิสโก',
    'toronto': 'โทรอนโต', 'vancouver': 'แวนคูเวอร์', 'banff': 'แบนฟ์', 'niagara': 'น้ำตกไนแองการ่า',
    'sydney': 'ซิดนีย์', 'melbourne': 'เมลเบิร์น', 'gold-coast': 'โกลด์โคสต์', 'perth': 'เพิร์ท',
    'auckland': 'โอ๊คแลนด์', 'queenstown': 'ควีนส์ทาวน์', 'christchurch': 'ไครสต์เชิร์ช', 'rotorua': 'โรโตรัว',
    'private-group': 'กรุ๊ปส่วนตัว'
  };

  const thCityName = cityNameMap[params.city] || params.city;

  // Keyword search based on slug + city (in DB, tours often have city in tourName or destinations)
  const { data: tourData } = await supabase
    .from('tours')
    .select(`
      id, tourName, tourCode, durationDays,
      images:tour_images(imageUrl),
      departures(startDate, remainingSeats, prices(sellingPrice)),
      supplier:suppliers(name)
    `)
    .ilike('tourName', `%${thCityName}%`)
    .limit(16);

  let tours = tourData || [];

  // Formatting for presentation
  const formattedTours = tours.map((t: any) => {
    const validDeps = t.departures?.filter((d: any) => new Date(d.startDate) > new Date()) || [];
    const minPrice = validDeps.length > 0 ? Math.min(...validDeps.map((d: any) => d.prices?.[0]?.sellingPrice || 999999)) : 0;
    
    return {
      id: t.id,
      title: t.tourName,
      code: t.tourCode,
      days: t.durationDays,
      image: t.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      price: minPrice,
      supplier: t.supplier?.name || "Jongtour Partner"
    };
  }).filter((t: any) => t.price > 0);

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-trust-900">
        <div className="absolute inset-0">
          <img 
            src={params.slug === 'japan' ? "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" : "https://images.unsplash.com/photo-1508804185872-d7bad800043e"} 
            alt={`ทัวร์${thCityName}`} 
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-trust-900 via-trust-900/80 to-background"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10 flex flex-col items-center text-center mt-10">
          <div className="flex items-center gap-2 text-trust-300 text-xs md:text-sm font-bold tracking-wider mb-6 bg-trust-900/50 px-4 py-1.5 rounded-full border border-trust-700/50 backdrop-blur-md">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/country/${params.slug}`} className="hover:text-white transition-colors">ทัวร์{thCountryName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">ทัวร์{thCityName}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg flex items-center gap-4">
            เที่ยว<span className={params.slug === 'china' ? 'text-red-500' : 'text-primary'}>{thCityName}</span>
          </h1>
          <p className="text-lg text-trust-200 max-w-2xl mb-10 font-medium">
            รวมโปรแกรมทัวร์{thCityName} อัปเดตล่าสุด จองง่าย ปลอดภัย 100% พร้อมผู้เชี่ยวชาญดูแลตลอดการเดินทาง
          </p>

          <div className="w-full max-w-4xl">
             <AiSearchBar defaultContext={{ country: englishCountryName, city: thCityName }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         {/* Filter Bar */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-black text-trust-900">แพ็กเกจทัวร์{thCityName}ทั้งหมด ({formattedTours.length})</h2>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="bg-white gap-2"><Calendar className="w-4 h-4" /> เลือกวัน <ChevronDown className="w-3 h-3" /></Button>
               <Button variant="outline" className="bg-white gap-2"><Filter className="w-4 h-4" /> โฮลเซลล์ <ChevronDown className="w-3 h-3" /></Button>
            </div>
         </div>

         {/* Tour Grid or Empty State */}
         {formattedTours.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border shadow-sm max-w-4xl mx-auto">
               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plane className="w-12 h-12 text-muted-foreground opacity-50" />
               </div>
               <h3 className="text-2xl font-black text-trust-900 mb-3">ยังไม่มีโปรแกรมทัวร์{thCityName} ในขณะนี้</h3>
               <p className="text-trust-600 mb-8 max-w-lg mx-auto">
                  ขออภัยครับ โปรแกรมสำหรับเส้นทางนี้อาจจะเต็มแล้ว หรือยังไม่มีการอัปเดตจากโฮลเซลล์ 
                  คุณสามารถให้ AI ช่วยหาเส้นทางใกล้เคียง หรือฝากข้อมูลให้เจ้าหน้าที่ติดต่อกลับเมื่อมีโปรแกรมใหม่ได้ครับ
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
                        <p className="text-sm text-muted-foreground mb-4">พิมพ์บอกความต้องการ เช่น "อยากไปเที่ยวเมืองใกล้ๆ {thCityName} งบ 30,000 บาท"</p>
                        <AiSearchBar placeholder="พิมพ์ความต้องการของคุณที่นี่..." defaultContext={{ country: englishCountryName, city: thCityName }} />
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
                        <p className="text-sm text-muted-foreground mb-4">ทิ้งเบอร์ติดต่อหรือ Line ID ไว้ แอดมินจะรีบแจ้งทันทีที่มีทัวร์{thCityName}หลุดจอง</p>
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
                  <Link href={`/tour/${tour.id}`} key={tour.id} className="group">
                     <Card className="h-full border-border hover:border-primary/50 hover:shadow-floating transition-all duration-300 overflow-hidden flex flex-col">
                        <div className="relative h-48 overflow-hidden bg-muted">
                           <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-trust-900 flex items-center gap-1 shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-primary" /> {tour.days} วัน
                           </div>
                           {(params.city === 'flash-sale' || params.city === 'winter') && (
                              <div className="absolute top-3 left-3">
                                 <Badge variant="brand" className="shadow-md">ไฟไหม้</Badge>
                              </div>
                           )}
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
               ))}
            </div>
         )}
      </div>
    </main>
  );
}
