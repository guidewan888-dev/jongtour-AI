import { BookOpen, Compass, CreditCard, Umbrella } from 'lucide-react';

export default function TravelGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">คู่มือการเดินทาง (Travel Guide)</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          เตรียมความพร้อมก่อนออกเดินทาง เพื่อให้ทริปของคุณราบรื่นและสนุกที่สุด 
          เรารวบรวมข้อมูลสำคัญที่นักเดินทางมือใหม่และมือโปรควรรู้ไว้ที่นี่
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Guide 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex gap-6">
          <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">เรื่องน่ารู้เกี่ยวกับพาสปอร์ต & วีซ่า</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>• พาสปอร์ตต้องมีอายุเหลือไม่น้อยกว่า 6 เดือนในวันเดินทาง</li>
              <li>• พาสปอร์ตต้องมีหน้าว่างเหลืออย่างน้อย 2 หน้า</li>
              <li>• ตรวจสอบรายชื่อประเทศที่คนไทยไม่ต้องขอวีซ่า (Free Visa)</li>
              <li>• เอกสารสำคัญที่ต้องเตรียมเมื่อยื่นขอเชงเก้นวีซ่า (Schengen)</li>
            </ul>
          </div>
        </div>

        {/* Guide 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex gap-6">
          <div className="w-12 h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Umbrella className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">การจัดกระเป๋า & สภาพอากาศ</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>• กฎการนำของเหลวขึ้นเครื่องบิน (ไม่เกินชิ้นละ 100ml)</li>
              <li>• แบตเตอรี่สำรอง (Power Bank) ความจุที่สายการบินอนุญาต</li>
              <li>• การแต่งกายไปเที่ยวในสภาพอากาศติดลบ / มีหิมะ</li>
              <li>• ยาประจำตัว และเอกสารทางการแพทย์ที่ควรพก</li>
            </ul>
          </div>
        </div>

        {/* Guide 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex gap-6">
          <div className="w-12 h-12 shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">การแลกเงิน & การใช้จ่าย</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>• ควรแลกเงินสดไปเท่าไหร่ถึงจะพอเหมาะ</li>
              <li>• การใช้ Travel Card (เช่น Youtrip, Planet) สะดวกอย่างไร</li>
              <li>• ประเทศที่ใช้เงินสดเป็นหลัก vs ประเทศที่เป็น Cashless 100%</li>
              <li>• การขอ Tax Refund เมื่อช้อปปิ้งในต่างประเทศ</li>
            </ul>
          </div>
        </div>

        {/* Guide 4 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex gap-6">
          <div className="w-12 h-12 shrink-0 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">ข้อควรระวังเมื่อไปกับทัวร์</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li>• กฎการรักษาเวลา (Time Management) เพื่อส่วนรวม</li>
              <li>• ทิปไกด์และคนขับรถ (Gratuity) ธรรมเนียมที่ควรทราบ</li>
              <li>• มารยาทในการถ่ายรูปและการเข้าชมสถานที่ศักดิ์สิทธิ์</li>
              <li>• การรับประทานอาหารร่วมกับคณะ และการแจ้งข้อจำกัดทางอาหาร</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
