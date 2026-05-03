import { BarChart, TrendingUp, Target, Users, ArrowUpRight, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SalesReportPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">รายงานยอดขาย (Sales Report)</h1>
          <p className="text-sm text-slate-500">วิเคราะห์ประสิทธิภาพการขาย คอนเวอร์ชัน และเป้าหมายประจำเดือน</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>ตุลาคม 2026</option>
            <option>กันยายน 2026</option>
            <option>สิงหาคม 2026</option>
          </select>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
            ส่งออก (Export PDF)
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <DollarSign size={24} />
            </div>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
              <TrendingUp size={12}/> 12.5%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">ยอดขายรวม (Total Revenue)</p>
          <h3 className="text-3xl font-black text-slate-800">฿845,000</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Target size={24} />
            </div>
          </div>
          <p className="relative z-10 text-slate-500 text-sm font-medium mb-1">เป้าหมาย (Quota Achievement)</p>
          <div className="relative z-10 flex items-end gap-2">
            <h3 className="text-3xl font-black text-slate-800">84.5%</h3>
            <p className="text-xs text-slate-500 mb-1">จากเป้า 1 ล้านบาท</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '84.5%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Users size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">จำนวน Lead ใหม่ (New Leads)</p>
          <h3 className="text-3xl font-black text-slate-800">124 <span className="text-base font-medium text-slate-500">คน</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
              <ArrowUpRight size={24} />
            </div>
            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
              <TrendingUp size={12}/> -2.1%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">อัตราการปิดการขาย (Win Rate)</p>
          <h3 className="text-3xl font-black text-slate-800">18.5%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Analysis */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">ที่มาของลูกค้า (Lead Sources)</h3>
          <div className="space-y-4">
            <SourceBar source="Facebook Ads" value={45} percent={36} color="bg-blue-500" />
            <SourceBar source="LINE Official" value={32} percent={25} color="bg-emerald-500" />
            <SourceBar source="Jongtour.com (Info Form)" value={28} percent={22} color="bg-indigo-500" />
            <SourceBar source="Organic / Direct Call" value={19} percent={17} color="bg-amber-500" />
          </div>
        </div>

        {/* Sales by Destination */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">ยอดขายแยกตามเส้นทาง (Top Destinations)</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="pb-3 font-medium">เส้นทาง (Destination)</th>
                <th className="pb-3 font-medium text-center">จำนวน Pax</th>
                <th className="pb-3 font-medium text-right">ยอดขาย (Revenue)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 font-bold text-slate-800">Japan (ญี่ปุ่น)</td>
                <td className="py-4 text-center">45</td>
                <td className="py-4 text-right font-mono text-emerald-600 font-bold">฿350,000</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-slate-800">Europe (ยุโรป)</td>
                <td className="py-4 text-center">12</td>
                <td className="py-4 text-right font-mono text-emerald-600 font-bold">฿280,000</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-slate-800">Korea (เกาหลี)</td>
                <td className="py-4 text-center">28</td>
                <td className="py-4 text-right font-mono text-emerald-600 font-bold">฿165,000</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-slate-800">Vietnam (เวียดนาม)</td>
                <td className="py-4 text-center">15</td>
                <td className="py-4 text-right font-mono text-emerald-600 font-bold">฿50,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SourceBar({ source, value, percent, color }: { source: string, value: number, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <p className="text-sm font-bold text-slate-700">{source}</p>
        <p className="text-xs text-slate-500">{value} leads ({percent}%)</p>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
        <div className={`${color} h-full rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
