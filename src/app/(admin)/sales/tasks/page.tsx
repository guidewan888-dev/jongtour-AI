import React from "react";
import { CheckCircle, Circle, Clock, Plus, Calendar } from "lucide-react";

const tasks = [
  { id: 1, title: "โทรยืนยันลูกค้า คุณสมชาย", due: "วันนี้ 14:00", status: "pending", priority: "high" },
  { id: 2, title: "ส่งใบเสนอราคาทัวร์ยุโรป — บจก. ABC", due: "วันนี้ 17:00", status: "pending", priority: "high" },
  { id: 3, title: "ตรวจสอบวีซ่าจีน คุณนิธิ", due: "พรุ่งนี้ 10:00", status: "pending", priority: "medium" },
  { id: 4, title: "ส่ง Follow-up ทัวร์ญี่ปุ่น Lead #45", due: "เมื่อวาน", status: "done", priority: "low" },
];

export default function SaleTasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Tasks</h1><p className="text-slate-500 text-sm mt-1">รายการงานของฉัน</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> เพิ่ม Task</button>
      </div>

      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className={`bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 hover:shadow-sm transition-all ${t.status === "done" ? "opacity-60" : ""}`}>
            <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${t.status === "done" ? "border-emerald-400 bg-emerald-100" : "border-slate-300 hover:border-primary"}`}>
              {t.status === "done" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </button>
            <div className="flex-1">
              <div className={`font-medium text-sm ${t.status === "done" ? "line-through text-slate-400" : "text-slate-900"}`}>{t.title}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.due}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.priority === "high" ? "bg-red-100 text-red-700" : t.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{t.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
