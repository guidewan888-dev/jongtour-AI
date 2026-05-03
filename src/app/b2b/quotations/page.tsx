import { FileText, Plus, Search, Calendar, FileDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage({ searchParams }: { searchParams: { q?: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let quotations: any[] = [];
  
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*, agent:agents(*)')
      .eq('email', user.email || "")
      .single();
    
    if (dbUser?.agent) {
      let query = supabase
        .from('quotations')
        .select(`
          *,
          departure:departures(*, tour:tours(*))
        `)
        .eq('agentId', dbUser.agent.id)
        .order('createdAt', { ascending: false });

      if (searchParams.q) {
        query = query.or(`customerName.ilike.%${searchParams.q}%,quotationRef.ilike.%${searchParams.q}%`);
      }

      const { data } = await query;
      quotations = data || [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">Quotations</h2>
          <p className="text-sm text-gray-500">จัดการใบเสนอราคาเพื่อส่งให้ลูกค้าของคุณ</p>
        </div>
        <Link href="/b2b/tours" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          สร้างใบเสนอราคาใหม่
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="ค้นหาชื่อลูกค้า หรือเลขที่ใบเสนอราคา..." 
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
            ค้นหา
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">เลขที่ใบเสนอราคา</th>
                <th className="px-6 py-4">ลูกค้า</th>
                <th className="px-6 py-4">โปรแกรมทัวร์</th>
                <th className="px-6 py-4">ยอดขาย (Selling)</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold">ยังไม่มีใบเสนอราคา</p>
                    <p className="text-gray-400 text-xs mt-1 font-medium">คุณสามารถสร้างใบเสนอราคาได้จากหน้าค้นหาทัวร์</p>
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{q.quotationRef}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{q.customerName}</p>
                      {q.customerEmail && <p className="text-xs font-medium text-gray-500">{q.customerEmail}</p>}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-600">
                      {q.departure?.tour?.tourName || "ไม่ระบุโปรแกรม"}
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {q.departure?.startDate ? new Date(q.departure.startDate).toLocaleDateString('th-TH') : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      ฿{q.totalSellingPrice?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                        q.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                        q.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/b2b/quotations/${q.id}/pdf`} target="_blank" className="inline-block text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors shadow-sm" title="Download PDF">
                        <FileDown size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
