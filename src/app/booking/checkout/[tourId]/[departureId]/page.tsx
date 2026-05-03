import { CheckCircle2, User, Users, Info, AlertTriangle, ChevronRight, Lock, MapPin, CalendarDays, Plane, ShieldAlert, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";
import { Badge } from "@/components/ui-new/Badge";
import { Input } from "@/components/ui-new/Input";
import { Label } from "@/components/ui-new/Label";

export default function CheckoutPassengerPage({ params }: { params: { tourId: string, departureId: string } }) {
  // In a real app, we would fetch tour, availability, and pricing from the DB here
  // and create a Price Snapshot.
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column - Main Form */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Modern Stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="relative flex items-center justify-between w-full">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted rounded-full"></div>
            {/* Active Line (Progress) */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[25%] h-1 bg-primary rounded-full transition-all duration-500"></div>
            
            {/* Step 1: Active */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 ring-4 ring-white">1</div>
              <span className="text-xs font-bold text-primary">ข้อมูลผู้เดินทาง</span>
            </div>
            
            {/* Step 2: Pending */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-muted text-muted-foreground flex items-center justify-center font-bold ring-4 ring-white">2</div>
              <span className="text-xs font-medium text-muted-foreground">ชำระเงิน</span>
            </div>
            
            {/* Step 3: Pending */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-muted text-muted-foreground flex items-center justify-center font-bold ring-4 ring-white">3</div>
              <span className="text-xs font-medium text-muted-foreground">เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        {/* Warning / Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4 shadow-sm">
          <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div className="text-sm text-amber-900">
            <h4 className="font-bold mb-1 text-base">สำคัญ: กรุณากรอกข้อมูลให้ตรงกับหนังสือเดินทาง (Passport) ทุกตัวอักษร</h4>
            <p className="leading-relaxed opacity-90">เพื่อป้องกันปัญหาการทำวีซ่าและการปฏิเสธการขึ้นเครื่อง หากชื่อไม่ตรงตามพาสปอร์ต อาจมีค่าธรรมเนียมการแก้ไขข้อมูลจากสายการบิน</p>
          </div>
        </div>

        {/* Lead Booker Form */}
        <Card className="border-border shadow-soft overflow-hidden">
          <div className="bg-muted border-b border-border p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-trust-900 shadow-sm">
               <User size={18} />
            </div>
            <div>
               <h2 className="font-bold text-trust-900 text-lg">ข้อมูลผู้ติดต่อหลัก (Lead Booker)</h2>
               <p className="text-xs text-muted-foreground">ผู้รับเอกสารการจองและเป็นผู้ติดต่อหลัก</p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>ชื่อ (ภาษาอังกฤษ) <span className="text-destructive">*</span></Label>
                <Input placeholder="เช่น SOMCHAI" className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>นามสกุล (ภาษาอังกฤษ) <span className="text-destructive">*</span></Label>
                <Input placeholder="เช่น JONGTOUR" className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทรศัพท์มือถือ <span className="text-destructive">*</span></Label>
                <Input type="tel" placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label>อีเมล <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="example@email.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travelers Setup */}
        <Card className="border-border shadow-soft overflow-hidden">
          <div className="bg-muted border-b border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-trust-900 shadow-sm">
                  <Users size={18} />
               </div>
               <div>
                  <h2 className="font-bold text-trust-900 text-lg">ผู้เดินทางท่านที่ 1 (ผู้ใหญ่)</h2>
                  <p className="text-xs text-muted-foreground">กรุณากรอกภาษาอังกฤษให้ตรงกับพาสปอร์ต</p>
               </div>
            </div>
            <Badge variant="outline" className="bg-white">ผู้เดินทางหลัก</Badge>
          </div>
          <CardContent className="p-6">
            <label className="flex items-center gap-3 mb-6 p-3 rounded-lg border border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary" />
              <span className="text-sm font-medium text-trust-900">คัดลอกข้อมูลจากผู้ติดต่อหลัก (Lead Booker)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>คำนำหน้า <span className="text-destructive">*</span></Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary">
                   <option value="">เลือกคำนำหน้า</option>
                   <option value="MR">Mr. (นาย)</option>
                   <option value="MRS">Mrs. (นาง)</option>
                   <option value="MISS">Miss. (นางสาว)</option>
                   <option value="MSTR">Mstr. (เด็กชาย)</option>
                </select>
              </div>
              <div className="hidden md:block"></div> {/* Spacer */}
              
              <div className="space-y-2">
                <Label>ชื่อ (ภาษาอังกฤษ) <span className="text-destructive">*</span></Label>
                <Input placeholder="เช่น SOMCHAI" className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>นามสกุล (ภาษาอังกฤษ) <span className="text-destructive">*</span></Label>
                <Input placeholder="เช่น JONGTOUR" className="uppercase" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Next Step Button */}
        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-trust-900" asChild>
             <Link href={`/tour/${params.tourId}`}>ย้อนกลับ</Link>
          </Button>
          <Button size="lg" className="px-8 shadow-floating" asChild>
             <Link href={`/booking/payment/BOK-mock-1234`}>
                ดำเนินการต่อไปยังหน้าชำระเงิน <ChevronRight className="w-5 h-5 ml-1" />
             </Link>
          </Button>
        </div>

      </div>

      {/* Right Column - Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
           
           {/* Summary Card */}
           <Card className="border-border shadow-floating overflow-hidden">
             <div className="bg-trust-900 text-white p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                  <Plane className="w-32 h-32" />
               </div>
               <Badge variant="brand" className="mb-3 bg-white/20 text-white border-transparent">สรุปรายละเอียดการจอง</Badge>
               <h3 className="font-bold text-xl leading-snug mb-2 relative z-10">แพ็กเกจทัวร์ฮอกไกโด ซัปโปโร โอตารุ ชมทุ่งดอกลาเวนเดอร์ ฟาร์มโทมิตะ</h3>
               <div className="flex items-center gap-2 text-trust-300 text-sm relative z-10">
                  <MapPin className="w-4 h-4" /> ญี่ปุ่น (Japan)
               </div>
             </div>
             
             <div className="p-6 space-y-5 border-b border-border">
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">วันเดินทาง</p>
                    <p className="font-bold text-trust-900 text-sm">12 ต.ค. 2026 - 17 ต.ค. 2026</p>
                    <p className="text-xs text-muted-foreground mt-0.5">6 วัน 4 คืน</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                 </div>
                 <div className="w-full">
                    <p className="text-xs text-muted-foreground font-medium mb-1">ผู้เดินทาง</p>
                    <div className="flex justify-between items-center">
                       <p className="font-bold text-trust-900 text-sm">ผู้ใหญ่ 2 ท่าน</p>
                       <p className="text-sm font-medium text-trust-900">฿91,800</p>
                    </div>
                 </div>
               </div>
             </div>
   
             <div className="p-6 bg-muted/30">
               <div className="space-y-3 mb-4">
                 <div className="flex justify-between items-center text-sm text-trust-900">
                   <span>ราคาโปรแกรมทัวร์รวม</span>
                   <span className="font-medium">฿91,800</span>
                 </div>
                 <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
                   <span className="flex items-center gap-1"><BadgeCheck className="w-4 h-4"/> ส่วนลดโปรโมชัน</span>
                   <span>- ฿2,000</span>
                 </div>
               </div>
               
               <div className="pt-4 border-t border-border flex justify-between items-end">
                 <div>
                   <span className="block text-sm font-bold text-trust-900 mb-0.5">ยอดชำระสุทธิ</span>
                   <span className="block text-xs text-muted-foreground">รวมภาษีและค่าธรรมเนียมแล้ว</span>
                 </div>
                 <span className="text-3xl font-black text-primary tracking-tight">฿89,800</span>
               </div>
             </div>
           </Card>
   
           {/* Urgency / Trust Banner */}
           <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
             <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
             <div>
                <p className="text-sm font-bold text-emerald-900 mb-1">ที่นั่งถูกล็อกไว้ให้คุณแล้ว!</p>
                <p className="text-xs text-emerald-700 leading-relaxed">ราคานี้ได้รับการยืนยันและล็อกที่นั่งไว้ชั่วคราว กรุณาทำรายการและชำระเงินภายในเวลา <span className="font-bold bg-white px-1.5 py-0.5 rounded text-emerald-800">30:00</span> นาที</p>
             </div>
           </div>

           {/* Mobile Sticky Booking Summary (Visible only on small screens at the bottom) */}
           <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center">
              <div>
                 <p className="text-xs text-muted-foreground">ยอดชำระสุทธิ</p>
                 <p className="text-2xl font-black text-primary">฿89,800</p>
              </div>
              <Button size="lg" className="shadow-floating" asChild>
                 <Link href={`/booking/payment/BOK-mock-1234`}>ดำเนินการต่อ</Link>
              </Button>
           </div>
        </div>
      </div>

    </div>
  );
}
