import { FileText, Plus, Search, Calendar, FileDown, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function QuotationsPage() {
  const quotations = [
    { id: '1', ref: 'QT-202610-0012', customer: 'คุณวิภาวรรณ', tourName: 'Japan Alpine Route 6D4N', date: '15-20 Dec 2026', amount: 91800, status: 'Sent', pax: 2 },
    { id: '2', ref: 'QT-202610-0011', customer: 'บจก. เอบีซี', tourName: 'Classic Europe 8D5N', date: '22-29 Nov 2026', amount: 445000, status: 'Approved', pax: 5 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">ใบเสนอราคา (Quotations)</h2>
          <p className="text-sm text-slate-500">จัดการใบเสนอราคาที่คุณสร้าง และติดตามสถานะ</p>
        </div>
        <Link href="/sale/tours" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          สร้างใบเสนอราคาใหม่
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อลูกค้า, หรือเลขที่ใบเสนอราคา..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">เลขที่อ้างอิง (Ref)</th>
                <th className="px-6 py-4">ลูกค้า (Customer)</th>
                <th className="px-6 py-4">โปรแกรมทัวร์</th>
                <th className="px-6 py-4 text-right">ยอดรวมสุทธิ</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{q.ref}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{q.customer}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.pax} ท่าน</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700 max-w-xs truncate">{q.tourName}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> เดินทาง: {q.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-700 text-right">
                    ฿{q.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      q.status === 'Sent' ? 'bg-amber-100 text-amber-700' :
                      q.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {q.status === 'Approved' ? (
                        <button className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors flex items-center gap-1" title="Convert to Booking">
                          <CheckCircle2 size={16} /> 
                          <span className="text-xs font-bold">สร้าง Booking</span>
                        </button>
                      ) : (
                        <button className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors" title="Download PDF">
                          <FileDown size={18} />
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
