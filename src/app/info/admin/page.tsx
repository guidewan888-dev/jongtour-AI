import { FileText, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

export default function InfoAdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CMS Dashboard</h1>
        <p className="text-slate-400">ภาพรวมการเข้าชมเว็บไซต์และเนื้อหาบทความ</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-emerald-400 flex items-center text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" /> +12%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">ยอดผู้เข้าชมรวม (เดือนนี้)</h3>
          <p className="text-3xl font-bold text-white">124,500</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <span className="text-emerald-400 flex items-center text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-1" /> +5%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">ยอดคลิกปุ่มค้นหาทัวร์</h3>
          <p className="text-3xl font-bold text-white">45,200</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-slate-500 flex items-center text-sm font-semibold">
              คงที่
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">จำนวนบทความทั้งหมด</h3>
          <p className="text-3xl font-bold text-white">128</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">บทความยอดฮิตเดือนนี้</h3>
          <p className="text-lg font-bold text-white truncate" title="10 ที่เที่ยวญี่ปุ่นฤดูใบไม้เปลี่ยนสี">10 ที่เที่ยวญี่ปุ่นฤดูใบไม้...</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-96 flex flex-col items-center justify-center text-slate-500">
          [Chart Placeholder: Traffic Overview]
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-96 flex flex-col items-center justify-center text-slate-500">
          [Chart Placeholder: Traffic by Device]
        </div>
      </div>
    </div>
  );
}
