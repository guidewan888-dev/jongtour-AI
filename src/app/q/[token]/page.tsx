import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, CheckCircle, Clock, ArrowRight } from "lucide-react";

export default function PublicQuotationPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-6"><div className="max-w-4xl mx-auto text-xl font-black tracking-tighter text-slate-900">JONGTOUR</div></header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="g-badge-info mx-auto w-fit mb-2">ใบเสนอราคา</div>
          <h1 className="text-2xl font-bold text-slate-900">ทัวร์ญี่ปุ่น โตเกียว โอซาก้า 6D4N</h1>
          <p className="text-slate-500 text-sm mt-1">จัดทำโดย บจก. ทราเวลเอ็กซ์เพิร์ท</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="g-card p-4"><MapPin className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">ปลายทาง</div><div className="font-bold text-sm">ญี่ปุ่น</div></div>
          <div className="g-card p-4"><Calendar className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">วันเดินทาง</div><div className="font-bold text-sm">15-20 มิ.ย. 2026</div></div>
          <div className="g-card p-4"><Users className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">จำนวน</div><div className="font-bold text-sm">2 ท่าน</div></div>
          <div className="g-card p-4"><Clock className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xs text-slate-500">ใช้ได้ถึง</div><div className="font-bold text-sm text-amber-600">20 พ.ค. 2026</div></div>
        </div>

        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Itinerary</h3>
          <div className="space-y-3">
            {[
              { day: 1, title: "กรุงเทพฯ → โตเกียว", desc: "เดินทางถึงสนามบินนาริตะ เข้าเช็คอินโรงแรม" },
              { day: 2, title: "โตเกียว: อาซากุสะ + ชิบูย่า + ชินจูกุ", desc: "วัดเซ็นโซจิ, ถ่ายรูป Shibuya Crossing" },
              { day: 3, title: "ฟูจิ + ฮาโกเน่", desc: "ชมภูเขาไฟฟูจิ ล่องเรือทะเลสาบอาชิ" },
              { day: 4, title: "นาโกย่า → โอซาก้า", desc: "ปราสาทนาโกย่า ช้อปปิ้งชินไซบาชิ" },
              { day: 5, title: "โอซาก้า: Universal Studios", desc: "สนุกกับ USJ เต็มวัน" },
              { day: 6, title: "โอซาก้า → กรุงเทพฯ", desc: "ช้อปปิ้งสุดท้ายก่อนกลับ" },
            ].map(d => (
              <div key={d.day} className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{d.day}</div>
                <div><div className="font-medium text-sm">{d.title}</div><div className="text-xs text-slate-500">{d.desc}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="g-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">ราคา</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">ราคาทัวร์ × 2 ท่าน</span><span>฿73,800</span></div>
            <div className="flex justify-between"><span className="text-slate-500">VAT 7%</span><span>฿5,166</span></div>
            <hr className="border-slate-100" />
            <div className="flex justify-between text-lg font-bold"><span>ยอดรวม</span><span className="text-primary">฿78,966</span></div>
          </div>
        </div>

        <div className="text-center">
          <button className="btn-primary btn-lg w-full sm:w-auto">ยอมรับและจองเลย →</button>
          <p className="text-xs text-slate-400 mt-2">ใบเสนอราคานี้ใช้ได้ถึง 20 พ.ค. 2026</p>
        </div>
      </main>
    </div>
  );
}
