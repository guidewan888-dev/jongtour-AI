import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Receipt, Search, Filter, Download, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function B2BBookingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser || !dbUser.agent) return null;
  const agent = dbUser.agent;

  let bookings: any[] = [];

  const { data } = await supabase
    .from('bookings')
    .select(`
      *,
      departure:departures(*, tour:tours(*)),
      customer:customers(*)
    `)
    .eq('agentId', agent.id)
    .order('createdAt', { ascending: false });

  bookings = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-500" />
            ระบบจัดการการจอง (Bookings)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            รายการจองทั้งหมดที่เกิดขึ้นผ่านหน้าร้านของคุณ ({agent.companyName})
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> คัดกรอง
          </button>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาตามรหัสการจอง, ชื่อลูกค้า, หรือปลายทาง..." 
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white">
            <option value="">สถานะทั้งหมด</option>
            <option value="PENDING">รอชำระเงิน</option>
            <option value="DEPOSIT_PAID">มัดจำแล้ว</option>
            <option value="FULL_PAID">ชำระเต็มแล้ว</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">รหัสการจอง (Booking ID)</th>
                <th className="px-6 py-4">ลูกค้า (Lead Name)</th>
                <th className="px-6 py-4">โปรแกรมทัวร์</th>
                <th className="px-6 py-4">วันเดินทาง</th>
                <th className="px-6 py-4">ยอดรวม</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-bold text-gray-600">ยังไม่มีรายการจอง</p>
                    <p className="text-sm mt-1 font-medium text-gray-400">เมื่อมีลูกค้ากดจองทัวร์ ข้อมูลจะมาปรากฏที่นี่</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  let statusColor = "bg-gray-100 text-gray-700";
                  let statusText = "รอยืนยัน";
                  if (b.status === 'CONFIRMED' || b.status === 'FULL_PAID') { statusColor = "bg-emerald-100 text-emerald-700"; statusText = "ชำระเต็มแล้ว"; }
                  else if (b.status === 'PENDING') { statusColor = "bg-amber-100 text-amber-700"; statusText = "รอชำระเงิน"; }
                  else if (b.status === 'CANCELLED') { statusColor = "bg-red-100 text-red-700"; statusText = "ยกเลิก"; }
                  else if (b.status === 'DEPOSIT_PAID') { statusColor = "bg-blue-100 text-blue-700"; statusText = "ชำระมัดจำแล้ว"; }

                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100">
                          {b.bookingRef || b.id.substring(0,8).toUpperCase()}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                          {new Date(b.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{b.customer?.firstName} {b.customer?.lastName}</div>
                        <div className="text-xs font-medium text-gray-500">{b.customer?.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 line-clamp-1">{b.departure?.tour?.tourName || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800 font-bold">
                          {b.departure?.startDate ? new Date(b.departure.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          ถึง {b.departure?.endDate ? new Date(b.departure.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-gray-900">฿{b.totalPrice?.toLocaleString() || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-flex items-center justify-center">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
