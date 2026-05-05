import React from "react";
import { Users, Search, Phone, Mail, Star, MoreHorizontal } from "lucide-react";

const customers = [
  { id: "C-001", name: "คุณสมชาย วงศ์ดี", email: "somchai@gmail.com", phone: "081-234-5678", bookings: 5, spent: 195000, tags: ["VIP"], lastContact: "3 พ.ค." },
  { id: "C-002", name: "คุณวิภา ศรีสุข", email: "vipa@hotmail.com", phone: "089-876-5432", bookings: 2, spent: 65000, tags: [], lastContact: "1 พ.ค." },
  { id: "C-003", name: "คุณนิธิ เจริญกิจ", email: "nithi@company.com", phone: "062-111-2222", bookings: 1, spent: 35000, tags: ["CORPORATE"], lastContact: "28 เม.ย." },
];

export default function SaleCustomersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">ลูกค้าของฉัน</h1><p className="text-slate-500 text-sm mt-1">รายชื่อลูกค้าที่ดูแล</p></div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="ค้นหาลูกค้า..." /></div></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">ลูกค้า</th><th className="text-center px-4 py-3">Bookings</th><th className="text-right px-4 py-3">ยอดใช้จ่าย</th><th className="text-right px-4 py-3">Last Contact</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">{c.name[3]}</div>
                    <div>
                      <div className="font-medium text-slate-900 flex items-center gap-1">{c.name}{c.tags.includes("VIP") && <Star className="w-3 h-3 text-amber-500" />}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-medium">{c.bookings}</td>
                <td className="px-4 py-3 text-right font-bold">฿{c.spent.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-400 text-xs">{c.lastContact}</td>
                <td className="px-4 py-3"><button className="p-1 hover:bg-slate-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
