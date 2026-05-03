import { Target, TrendingUp, Users, PhoneCall, Calendar, ArrowUpRight } from 'lucide-react';

export default function SaleDashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">สวัสดีคุณ Sale, ยินดีต้อนรับกลับ</h1>
          <p className="text-slate-500 text-sm">นี่คือภาพรวมยอดขายและงานของคุณประจำวันนี้</p>
        </div>
        <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg">
          Oct 2026
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="ยอดขายเดือนนี้" value="฿845,000" trend="+12%" icon={<TrendingUp size={20} />} color="emerald" />
        <StatCard title="Leads ใหม่" value="124" trend="+5%" icon={<Users size={20} />} color="indigo" />
        <StatCard title="Conversion Rate" value="18.5%" trend="-2%" icon={<Target size={20} />} color="orange" />
        <StatCard title="สายที่โทรสำเร็จ" value="45" trend="+15%" icon={<PhoneCall size={20} />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Tasks */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              งานวันนี้ (My Tasks)
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
          </div>
          <div className="p-0">
            {/* Task Item */}
            <div className="p-4 border-b border-slate-50 hover:bg-slate-50 flex gap-4 items-start cursor-pointer transition-colors">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">โทรติดตามคุณสมชายเรื่องทัวร์ญี่ปุ่น</p>
                <p className="text-xs text-slate-500 mt-1">Lead ID: #L-1024 • นัดโทร 10:00 น.</p>
              </div>
            </div>
            {/* Task Item */}
            <div className="p-4 border-b border-slate-50 hover:bg-slate-50 flex gap-4 items-start cursor-pointer transition-colors">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">ส่งใบเสนอราคาทัวร์เกาหลีแบบเหมากรุ๊ป</p>
                <p className="text-xs text-slate-500 mt-1">บริษัท ABC • ส่งก่อน 12:00 น.</p>
              </div>
            </div>
            {/* Task Item */}
            <div className="p-4 hover:bg-slate-50 flex gap-4 items-start cursor-pointer transition-colors">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">ติดต่อ Lead ใหม่จาก Facebook</p>
                <p className="text-xs text-slate-500 mt-1">คุณวิภาวรรณ ทักมาตอน 09:15 น.</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <a href="/sale/tasks" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">ดูงานทั้งหมด</a>
          </div>
        </div>

        {/* Right Column - Recent Pipeline Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">ความเคลื่อนไหวล่าสุดใน Pipeline</h2>
            <a href="/sale/leads" className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800">ดูบอร์ด <ArrowUpRight size={14}/></a>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">ชื่อลูกค้า</th>
                  <th className="px-4 py-3 font-medium">สนใจโปรแกรม</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium text-right">คาดการณ์ยอด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">คุณอภิชัย</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">ยุโรปตะวันออก 8 วัน</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Quoted</span></td>
                  <td className="px-4 py-3 font-mono text-right font-medium">฿125,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">คุณเจนจิรา (Line)</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">ฮอกไกโด สกี</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Won / Paid</span></td>
                  <td className="px-4 py-3 font-mono text-right font-medium text-emerald-600">฿89,800</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">คุณธนาธร (Info form)</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">ยังไม่ระบุ</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">New Lead</span></td>
                  <td className="px-4 py-3 font-mono text-right font-medium text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: 'emerald' | 'indigo' | 'orange' | 'blue' }) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    orange: 'text-orange-600 bg-orange-100',
    blue: 'text-blue-600 bg-blue-100',
  };
  
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className={`text-xs font-bold mt-1 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{trend} จากเดือนก่อน</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}
