import { CreditCard, QrCode, Building2, CheckCircle, Lock, ReceiptText, Upload, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";
import { Badge } from "@/components/ui-new/Badge";
import { Input } from "@/components/ui-new/Input";

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Back to Edit Button */}
      <div className="mb-4">
         <Link href="#" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-trust-900 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> ย้อนกลับไปแก้ไขข้อมูลผู้เดินทาง
         </Link>
      </div>

      {/* Modern Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-8">
        <div className="relative flex items-center justify-between w-full">
          {/* Background Line */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted rounded-full"></div>
          {/* Active Line (Progress) */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[75%] h-1 bg-primary rounded-full transition-all duration-500"></div>
          
          {/* Step 1: Completed */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white">
               <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-primary">ข้อมูลผู้เดินทาง</span>
          </div>
          
          {/* Step 2: Active */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 ring-4 ring-white">2</div>
            <span className="text-xs font-bold text-primary">ชำระเงิน</span>
          </div>
          
          {/* Step 3: Pending */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-muted text-muted-foreground flex items-center justify-center font-bold ring-4 ring-white">3</div>
            <span className="text-xs font-medium text-muted-foreground">เสร็จสิ้น</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Left/Top: Payment Methods */}
         <div className="md:col-span-2">
            <Card className="border-border shadow-soft overflow-hidden">
              {/* Payment Header */}
              <div className="bg-trust-900 p-8 text-center text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                   <ReceiptText className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                   <p className="text-trust-300 text-sm font-medium mb-2 uppercase tracking-widest">ยอดชำระเงินสุทธิ</p>
                   <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 text-primary">฿89,800</h1>
                   <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full mt-4">
                     <span className="text-trust-300 text-sm">หมายเลขการจอง:</span>
                     <span className="text-white font-mono font-bold tracking-wider">{params.bookingId}</span>
                   </div>
                </div>
              </div>

              {/* Payment Methods Options */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-trust-900">เลือกช่องทางการชำระเงิน</h2>
                   <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">ไม่มีค่าธรรมเนียม</Badge>
                </div>
                
                <div className="space-y-4">
                  {/* Credit Card Option */}
                  <label className="flex items-start gap-4 p-5 border-2 border-primary bg-primary-50/50 rounded-xl cursor-pointer transition-colors shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>
                    <input type="radio" name="paymentMethod" defaultChecked className="mt-1.5 w-4 h-4 text-primary focus:ring-primary accent-primary" />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-trust-900 flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-primary"/> บัตรเครดิต / เดบิต</span>
                        <div className="flex gap-1">
                          <div className="w-10 h-6 bg-white border border-border rounded flex items-center justify-center">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-2.5 object-contain" alt="Visa" />
                          </div>
                          <div className="w-10 h-6 bg-white border border-border rounded flex items-center justify-center">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-3.5 object-contain" alt="Mastercard" />
                          </div>
                          <div className="w-10 h-6 bg-white border border-border rounded flex items-center justify-center">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/JCB_logo.svg/2560px-JCB_logo.svg.png" className="h-3 object-contain" alt="JCB" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">ชำระผ่านระบบ Payment Gateway มาตรฐานสากล PCI-DSS</p>
                      
                      {/* Credit Card Form Mockup */}
                      <div className="mt-5 space-y-4">
                        <div className="relative">
                           <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                           <Input type="text" placeholder="หมายเลขบัตร 16 หลัก" className="pl-10 font-mono" />
                        </div>
                        <div className="flex gap-4">
                          <Input type="text" placeholder="ดด/ปป (MM/YY)" className="w-1/2 font-mono" />
                          <div className="w-1/2 relative">
                             <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                             <Input type="text" placeholder="รหัส CVC" className="w-full font-mono pr-10" />
                          </div>
                        </div>
                        <Input type="text" placeholder="ชื่อบนบัตร (ภาษาอังกฤษ)" className="uppercase" />
                      </div>
                    </div>
                  </label>

                  {/* QR Option */}
                  <label className="flex items-start gap-4 p-5 border border-border hover:border-primary/50 hover:bg-muted/20 rounded-xl cursor-pointer transition-colors group">
                    <input type="radio" name="paymentMethod" className="mt-1.5 w-4 h-4 text-primary focus:ring-primary accent-primary" />
                    <div className="flex-1">
                      <span className="font-bold text-trust-900 flex items-center gap-2 text-lg group-hover:text-primary transition-colors"><QrCode className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/> สแกน QR Code (PromptPay)</span>
                      <p className="text-sm text-muted-foreground mt-1">รองรับแอปพลิเคชันของทุกธนาคาร ยอดเงินอัปเดตอัตโนมัติ</p>
                    </div>
                  </label>

                  {/* Bank Transfer Option */}
                  <label className="flex items-start gap-4 p-5 border border-border hover:border-primary/50 hover:bg-muted/20 rounded-xl cursor-pointer transition-colors group">
                    <input type="radio" name="paymentMethod" className="mt-1.5 w-4 h-4 text-primary focus:ring-primary accent-primary" />
                    <div className="flex-1">
                      <span className="font-bold text-trust-900 flex items-center gap-2 text-lg group-hover:text-primary transition-colors"><Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/> โอนเงินผ่านบัญชีธนาคาร</span>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">ธนาคารกสิกรไทย บจก. จงทัวร์ เลขที่ 123-4-56789-0</p>
                      <div className="border border-dashed border-border rounded-lg p-4 text-center bg-white">
                         <Upload className="w-6 h-6 text-primary mx-auto mb-2" />
                         <span className="text-sm font-medium text-trust-900 block">อัปโหลดสลิปโอนเงิน</span>
                         <span className="text-xs text-muted-foreground">รองรับ JPG, PNG, PDF ขนาดไม่เกิน 5MB</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <Button size="lg" className="w-full text-lg h-14 shadow-floating" asChild>
                     <Link href={`/booking/success/${params.bookingId}`}>
                        ยืนยันการชำระเงิน ฿89,800
                     </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> การชำระเงินของคุณได้รับการเข้ารหัสความปลอดภัยระดับสากล 256-bit SSL
                  </p>
                </div>
              </div>
            </Card>
         </div>

         {/* Right: Security & Summary */}
         <div className="md:col-span-1 space-y-6">
            <Card className="border-border shadow-soft bg-trust-900 text-white border-transparent">
               <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 pb-4 border-b border-trust-800">สรุปการจองของคุณ</h3>
                  <p className="text-trust-300 text-xs mb-1">แพ็กเกจทัวร์</p>
                  <p className="font-bold mb-4 line-clamp-2">ฮอกไกโด ซัปโปโร โอตารุ ชมทุ่งดอกลาเวนเดอร์</p>
                  
                  <div className="space-y-3 text-sm border-b border-trust-800 pb-4 mb-4">
                     <div className="flex justify-between">
                        <span className="text-trust-300">รหัสทัวร์</span>
                        <span>JP-001</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-trust-300">วันเดินทาง</span>
                        <span>12 - 17 ต.ค. 2026</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-trust-300">ผู้เดินทาง</span>
                        <span>ผู้ใหญ่ 2 ท่าน</span>
                     </div>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg text-primary">
                     <span>ยอดสุทธิ</span>
                     <span>฿89,800</span>
                  </div>
               </CardContent>
            </Card>
            
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex gap-3">
               <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
               <div>
                  <p className="font-bold text-emerald-900 text-sm mb-1">ยกเลิกได้ฟรี ภายใน 24 ชม.</p>
                  <p className="text-xs text-emerald-700">เงื่อนไขเป็นไปตามที่บริษัทกำหนด</p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
