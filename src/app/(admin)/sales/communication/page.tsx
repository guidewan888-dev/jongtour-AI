import React from "react";
import { MessageCircle, Mail, Phone, Search, Send, Clock, User } from "lucide-react";

const messages = [
  { id: 1, from: "คุณสมชาย", channel: "LINE", msg: "สนใจทัวร์ญี่ปุ่นเดือน ก.ค. ครับ", time: "10 นาทีที่แล้ว", unread: true },
  { id: 2, from: "คุณวิภา", channel: "Email", msg: "ขอใบเสนอราคาทัวร์เกาหลี 4 คน", time: "1 ชม. ที่แล้ว", unread: true },
  { id: 3, from: "AI Handoff", channel: "AI Chat", msg: "ลูกค้าต้องการคุยกับเจ้าหน้าที่ — สนใจทัวร์ยุโรป", time: "2 ชม. ที่แล้ว", unread: false },
  { id: 4, from: "คุณนิธิ", channel: "โทรศัพท์", msg: "Call log: สอบถามวีซ่าจีน 15 นาที", time: "3 ชม. ที่แล้ว", unread: false },
];

const channelIcon: Record<string, any> = { LINE: MessageCircle, Email: Mail, "AI Chat": MessageCircle, "โทรศัพท์": Phone };
const channelColor: Record<string, string> = { LINE: "bg-green-100 text-green-600", Email: "bg-blue-100 text-blue-600", "AI Chat": "bg-purple-100 text-purple-600", "โทรศัพท์": "bg-amber-100 text-amber-600" };

export default function SaleCommunicationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Communication</h1><p className="text-slate-500 text-sm mt-1">ข้อความจากทุกช่องทาง</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Send className="w-4 h-4" /> ส่งข้อความ</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาข้อความ..." /></div></div>
        <div className="divide-y divide-slate-50">
          {messages.map(m => {
            const Icon = channelIcon[m.channel] || MessageCircle;
            return (
              <div key={m.id} className={`p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 ${m.unread ? "bg-blue-50/50" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${channelColor[m.channel] || "bg-slate-100"}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm text-slate-900">{m.from}</span>{m.unread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}</div>
                  <div className="text-sm text-slate-500 truncate">{m.msg}</div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">{m.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
