import React from "react";
import { FileText, Search, PenLine } from "lucide-react";

const posts = [
  { id: 1, title: "10 เมืองน่าเที่ยวญี่ปุ่น ฤดูใบไม้ร่วง 2026", status: "published", author: "Admin", date: "2026-05-01", views: 1240 },
  { id: 2, title: "เตรียมตัวก่อนไปเกาหลี: สิ่งที่ต้องรู้", status: "draft", author: "Admin", date: "2026-04-28", views: 0 },
  { id: 3, title: "รีวิว ทัวร์ยุโรปตะวันออก 8 วัน กับ Jongtour", status: "published", author: "Content", date: "2026-04-20", views: 890 },
];

export default function BlogCMSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Blog CMS</h1><p className="text-slate-500 text-sm mt-1">จัดการบทความและเนื้อหา</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors"><PenLine className="w-4 h-4" /> เขียนบทความใหม่</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาบทความ..." /></div></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="text-left px-4 py-3">บทความ</th><th className="text-center px-4 py-3">สถานะ</th><th className="text-right px-4 py-3">Views</th><th className="text-right px-4 py-3">วันที่</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><div><div className="font-medium text-slate-900">{p.title}</div><div className="text-xs text-slate-400">{p.author}</div></div></div></td>
                <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-right font-medium">{p.views.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-500">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
