import React from "react";
import { Eye, CheckCircle, XCircle, AlertTriangle, MapPin } from "lucide-react";

const items = [
  { id: 1, tour: "ทัวร์ญี่ปุ่น ซากุระ 6D4N", supplier: "LETGO", issue: "ราคาต่ำกว่าปกติ 40% — ต้องตรวจสอบ", priority: "high" },
  { id: 2, tour: "ทัวร์เกาหลี 4D2N ซุปเปอร์เซฟ", supplier: "ZEGO", issue: "โรงแรมไม่ตรงกับ Brochure (3→4 ดาว)", priority: "medium" },
  { id: 3, tour: "ทัวร์ยุโรป 10 วัน Grand Tour", supplier: "PANORAMA", issue: "Itinerary ขาดวันที่ 6-7 (ไม่มีข้อมูล)", priority: "high" },
];

export default function HumanReviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Human Review Queue</h1><p className="text-slate-500 text-sm mt-1">ทัวร์ที่ต้องตรวจสอบด้วยมนุษย์ก่อนเผยแพร่</p></div>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">{items.length} รายการรอตรวจ</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.priority === "high" ? "bg-red-100" : "bg-amber-100"}`}>
                  <AlertTriangle className={`w-5 h-5 ${item.priority === "high" ? "text-red-600" : "text-amber-600"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.tour}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.supplier}</p>
                  <p className="text-sm text-red-600 mt-2 font-medium">⚠️ {item.issue}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors" title="Approve"><CheckCircle className="w-5 h-5" /></button>
                <button className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Reject"><XCircle className="w-5 h-5" /></button>
                <button className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors" title="Review"><Eye className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
