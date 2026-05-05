import React from "react";
import { MessageSquare, Mail, Bell, Send, Search, Filter } from "lucide-react";

const channels = [
  { name: "LINE Official", icon: MessageSquare, count: 45, color: "bg-green-100 text-green-700" },
  { name: "Email", icon: Mail, count: 128, color: "bg-blue-100 text-blue-700" },
  { name: "Push Notifications", icon: Bell, count: 320, color: "bg-purple-100 text-purple-700" },
  { name: "SMS", icon: Send, count: 12, color: "bg-amber-100 text-amber-700" },
];

const recent = [
  { id: 1, channel: "LINE", to: "กลุ่มลูกทัวร์ญี่ปุ่น มิ.ย.", msg: "แจ้งเตือน: ส่งสำเนาพาสปอร์ตก่อน 1 มิ.ย.", time: "2 ชม. ที่แล้ว", status: "sent" },
  { id: 2, channel: "Email", to: "john@example.com", msg: "ยืนยันการชำระเงิน BK-20260515-001", time: "5 ชม. ที่แล้ว", status: "sent" },
  { id: 3, channel: "Push", to: "All Users", msg: "โปรโมชั่น Flash Sale ทัวร์เกาหลี!", time: "1 วัน", status: "scheduled" },
];

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Communications Center</h1><p className="text-slate-500 text-sm mt-1">จัดการการสื่อสารกับลูกค้าทุกช่องทาง</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors"><Send className="w-4 h-4" /> สร้างข้อความใหม่</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {channels.map((c) => (
          <div key={c.name} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <div className="text-sm font-medium text-slate-500">{c.name}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{c.count}</div>
            <div className="text-xs text-slate-400 mt-1">ข้อความเดือนนี้</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">ข้อความล่าสุด</h3>
          <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-64" placeholder="ค้นหา..." /></div>
        </div>
        <div className="divide-y divide-slate-50">
          {recent.map((r) => (
            <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">{r.channel}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 text-sm truncate">{r.msg}</div>
                <div className="text-xs text-slate-400">To: {r.to} • {r.time}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
