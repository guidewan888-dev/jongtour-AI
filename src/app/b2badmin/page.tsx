import { Percent, TrendingUp, Users, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function B2BAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Pricing Control Dashboard</h2>
        <p className="text-sm text-slate-500">ภาพรวมโครงสร้างราคา ส่วนลด และคูปองโปรโมชันทั้งหมด</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Percent className="text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Base Admin Markup</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">15.0%</p>
          <p className="text-xs text-slate-400 mt-2">อัตรากำไรตั้งต้นสำหรับ B2B</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
              <Users className="text-amber-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Avg. Agent Discount</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">10.5%</p>
          <p className="text-xs text-slate-400 mt-2">ค่าเฉลี่ยส่วนลดที่ให้เอเจนซี่</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <TrendingUp className="text-indigo-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Active Promotions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
          <p className="text-xs text-slate-400 mt-2">แคมเปญที่กำลังใช้งาน</p>
        </div>

        <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-red-200 text-red-500">
              <AlertTriangle />
            </div>
          </div>
          <p className="text-sm font-medium text-red-800 relative">Negative Margin Alert</p>
          <p className="text-2xl font-bold text-red-900 mt-1 relative">0</p>
          <p className="text-xs text-red-700 mt-2 relative">ไม่พบโปรแกรมที่ราคาขายขาดทุน</p>
        </div>
      </div>
    </div>
  );
}
