import { Search, Plus, Filter, MoreHorizontal, User, Mail, Phone, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CustomersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ลูกค้า (Customers)</h1>
          <p className="text-sm text-slate-500">ฐานข้อมูลลูกค้าทั้งหมดที่เคยติดต่อและจองทัวร์กับเรา</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
          <Plus size={16} />
          เพิ่มลูกค้าใหม่
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, เบอร์โทร, หรืออีเมล..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> ตัวกรอง (Filter)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ข้อมูลลูกค้า</th>
                <th className="px-6 py-4">การติดต่อ</th>
                <th className="px-6 py-4">ประวัติการซื้อ (LTV)</th>
                <th className="px-6 py-4">สถานะ (Tag)</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      SJ
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">คุณสมชาย ใจดี</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <CalendarDays size={12}/> เป็นลูกค้าเมื่อ 2 ปีที่แล้ว
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs"><Phone size={14} className="text-slate-400"/> 089-123-4567</span>
                    <span className="flex items-center gap-2 text-xs"><Mail size={14} className="text-slate-400"/> somchai@email.com</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">฿350,000</p>
                  <p className="text-xs text-slate-500">จองไปแล้ว 3 ทริป</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    VIP
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 p-2">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      JS
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">คุณเจนจิรา สุขสวัสดิ์</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <CalendarDays size={12}/> เป็นลูกค้าเมื่อ 1 เดือนที่แล้ว
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs"><Phone size={14} className="text-slate-400"/> 081-987-6543</span>
                    <span className="flex items-center gap-2 text-xs text-emerald-600 font-medium">Line: @jenjira99</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">฿89,800</p>
                  <p className="text-xs text-slate-500">จองไปแล้ว 1 ทริป</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Regular
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 p-2">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
