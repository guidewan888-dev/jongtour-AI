import { Save } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function GlobalMarkupsPage() {
  const rules = await prisma.pricingRule.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Default values if no rules exist
  const adminMarkup = rules.find(r => r.type === 'MARKUP_PERCENT' && r.isActive)?.value || 15;
  const flatFee = rules.find(r => r.type === 'MARKUP_FLAT' && r.isActive)?.value || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Global Markups</h2>
        <p className="text-sm text-slate-500">ตั้งค่ากำไรมาตรฐานของระบบ (คำนวณบวกจาก Net Cost ของ Supplier)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Base Admin Markup (เปอร์เซ็นต์)</h3>
          <p className="text-sm text-slate-500 mt-1">
            อัตรากำไรขั้นต้นที่จะนำไปบวกเพิ่มจากต้นทุน (Supplier Net Cost) ก่อนนำไปแสดงเป็นราคาขาย (Selling Price)
          </p>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <input 
                type="number" 
                defaultValue={adminMarkup}
                className="w-full border border-slate-300 rounded-md py-2 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Save size={16} /> บันทึก
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-3 font-medium">
            * การเปลี่ยนค่านี้จะกระทบกับราคาขายของ "ทัวร์ใหม่" หรือทัวร์ที่ตั้งค่าแบบ Dynamic Pricing เท่านั้น ไม่กระทบทัวร์ที่ระบุราคาแบบ Fixed ไว้
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Fixed Flat Fee (เงินบาท)</h3>
          <p className="text-sm text-slate-500 mt-1">
            จำนวนเงินที่จะบวกเพิ่มคงที่ต่อ 1 Pax หลังจากหักเปอร์เซ็นต์ Markup แล้ว (ใช้สำหรับเป็น Service Charge หรือค่าธรรมเนียมขั้นต่ำ)
          </p>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">฿</span>
              <input 
                type="number" 
                defaultValue={flatFee}
                className="w-full border border-slate-300 rounded-md py-2 pl-8 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <Save size={16} /> บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
