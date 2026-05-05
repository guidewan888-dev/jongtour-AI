import React from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Clock, Download, CheckCircle, ArrowUpRight } from "lucide-react";

const commissions = [
  { booking: "JT-202605-001", tour: "ญี่ปุ่น โอซาก้า 5D3N", pax: 4, amount: 120000, rate: 10, commission: 12000, status: "approved" },
  { booking: "JT-202605-002", tour: "เกาหลี โซล 4D2N", pax: 2, amount: 35000, rate: 10, commission: 3500, status: "approved" },
  { booking: "JT-202604-099", tour: "ยุโรปตะวันออก 8D6N", pax: 6, amount: 450000, rate: 10, commission: 45000, status: "pending" },
];

export default function AgentCommissionPage() {
  const pending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.commission, 0);
  const approved = commissions.filter(c => c.status === "approved").reduce((s, c) => s + c.commission, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white py-4 px-6"><div className="max-w-7xl mx-auto text-xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></div></header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">ค่าคอมมิชชัน</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-100"><div className="text-sm text-amber-600 font-medium">รอตรวจสอบ (Pending)</div><div className="text-2xl font-bold mt-1 text-amber-700">฿{pending.toLocaleString()}</div></div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-100"><div className="text-sm text-emerald-600 font-medium">อนุมัติแล้ว (Approved)</div><div className="text-2xl font-bold mt-1 text-emerald-700">฿{approved.toLocaleString()}</div></div>
          <div className="bg-white p-5 rounded-2xl border border-blue-100"><div className="text-sm text-blue-600 font-medium">จ่ายแล้ว (Paid YTD)</div><div className="text-2xl font-bold mt-1 text-blue-700">฿245,000</div></div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">รายการคอมมิชชัน</h3>
            <button className="text-sm text-primary font-medium flex items-center gap-1"><Download className="w-4 h-4" /> Export</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="text-left px-4 py-3">Booking</th><th className="text-left px-4 py-3">ทัวร์</th><th className="text-right px-4 py-3">ยอดขาย</th><th className="text-center px-4 py-3">Rate</th><th className="text-right px-4 py-3">Commission</th><th className="text-center px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {commissions.map(c => (
                <tr key={c.booking} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.booking}</td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{c.tour}</td>
                  <td className="px-4 py-3 text-right">฿{c.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{c.rate}%</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">฿{c.commission.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
          <div><div className="font-bold text-orange-900">ถอนเงินค่าคอมมิชชัน</div><div className="text-sm text-orange-600">ยอดขั้นต่ำ ฿5,000</div></div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">Request Withdrawal</button>
        </div>
      </main>
    </div>
  );
}
