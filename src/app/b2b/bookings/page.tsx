import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Receipt, Search, Filter, Download, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function B2BBookingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true }
  });

  if (!dbUser || !dbUser.company) return null;
  const company = dbUser.company;

  let bookings: any[] = [];

  if (company.type === 'SUPPLIER') {
    const supplierTours = await prisma.tour.findMany({
      where: { supplierId: company.id },
      select: { id: true }
    });
    const tourIds = supplierTours.map(t => t.id);
    
    bookings = await prisma.booking.findMany({
      where: { departure: { tourId: { in: tourIds } } },
      orderBy: { createdAt: 'desc' },
      include: {
        departure: { include: { tour: true } },
        agent: true,
        user: true
      }
    });
  } else {
    bookings = await prisma.booking.findMany({
      where: { agentId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        departure: { include: { tour: true } },
        user: true
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-500" />
            ระบบจัดการการจอง (Bookings)
          </h2>
          <p className="text-sm text-slate-500">
            {company.type === 'SUPPLIER' 
              ? 'รายการจองทั้งหมดจากทัวร์ของคุณ' 
              : 'รายการจองทั้งหมดที่เกิดขึ้นผ่านหน้าร้านของคุณ'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> คัดกรอง
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาตามรหัสการจอง, ชื่อลูกค้า, หรือปลายทาง..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700">
            <option value="">สถานะทั้งหมด</option>
            <option value="PENDING">รอชำระเงิน</option>
            <option value="DEPOSIT_PAID">มัดจำแล้ว</option>
            <option value="FULL_PAID">ชำระเต็มแล้ว</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-600">ยังไม่มีรายการจอง</p>
                    <p className="text-sm mt-1">เมื่อมีลูกค้ากดจองทัวร์ ข้อมูลจะมาปรากฏที่นี่</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  let statusColor = "bg-slate-100 text-slate-700";
                  let statusText = "รอยืนยัน";
                  if (b.status === 'CONFIRMED' || b.status === 'FULL_PAID') { statusColor = "bg-emerald-100 text-emerald-700"; statusText = "ชำระเต็มแล้ว"; }
                  else if (b.status === 'PENDING') { statusColor = "bg-amber-100 text-amber-700"; statusText = "รอชำระเงิน"; }
                  else if (b.status === 'CANCELLED') { statusColor = "bg-red-100 text-red-700"; statusText = "ยกเลิก"; }
                  else if (b.status === 'DEPOSIT_PAID') { statusColor = "bg-blue-100 text-blue-700"; statusText = "ชำระมัดจำแล้ว"; }

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                          {b.id.substring(0,8).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(b.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{b.contactName || b.user.name}</div>
                        <div className="text-xs text-slate-500">{b.contactPhone}</div>
                        <div className="text-xs text-slate-500 mt-1">จำนวน {b.pax} ท่าน</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 line-clamp-1">{b.departure?.tour?.title}</div>
                        {company.type === 'SUPPLIER' && b.agent && (
                          <div className="text-xs text-indigo-600 mt-1 font-medium bg-indigo-50 px-2 py-0.5 rounded inline-block">
                            Agent: {b.agent.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">
                          {new Date(b.departure?.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500">
                          ถึง {new Date(b.departure?.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">฿{b.totalPrice.toLocaleString()}</div>
                        {b.depositAmount && (
                          <div className="text-xs text-slate-500 mt-1">
                            มัดจำ: ฿{b.depositAmount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center justify-center">
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
