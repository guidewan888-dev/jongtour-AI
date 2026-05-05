import React from "react";
import Link from "next/link";
import { Search, Filter, Eye, CheckCircle } from "lucide-react";

const STATUS_C: Record<string,string> = { pending:"bg-amber-100 text-amber-700", confirmed:"bg-blue-100 text-blue-700", holding:"bg-purple-100 text-purple-700", approved:"bg-emerald-100 text-emerald-700", paid:"bg-emerald-100 text-emerald-700", rejected:"bg-red-100 text-red-700" };

const rows = [
  { id:"CM-001", affiliate:"JoyTravels", booking:"B-1234", product:"Tour: Hokkaido Premium", value:"฿80,000", rate:"22%", amount:"฿17,600", status:"approved", date:"01/05/69" },
  { id:"CM-002", affiliate:"TravelMore", booking:"B-1240", product:"Tour: Tokyo Explorer", value:"฿45,000", rate:"12%", amount:"฿5,400", status:"holding", date:"02/05/69" },
  { id:"CM-003", affiliate:"BackpackTH", booking:"B-1245", product:"Visa: USA EXCLUSIVE", value:"฿12,000", rate:"5%", amount:"฿600", status:"confirmed", date:"03/05/69" },
  { id:"CM-004", affiliate:"JoyTravels", booking:"B-1250", product:"Private Group: Bali", value:"฿280,000", rate:"18%", amount:"฿50,400", status:"pending", date:"04/05/69" },
  { id:"CM-005", affiliate:"Sara M.", booking:"B-1252", product:"Tour: Seoul Spring", value:"฿35,000", rate:"5%", amount:"฿1,750", status:"paid", date:"28/04/69" },
];

export default function CommissionsLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">💰 Commission Ledger</h1><p className="text-sm text-slate-500 mt-1">Pending → Confirmed → Holding → Approved → Paid</p></div><div className="flex gap-2"><Link href="/affiliate-admin/commissions/batch" className="btn-outline text-sm">📋 Batch Approve</Link></div></div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">{["ทั้งหมด","Pending","Confirmed","Holding","Approved","Paid"].map(t=>(<button key={t} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-900 shadow-sm">{t}</button>))}</div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ID</th><th className="px-3 py-3">Affiliate</th><th className="px-3 py-3">Product</th><th className="px-3 py-3 text-right">Booking Value</th><th className="px-3 py-3">Rate</th><th className="px-3 py-3 text-right">Commission</th><th className="px-3 py-3">Status</th><th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{rows.map(r=>(<tr key={r.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono text-xs">{r.id}</td><td className="px-3 py-3 font-medium">{r.affiliate}</td><td className="px-3 py-3 text-xs">{r.product}</td><td className="px-3 py-3 text-right">{r.value}</td><td className="px-3 py-3 text-center font-mono">{r.rate}</td><td className="px-3 py-3 text-right font-bold text-primary">{r.amount}</td><td className="px-3 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_C[r.status]}`}>{r.status}</span></td><td className="px-3 py-3"><Link href={`/affiliate-admin/commissions/${r.id}`} className="text-primary text-xs"><Eye className="w-3.5 h-3.5"/></Link></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
