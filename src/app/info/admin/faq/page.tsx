'use client';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

export default function FAQManagerPage() {
  const faqs = [
    { id: 1, q: "การจองทัวร์กับ Jongtour มีขั้นตอนอย่างไร?", status: "Active" },
    { id: 2, q: "ราคาทัวร์ที่แสดง รวมค่าใช้จ่ายอะไรบ้าง?", status: "Active" },
    { id: 3, q: "สามารถชำระเงินผ่านช่องทางใดได้บ้าง?", status: "Active" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">จัดการคำถามที่พบบ่อย (FAQ)</h1>
          <p className="text-slate-400">เพิ่ม ลบ หรือแก้ไขรายการถาม-ตอบที่แสดงในหน้า Help Center</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มคำถามใหม่
        </Button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700 grid grid-cols-12 gap-4 text-sm font-semibold text-slate-400">
          <div className="col-span-1"></div>
          <div className="col-span-7">คำถาม (Question)</div>
          <div className="col-span-2 text-center">สถานะ</div>
          <div className="col-span-2 text-right">จัดการ</div>
        </div>
        
        <div className="divide-y divide-slate-700/50">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-800/30 transition-colors group">
              <div className="col-span-1 flex justify-center">
                <button className="text-slate-600 hover:text-slate-400 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="col-span-7">
                <p className="font-medium text-white">{faq.q}</p>
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {faq.status}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                <button className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
