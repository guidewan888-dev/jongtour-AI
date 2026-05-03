import { Search, ShieldAlert, FileJson } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Global Audit Logs</h1>
          <p className="text-sm text-gray-500">บันทึกทุกความเคลื่อนไหวและการแก้ไขข้อมูลสำคัญในระดับระบบ</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search logs by IP, User, Action..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <input type="date" className="border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none" />
          </div>
        </div>

        <table className="w-full text-left text-sm font-mono">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">User / IP</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Module</th>
              <th className="px-6 py-4 font-medium text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">2026-05-03 14:30:12</td>
              <td className="px-6 py-4 text-blue-600 font-bold">admin@jongtour.com<br/><span className="text-[10px] text-gray-400 font-normal">192.168.1.104</span></td>
              <td className="px-6 py-4"><span className="text-purple-600 font-bold">UPDATE_ROLE</span></td>
              <td className="px-6 py-4">UserManagement</td>
              <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800"><FileJson size={16}/></button></td>
            </tr>
            <tr className="hover:bg-gray-50 bg-rose-50/30">
              <td className="px-6 py-4">2026-05-03 12:15:00</td>
              <td className="px-6 py-4 text-red-600 font-bold">SYSTEM<br/><span className="text-[10px] text-gray-400 font-normal">Internal Worker</span></td>
              <td className="px-6 py-4"><span className="text-red-600 font-bold flex items-center gap-1"><ShieldAlert size={14}/> SYSTEM_PANIC</span></td>
              <td className="px-6 py-4">B2BAdmin Sync</td>
              <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800"><FileJson size={16}/></button></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">2026-05-03 09:05:44</td>
              <td className="px-6 py-4 text-blue-600 font-bold">sale1@jongtour.com<br/><span className="text-[10px] text-gray-400 font-normal">172.16.0.5</span></td>
              <td className="px-6 py-4"><span className="text-emerald-600 font-bold">GENERATE_LINK</span></td>
              <td className="px-6 py-4">CRM / Booking</td>
              <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-800"><FileJson size={16}/></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
