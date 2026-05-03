import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Wallet, TrendingUp, TrendingDown, Receipt, AlertCircle, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser?.agent) redirect('/b2b');
  const agent = dbUser.agent;

  // Calculate unpaid bookings (outstanding balance)
  const { data: unpaidBookingsData } = await supabase
    .from('bookings')
    .select(`
      *,
      departure:departures(*, tour:tours(*))
    `)
    .eq('agentId', agent.id)
    .in('status', ['PENDING', 'DEPOSIT_PAID'])
    .order('createdAt', { ascending: false });

  const unpaidBookings = unpaidBookingsData || [];

  const outstandingBalance = unpaidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const availableCredit = agent.creditLimit - outstandingBalance;

  return (
    <div className="space-y-6">
      <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">วงเงินเครดิต และบัญชี (Finance & Billing)</h2>
        <p className="text-sm text-gray-500 mt-1">ตรวจสอบวงเงินเครดิตคงเหลือและยอดค้างชำระของ {agent.companyName}</p>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <Wallet className="w-40 h-40" />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">{agent.tier} TIER</span>
          </div>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider relative z-10">วงเงินเครดิตทั้งหมด (Total Credit Limit)</p>
          <h3 className="text-4xl font-black mt-2 relative z-10">฿{agent.creditLimit?.toLocaleString() || 0}</h3>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10">วงเงินคงเหลือ (Available Credit)</p>
          <h3 className="text-4xl font-black text-gray-800 mt-2 relative z-10">
            ฿{availableCredit > 0 ? availableCredit.toLocaleString() : 0}
          </h3>
          {availableCredit <= 0 && (
             <p className="text-xs text-red-500 mt-3 font-bold flex items-center gap-1.5 bg-red-50 w-max px-2 py-1 rounded-md">
               <AlertCircle size={14} /> วงเงินเต็ม กรุณาชำระยอดค้าง
             </p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
            <TrendingDown className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <Receipt className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10">ยอดค้างชำระ (Outstanding Balance)</p>
          <h3 className="text-4xl font-black text-amber-600 mt-2 relative z-10">฿{outstandingBalance.toLocaleString()}</h3>
        </div>
      </div>

      {/* Unpaid Bookings Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" /> รายการที่รอชำระเงิน (Unpaid Bookings)
          </h3>
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">{unpaidBookings.length} รายการ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">โปรแกรมทัวร์</th>
                <th className="px-6 py-4">วันที่ทำรายการ</th>
                <th className="px-6 py-4 text-right">ยอดค้างชำระ</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {unpaidBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <p className="font-bold text-gray-800 text-lg">ไม่มียอดค้างชำระ</p>
                    <p className="text-sm mt-1 font-medium">ยอดเยี่ยม! คุณไม่มีรายการค้างชำระในขณะนี้</p>
                  </td>
                </tr>
              ) : (
                unpaidBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 font-mono tracking-wide">{b.bookingRef || b.id.substring(0,8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 truncate max-w-xs">{b.departure?.tour?.tourName || "ไม่ระบุทัวร์"}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {b.departure?.startDate ? new Date(b.departure.startDate).toLocaleDateString('th-TH') : "-"} - {b.departure?.endDate ? new Date(b.departure.endDate).toLocaleDateString('th-TH') : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                      {new Date(b.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 font-black text-amber-600 text-right text-lg">
                      ฿{b.totalPrice?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        WAITING PAYMENT
                      </span>
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
