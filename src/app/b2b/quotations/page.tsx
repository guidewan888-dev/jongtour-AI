import { FileText, Plus, Search, Calendar, FileDown } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let quotations: any[] = [];
  
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email || "" },
      include: { agent: true }
    });
    
    if (dbUser?.agent) {
      quotations = await prisma.quotation.findMany({
        where: { agentId: dbUser.agent.id },
        orderBy: { createdAt: 'desc' },
        include: {
          departure: { include: { tour: true } }
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quotations</h2>
          <p className="text-sm text-slate-500">จัดการใบเสนอราคาเพื่อส่งให้ลูกค้าของคุณ</p>
        </div>
        <Link href="/b2b/tours" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
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
              placeholder="ค้นหาชื่อลูกค้า หรือเลขที่ใบเสนอราคา..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">เลขที่ใบเสนอราคา</th>
              <th className="px-6 py-4">ลูกค้า</th>
              <th className="px-6 py-4">โปรแกรมทัวร์</th>
              <th className="px-6 py-4">ยอดขาย (Selling)</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">ยังไม่มีใบเสนอราคา</p>
                  <p className="text-slate-400 text-xs mt-1">คุณสามารถสร้างใบเสนอราคาได้จากหน้าค้นหาทัวร์</p>
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{q.quotationRef}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{q.customerName}</p>
                    {q.customerEmail && <p className="text-xs text-slate-500">{q.customerEmail}</p>}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                    {q.departure.tour.tourName}
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {new Date(q.departure.startDate).toLocaleDateString('th-TH')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ฿{q.totalSellingPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      q.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                      q.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors" title="Download PDF">
                      <FileDown size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
