"use client";

import { Filter, ChevronDown, MapPin, CalendarDays, ArrowRight, Plane, Star, Clock } from 'lucide-react';
import { Button } from "@/components/ui-new/Button";
import { Badge } from "@/components/ui-new/Badge";
import { Card, CardContent } from "@/components/ui-new/Card";
import AiSearchBar from "@/components/AiSearchBar";

export default function SearchToursPage() {
  return (
    <div className="bg-background min-h-screen pb-12 font-sans">
      
      {/* Search Header / Hero */}
      <div className="bg-trust-900 text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-gradient opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">ค้นหาโปรแกรมทัวร์ทั่วโลก</h1>
          <p className="text-trust-300 mb-8 text-center max-w-2xl">ค้นหาจากกว่า 1,245 โปรแกรมคุณภาพ คัดกรองโดยผู้เชี่ยวชาญ หรือให้ AI ช่วยหาทัวร์ที่เหมาะกับคุณที่สุด</p>
          <div className="w-full max-w-4xl translate-y-4">
             <AiSearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 -mt-8 relative z-20">
        
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-trust-900 text-lg">ตัวกรอง (Filters)</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-trust-900 text-sm mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/> ประเทศปลายทาง</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer transition-colors"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> ญี่ปุ่น <span className="ml-auto text-xs text-muted-foreground/50">(450)</span></label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer transition-colors"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> เกาหลีใต้ <span className="ml-auto text-xs text-muted-foreground/50">(320)</span></label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer transition-colors"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> ยุโรป <span className="ml-auto text-xs text-muted-foreground/50">(180)</span></label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer transition-colors"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> ไต้หวัน <span className="ml-auto text-xs text-muted-foreground/50">(90)</span></label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-trust-900 text-sm mb-4">ช่วงราคา (ต่อท่าน)</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> ต่ำกว่า 20,000 บาท</label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> 20,000 - 40,000 บาท</label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> 40,000 บาทขึ้นไป</label>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-trust-900 text-sm mb-4">สายการบิน</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> Thai Airways</label>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-trust-900 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" /> Air Asia</label>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-8" variant="secondary">ล้างตัวกรอง</Button>
          </div>
        </aside>

        {/* Main Listing */}
        <div className="flex-1 space-y-6">
          {/* Sorting Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="text-sm text-muted-foreground">พบ <span className="font-bold text-trust-900">1,245</span> โปรแกรมที่ตรงกับเงื่อนไข</div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <span className="text-sm text-trust-900 font-medium whitespace-nowrap">เรียงตาม:</span>
               <select className="w-full sm:w-auto bg-muted border-transparent rounded-lg text-sm px-4 py-2 text-trust-900 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                 <option>AI แนะนำ (Best Match)</option>
                 <option>ราคา (ต่ำไปสูง)</option>
                 <option>ราคา (สูงไปต่ำ)</option>
                 <option>วันเดินทาง (เร็วที่สุด)</option>
               </select>
            </div>
          </div>

          {/* List items - Using New OTA Standard Design */}
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-floating transition-all border-border hover:border-primary/30 group">
               <div className="flex flex-col sm:flex-row">
                 {/* Image Section */}
                 <div className="w-full sm:w-72 h-56 sm:h-auto bg-muted relative shrink-0 overflow-hidden">
                   <img 
                      src={`https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop&sig=${i}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      alt="Tour cover" 
                   />
                   <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                     <Badge variant="brand" className="shadow-sm">⭐ AI Recommended</Badge>
                     <Badge variant="secondary" className="shadow-sm opacity-90"><Clock className="w-3 h-3 mr-1"/> 6 วัน 4 คืน</Badge>
                   </div>
                   <div className="absolute bottom-3 right-3">
                     <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-sm border-transparent text-trust-900">รหัสทัวร์: JP-00{i}</Badge>
                   </div>
                 </div>
                 
                 {/* Content Section */}
                 <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
                   <div className="flex flex-col lg:flex-row justify-between gap-4">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">JAPAN</span>
                         <span className="w-1 h-1 rounded-full bg-border"></span>
                         <span className="text-xs text-primary font-medium">Let's Go Group</span>
                       </div>
                       <h3 className="text-lg md:text-xl font-bold text-trust-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">แพ็กเกจทัวร์ฮอกไกโด ซัปโปโร โอตารุ ชมทุ่งดอกลาเวนเดอร์ ฟาร์มโทมิตะ (บินตรง)</h3>
                       
                       <div className="mt-4 flex flex-col gap-2">
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Plane className="w-4 h-4 text-trust-400" />
                            <span>Thai Airways (TG) • น้ำหนักกระเป๋า 30kg</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-trust-400" />
                            <span>โรงแรมระดับ 4 ดาว • อาหาร 10 มื้อ • พรีเมียมออนเซ็น</span>
                         </div>
                       </div>
                     </div>

                     {/* Price & Action Section */}
                     <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 shrink-0 lg:w-48">
                        <div className="w-full flex justify-between lg:block lg:text-right mb-4">
                           <p className="text-xs text-muted-foreground mb-1">ราคาเริ่มต้น/ท่าน</p>
                           <p className="text-2xl md:text-3xl font-black text-primary leading-none">฿45,900</p>
                        </div>
                        
                        <div className="w-full space-y-2 mt-auto">
                           <Button className="w-full rounded-lg font-bold" variant="default">ดูโปรแกรม <ArrowRight className="w-4 h-4 ml-1" /></Button>
                           <Button className="w-full rounded-lg" variant="secondary">เปรียบเทียบ</Button>
                        </div>
                     </div>
                   </div>

                   {/* Departure Dates Footer */}
                   <div className="mt-5 bg-muted/50 rounded-lg p-3 flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/50">
                      <span className="text-xs font-semibold text-trust-900 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> วันเดินทางถัดไป:</span>
                      <div className="flex flex-wrap gap-2">
                         <Badge variant="success" className="font-medium text-[11px] py-1 shadow-sm">12-17 ต.ค. (ว่าง 5 ที่)</Badge>
                         <Badge variant="success" className="font-medium text-[11px] py-1 shadow-sm">20-25 ต.ค. (ว่าง 12 ที่)</Badge>
                         <Badge variant="warning" className="font-medium text-[11px] py-1 shadow-sm">01-06 พ.ย. (เหลือ 2 ที่)</Badge>
                      </div>
                   </div>
                 </div>
               </div>
            </Card>
          ))}
          
          <div className="flex justify-center pt-8">
             <Button variant="outline" className="rounded-full px-8 bg-white">โหลดเพิ่มเติม</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
