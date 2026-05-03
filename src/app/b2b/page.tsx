import { Package, Users, Receipt, TrendingUp, FileText, CalendarDays, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function B2BDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  let company = null;
  let recentBookings: any[] = [];
  let recentQuotations: any[] = [];
  let totalBookings = 0;
  let outstandingBalance = 0;
  
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('*, agent:agents(*)')
      .eq('email', user.email || '')
      .single();
      
    dbUser = userData;
    
    if (dbUser?.agent) {
      company = dbUser.agent;
      
      // Calculate total bookings
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('agentId', company.id);
      
      totalBookings = bookingsCount || 0;

      // Calculate Outstanding Balance (Bookings that are PENDING or DEPOSIT_PAID)
      const { data: unpaidBookings } = await supabase
        .from('bookings')
        .select('totalPrice')
        .eq('agentId', company.id)
        .in('status', ['PENDING', 'DEPOSIT_PAID']);
        
      outstandingBalance = unpaidBookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
      
      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          departure:departures(startDate, tour:tours(tourName))
        `)
        .eq('agentId', company.id)
        .order('createdAt', { ascending: false })
        .limit(5);
        
      recentBookings = bookingsData || [];

      // Fetch recent quotations
      const { data: quotationsData } = await supabase
        .from('quotations')
        .select(`
          *,
          departure:departures(startDate, tour:tours(tourName))
        `)
        .eq('agentId', company.id)
        .order('createdAt', { ascending: false })
        .limit(5);
        
      recentQuotations = quotationsData || [];
    }
  }

  const stats = [
    { label: "ยอดจองทั้งหมด (Bookings)", value: totalBookings.toString(), change: "Success", icon: <Receipt className="text-blue-500" /> },
    { label: "ยอดค้างชำระ (Outstanding)", value: `฿${outstandingBalance.toLocaleString()}`, change: "Unpaid", icon: <FileText className="text-amber-500" /> },
    { label: "วงเงินเครดิต (Credit Limit)", value: `฿${(company?.creditLimit || 0).toLocaleString()}`, change: "Available", icon: <TrendingUp className="text-emerald-500" /> },
    { label: "ส่วนลด (Commission Rate)", value: `${company?.discountRate || 0}%`, change: `Tier: ${company?.tier || "STANDARD"}`, icon: <Package className="text-indigo-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">Welcome back, {dbUser?.email?.split('@')[0] || "Agent"}</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">ยินดีต้อนรับสู่ระบบเอเย่นต์ของ {company?.companyName || 'Jongtour'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/b2b/tours" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
            <Package size={16} /> ค้นหาทัวร์ & จองเลย
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
              {stat.icon}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">{stat.label}</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black text-gray-800 tracking-tight">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-gray-400 mt-2">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Receipt size={18} className="text-blue-500" />
              รายการจองล่าสุด
            </h3>
            <Link href="/b2b/bookings" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              ดูทั้งหมด <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto">
            {recentBookings.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentBookings.map((b) => (
                  <li key={b.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-bold text-gray-800">{b.bookingRef}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'FULL_PAID' || b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            b.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-1 truncate max-w-[280px]">
                          {b.departure?.tour?.tourName || "ไม่ระบุทัวร์"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <CalendarDays size={12} /> เดินทาง: {b.departure?.startDate ? new Date(b.departure.startDate).toLocaleDateString('th-TH') : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">฿{b.totalPrice?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(b.createdAt).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">ยังไม่มีรายการจอง</p>
                <Link href="/b2b/tours" className="text-blue-600 text-xs font-bold mt-2 inline-block">เริ่มค้นหาและจองทัวร์</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-amber-500" />
              ใบเสนอราคาล่าสุด
            </h3>
            <Link href="/b2b/quotations" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              ดูทั้งหมด <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0 overflow-y-auto">
            {recentQuotations.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentQuotations.map((q) => (
                  <li key={q.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-bold text-gray-800">{q.quotationRef}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.status === 'BOOKED' ? 'bg-green-100 text-green-700' :
                            q.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-600 mt-1 truncate max-w-[280px]">
                          {q.customerName} - {q.departure?.tour?.tourName || "ไม่ระบุทัวร์"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ผู้ใหญ่ {q.paxAdult} / เด็ก {q.paxChild}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">฿{q.totalSellingPrice?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(q.createdAt).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">ยังไม่มีใบเสนอราคา</p>
                <Link href="/b2b/tours" className="text-amber-600 text-xs font-bold mt-2 inline-block">ค้นหาทัวร์เพื่อสร้างใบเสนอราคา</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
