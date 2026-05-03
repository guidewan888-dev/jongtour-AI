import Link from "next/link";
import { Plus, ShieldCheck, Headphones, Globe2, Sparkles, MapPin, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import AiSearchBar from "@/components/AiSearchBar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import AuthButtons from "@/components/AuthButtons";
import { processAiQuery } from "@/services/aiPlanner";
import { Button } from "@/components/ui-new/Button";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const lineUid = cookieStore.get('jongtour_line_uid')?.value;
  let dynamicGreeting = null;
  let recommendedTours: any[] = [];

  // DO NOT REMOVE EXISTING LOGIC
  if (lineUid) {
    try {
      const { data: session, error } = await supabase
        .from('LineChatSession')
        .select('*')
        .eq('lineUserId', lineUid)
        .single();
      
      if (!error && session && session.summary) {
        dynamicGreeting = "แนะนำพิเศษจากเรื่องที่คุณเพิ่งคุยกับ AI";
        recommendedTours = await processAiQuery(session.summary);
      }
    } catch (e) {
      console.error("Error loading personalized tours:", e);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Premium Corporate Header */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl md:text-3xl font-bold tracking-tight text-trust-900 flex items-center gap-2">
            <span className="text-primary"><Globe2 className="w-8 h-8" /></span>
            <span>Jong<span className="text-primary">tour</span><sup className="text-xs text-muted-foreground font-normal ml-1 bg-muted px-2 py-0.5 rounded-full">AI</sup></span>
          </Link>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-muted-foreground">
            <Link href="/tour/search" className="hover:text-primary transition-colors">หาทัวร์</Link>
            <Link href="/wholesale/letsgo" className="hover:text-primary transition-colors">โปรแกรมโฮลเซลล์</Link>
            <Link href="/info/about" className="hover:text-primary transition-colors">เกี่ยวกับเรา</Link>
            <Link href="/info/contact" className="hover:text-primary transition-colors">ติดต่อเรา</Link>
          </div>
          <div className="flex gap-4 items-center">
             <AuthButtons serverUser={user} />
          </div>
        </div>
      </nav>

      {/* Hero Section with High-End Photography Vibe & AI Focus */}
      <section className="relative w-full overflow-hidden bg-trust-900 text-white pb-20 pt-24 md:pt-32">
        <div className="absolute inset-0 z-0 opacity-40">
           {/* Fallback abstract gradient or subtle map pattern */}
           <div className="absolute inset-0 bg-primary-gradient opacity-20 mix-blend-overlay"></div>
           <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop" alt="Travel Background" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-trust-900 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
           <Badge variant="brand" className="mb-6 animate-fade-in"><Sparkles className="w-3 h-3 mr-1" /> ขับเคลื่อนด้วย AI อัจฉริยะ</Badge>
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
             เที่ยวรอบโลกแบบมือโปร<br/>
             <span className="text-primary-400">หาทัวร์ที่ใช่ได้ใน 5 วินาที</span>
           </h1>
           <p className="text-lg md:text-xl text-trust-200 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
             แพลตฟอร์มรวบรวมโปรแกรมทัวร์คุณภาพจากโฮลเซลล์ชั้นนำทั่วประเทศ
             พร้อม AI ผู้ช่วยส่วนตัวที่ช่วยคุณหาทัวร์ เช็คที่ว่าง และเปรียบเทียบราคาแบบเรียลไทม์
           </p>

           {/* Central AI Search Bar */}
           <div className="w-full max-w-3xl animate-fade-in" style={{ animationDelay: '300ms' }}>
             <AiSearchBar />
           </div>

           <div className="flex gap-4 mt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
             <span className="text-sm text-trust-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary-400"/> กว่า 5,000 โปรแกรม</span>
             <span className="text-sm text-trust-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary-400"/> ตรวจสอบที่ว่างอัตโนมัติ</span>
             <span className="text-sm text-trust-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary-400"/> เจ้าหน้าที่ดูแล 24 ชม.</span>
           </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-16 bg-white border-b border-border">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-muted transition-colors">
               <div className="w-14 h-14 bg-primary-100 text-primary rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7" />
               </div>
               <h3 className="text-lg font-bold text-trust-900 mb-2">จองปลอดภัย มั่นใจ 100%</h3>
               <p className="text-muted-foreground text-sm">เราคัดสรรเฉพาะโปรแกรมทัวร์จากพาร์ทเนอร์และ Wholesale ที่จดทะเบียนถูกต้องตามกฎหมาย มีใบอนุญาตชัดเจน</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-muted transition-colors">
               <div className="w-14 h-14 bg-primary-100 text-primary rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
               </div>
               <h3 className="text-lg font-bold text-trust-900 mb-2">AI ค้นหาทัวร์อัจฉริยะ</h3>
               <p className="text-muted-foreground text-sm">ไม่ต้องเหนื่อยอ่านไฟล์ PDF ทีละอัน เพียงส่งรูปภาพหรือพิมพ์บอกสิ่งที่คุณต้องการ AI จะหาโปรแกรมที่ตรงใจคุณที่สุดทันที</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-muted transition-colors">
               <div className="w-14 h-14 bg-primary-100 text-primary rounded-full flex items-center justify-center mb-4">
                  <Headphones className="w-7 h-7" />
               </div>
               <h3 className="text-lg font-bold text-trust-900 mb-2">ดูแลตั้งแต่จองจนบินกลับ</h3>
               <p className="text-muted-foreground text-sm">มีเจ้าหน้าที่ Sales ผู้เชี่ยวชาญตัวจริงคอยประกบ AI ตลอดเวลา เพื่อให้คำปรึกษาและประสานงานเอกสารวีซ่าให้คุณ</p>
            </div>
         </div>
      </section>

      {/* Dynamic AI Recommended Section (Preserved Business Logic) */}
      {recommendedTours.length > 0 && (
        <section className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <Badge variant="brand" className="mb-2">AI Selected สำหรับคุณ</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-trust-900">
                  {dynamicGreeting}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTours.slice(0, 3).map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-floating transition-all group flex flex-col cursor-pointer border-transparent hover:border-primary-200">
                  <div className="w-full h-56 bg-muted relative overflow-hidden">
                    <img 
                      src={tour.imageUrl || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop"} 
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="success">ที่นั่งว่าง</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" /> {tour.destination || 'ทัวร์ต่างประเทศ'}
                      </div>
                      <h3 className="font-bold text-trust-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{tour.title}</h3>
                    </div>
                    <div className="flex justify-between items-end mt-6 border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">ราคาเริ่มต้น</p>
                        <span className="text-xl font-bold text-primary">฿{Number(tour.price).toLocaleString()}</span>
                      </div>
                      <Link href={`/tour/${tour.id}`} passHref>
                         <Button variant="default" size="sm" className="rounded-full px-5">ดูโปรแกรม</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Destinations / Curated Categories */}
      <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-trust-900 mb-2">จุดหมายปลายทางยอดฮิต</h2>
                  <p className="text-muted-foreground">ค้นหาทัวร์ประเทศยอดนิยมที่เราคัดสรรมาให้คุณ</p>
               </div>
               <Button variant="ghost" className="hidden md:flex text-primary">ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Destination Cards (Static for showcase, matching OTA vibe) */}
               {['ญี่ปุ่น', 'เกาหลีใต้', 'ยุโรป', 'ไต้หวัน'].map((dest, i) => (
                  <Link href={`/tour/search?dest=${dest}`} key={i} className="relative h-64 rounded-2xl overflow-hidden group">
                     <img src={`https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={dest} />
                     <div className="absolute inset-0 bg-gradient-to-t from-trust-900/80 via-trust-900/20 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">{dest}</h3>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Call to Action for Private Group */}
      <section className="py-16 bg-trust-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
         <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">อยากจัดกรุ๊ปเหมา กรุ๊ปส่วนตัว?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto">ให้ AI ช่วยประเมินราคากรุ๊ปเหมาเบื้องต้นให้คุณได้ทันที พร้อมส่งเรื่องต่อให้ทีม Sales เชี่ยวชาญออกแบบโปรแกรมทัวร์ให้ตรงใจที่สุด</p>
            <Link href="/info/contact">
               <Button variant="brand" size="lg" className="rounded-full px-8">ติดต่อจัดกรุ๊ปเหมา</Button>
            </Link>
         </div>
      </section>

      {/* Footer Restyled */}
      <footer className="bg-white border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           <div className="md:col-span-1">
              <Link href="/" className="text-2xl font-bold tracking-tight text-trust-900 flex items-center gap-2 mb-4">
                 <span className="text-primary"><Globe2 className="w-6 h-6" /></span>
                 <span>Jong<span className="text-primary">tour</span></span>
              </Link>
              <p className="text-sm text-muted-foreground">แพลตฟอร์มค้นหาและจองทัวร์ต่างประเทศด้วยระบบ AI อัจฉริยะ ให้บริการอย่างมืออาชีพ ปลอดภัย มั่นใจได้</p>
           </div>
           <div>
              <h4 className="font-bold text-trust-900 mb-4">บริการของเรา</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/tour/search" className="hover:text-primary">ค้นหาโปรแกรมทัวร์</Link></li>
                 <li><Link href="/info/promotions" className="hover:text-primary">โปรโมชั่นและไฟไหม้</Link></li>
                 <li><Link href="/info/contact" className="hover:text-primary">จัดกรุ๊ปเหมาส่วนตัว</Link></li>
                 <li><Link href="/wholesale" className="hover:text-primary">สำหรับ Wholesale (B2B)</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold text-trust-900 mb-4">ช่วยเหลือและนโยบาย</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/info/faq" className="hover:text-primary">คำถามที่พบบ่อย (FAQ)</Link></li>
                 <li><Link href="/info/terms" className="hover:text-primary">เงื่อนไขการให้บริการ</Link></li>
                 <li><Link href="/info/privacy-policy" className="hover:text-primary">นโยบายความเป็นส่วนตัว</Link></li>
                 <li><Link href="/info/pdpa" className="hover:text-primary">นโยบาย PDPA</Link></li>
              </ul>
           </div>
           <div>
              <h4 className="font-bold text-trust-900 mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li>LINE: @jongtour</li>
                 <li>โทร: 02-XXX-XXXX</li>
                 <li>อีเมล: support@jongtour.com</li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jongtour Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span>TAT License: 11/XXXXX</span>
             <span>Secure Payment 100%</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
