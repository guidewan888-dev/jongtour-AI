import { Search, Map, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SalesTourSearchPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sales Tour Search (Read-only)</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
            <ShieldAlert size={14} className="text-amber-500" />
            โหมดสำหรับทีมขาย: เช็คที่นั่งได้ แต่ไม่สามารถแก้ไขข้อมูลทัวร์ได้
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยรหัสทัวร์, ประเทศ, หรือคีย์เวิร์ด..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg text-sm outline-none"
          />
        </div>
        <select className="w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none">
          <option>ทุก Wholesale</option>
          <option>Let's Go Group</option>
          <option>Go365</option>
        </select>
        <button className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-slate-800">ค้นหาด่วน</button>
      </div>

      {/* Sales Tour Results (Compact List View) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">รหัส / ชื่อโปรแกรม</th>
              <th className="px-6 py-4">Wholesale</th>
              <th className="px-6 py-4">ระยะเวลา</th>
              <th className="px-6 py-4">รอบเดินทาง (ที่นั่งว่าง)</th>
              <th className="px-6 py-4 text-right">ราคาขาย (B2C)</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Row 1 */}
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-mono text-xs text-slate-500 mb-1">T-JAP-001</p>
                <p className="font-bold text-slate-800 line-clamp-1">ฮอกไกโด ซัปโปโร เล่นสกี</p>
              </td>
              <td className="px-6 py-4 text-slate-600 text-xs">Let's Go Group</td>
              <td className="px-6 py-4 text-slate-600 text-xs">6D4N</td>
              <td className="px-6 py-4">
                <select className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 outline-none">
                  <option>12 ต.ค. (ว่าง 5)</option>
                  <option>20 ต.ค. (ว่าง 12)</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-800">฿45,900</td>
              <td className="px-6 py-4 text-center">
                <button className="text-indigo-600 font-bold text-xs hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded">Copy ลิงก์</button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-mono text-xs text-slate-500 mb-1">T-EUR-089</p>
                <p className="font-bold text-slate-800 line-clamp-1">ยุโรปตะวันออก (สวิส อิตาลี)</p>
              </td>
              <td className="px-6 py-4 text-slate-600 text-xs">Go365</td>
              <td className="px-6 py-4 text-slate-600 text-xs">8D5N</td>
              <td className="px-6 py-4">
                <select className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 outline-none">
                  <option>28 ธ.ค. (ว่าง 2)</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right font-bold text-slate-800">฿75,900</td>
              <td className="px-6 py-4 text-center">
                <button className="text-indigo-600 font-bold text-xs hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded">Copy ลิงก์</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
