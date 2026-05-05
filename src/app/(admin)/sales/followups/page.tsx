import React from "react";
import { CheckCircle, Clock, Phone, ChevronRight, AlertCircle } from "lucide-react";

const items = [
  { id: 1, name: "คุณสมชาย วงศ์ดี", lead: "ทัวร์ญี่ปุ่น", channel: "AI", due: "วันนี้", priority: "high" },
  { id: 2, name: "คุณวิภา ศรีสุข", lead: "ทัวร์เกาหลี", channel: "LINE", due: "วันนี้", priority: "medium" },
  { id: 3, name: "บจก. ABC Travel", lead: "Private Group ยุโรป", channel: "Form", due: "พรุ่งนี้", priority: "high" },
  { id: 4, name: "คุณนิธิ เจริญกิจ", lead: "วีซ่าจีน", channel: "โทร", due: "เกินกำหนด", priority: "overdue" },
];

export default function SaleFollowupsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1><p className="text-slate-500 text-sm mt-1">รายการที่ต้องติดตามลูกค้า</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100"><div className="text-sm text-red-600 font-medium">เกินกำหนด</div><div className="text-2xl font-bold text-red-700">1</div></div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100"><div className="text-sm text-amber-600 font-medium">วันนี้</div><div className="text-2xl font-bold text-amber-700">2</div></div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100"><div className="text-sm text-blue-600 font-medium">พรุ่งนี้</div><div className="text-2xl font-bold text-blue-700">1</div></div>
      </div>

      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className={`bg-white p-4 rounded-2xl border ${i.priority === "overdue" ? "border-red-200" : "border-slate-200"} flex items-center gap-4 hover:shadow-md transition-all cursor-pointer`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i.priority === "overdue" ? "bg-red-100" : i.priority === "high" ? "bg-amber-100" : "bg-blue-100"}`}>
              {i.priority === "overdue" ? <AlertCircle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 text-sm">{i.name}</div>
              <div className="text-xs text-slate-500">{i.lead} • จาก {i.channel}</div>
            </div>
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.priority === "overdue" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{i.due}</div>
            <div className="flex gap-2">
              <button className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 text-xs font-bold">✓ ติดตามแล้ว</button>
              <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 text-xs font-bold">เลื่อน</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
