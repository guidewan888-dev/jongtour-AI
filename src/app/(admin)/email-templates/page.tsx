import React from "react";
import { Mail, Plus, Edit, Eye, Search } from "lucide-react";

const templates = [
  { id: 1, name: "Booking Confirmation", subject: "ยืนยันการจอง #{booking_no}", type: "transactional", lastEdit: "3 พ.ค." },
  { id: 2, name: "Payment Received", subject: "ได้รับชำระเงินแล้ว", type: "transactional", lastEdit: "1 พ.ค." },
  { id: 3, name: "Voucher Ready", subject: "Voucher พร้อมดาวน์โหลด", type: "transactional", lastEdit: "28 เม.ย." },
  { id: 4, name: "Welcome Email", subject: "ยินดีต้อนรับสู่ Jongtour!", type: "marketing", lastEdit: "20 เม.ย." },
  { id: 5, name: "Flash Sale Alert", subject: "⚡ Flash Sale — ทัวร์ลดสูงสุด 50%!", type: "marketing", lastEdit: "15 เม.ย." },
  { id: 6, name: "Interview Invite", subject: "เชิญสัมภาษณ์ตำแหน่ง...", type: "hr", lastEdit: "10 เม.ย." },
];

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Email Templates</h1><p className="text-slate-500 text-sm mt-1">จัดการ template อีเมลระบบ</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> สร้าง Template</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">Template</th><th className="text-left px-4 py-3">Subject</th><th className="text-center px-4 py-3">Type</th><th className="text-right px-4 py-3">Last Edit</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {templates.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {t.name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{t.subject}</td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.type === "transactional" ? "bg-blue-100 text-blue-700" : t.type === "marketing" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>{t.type}</span></td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{t.lastEdit}</td>
                <td className="px-4 py-3 flex gap-1"><button className="p-1 hover:bg-slate-100 rounded-lg"><Edit className="w-4 h-4 text-slate-400" /></button><button className="p-1 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
