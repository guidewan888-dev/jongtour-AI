import Link from "next/link";
import { Search, Filter, Clock, Calendar, FileText, Receipt, PlaneTakeoff, ExternalLink, Globe, Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const activeTab = searchParams.tab || "all";
  const searchQuery = searchParams.q || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Fetch real data from Supabase
  let query = supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(firstName, lastName),
      tour:tours(tourName),
      departure:departures(startDate)
    `)
    .order("createdAt", { ascending: false });

  if (activeTab === "pending") {
    query = query.in("status", ["PENDING", "AWAITING_CONFIRMATION"]);
  } else if (activeTab === "processing") {
    query = query.in("status", ["MISSING_DOCS", "FULL_PAID", "AWAITING_APPOINTMENT"]);
  } else if (activeTab === "done") {
    query = query.in("status", ["READY_TO_TRAVEL", "COMPLETED", "CANCELLED"]);
  }

  const { data: bookingsRaw, error } = await query;

  // Manual search filter
  let bookings = bookingsRaw || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    bookings = bookings.filter(b => 
      b.bookingRef?.toLowerCase().includes(q) || 
      (b.customer?.firstName + ' ' + b.customer?.lastName).toLowerCase().includes(q) ||
      b.tour?.tourName?.toLowerCase().includes(q)
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">รอชำระเงิน</span>;
      case 'AWAITING_CONFIRMATION': return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">รอตรวจสลิป</span>;
      case 'MISSING_DOCS': return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">รอเอกสาร</span>;
      case 'FULL_PAID': return <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">ชำระครบแล้ว</span>;
      case 'CONFIRMED': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200">ยืนยันแล้ว</span>;
      case 'READY_TO_TRAVEL': return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">พร้อมเดินทาง</span>;
      case 'COMPLETED': return <span className="bg-slate-50 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">เดินทางแล้ว</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 line-through">ยกเลิก</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">จัดการการจอง (Bookings)</h2>
          <p className="text-gray-500">ระบบจัดการออเดอร์และการจองทัวร์ทั้งหมดของลูกค้า (Real Database)</p>
        </div>
        <Link href="/admin/bookings/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg shadow-gray-900/20 inline-block">
          + สร้างการจองใหม่ (Manual)
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
            <Link href="?tab=all" scroll={false} className={`flex-1 text-center md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>ทั้งหมด</Link>
            <Link href="?tab=pending" scroll={false} className={`flex-1 text-center md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>รอชำระเงิน</Link>
            <Link href="?tab=processing" scroll={false} className={`flex-1 text-center md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'processing' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>กำลังดำเนินการ</Link>
            <Link href="?tab=done" scroll={false} className={`flex-1 text-center md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'done' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>สำเร็จแล้ว</Link>
          </div>

          <form className="flex gap-2 w-full md:w-auto">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" name="q" defaultValue={searchQuery} placeholder="ค้นหารหัสจอง, ชื่อลูกค้า..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">ค้นหา</button>
          </form>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold border-b border-gray-100">รหัสจอง / วันที่จอง</th>
                <th className="p-4 font-bold border-b border-gray-100">ลูกค้า</th>
                <th className="p-4 font-bold border-b border-gray-100">ทัวร์ / วันเดินทาง</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">ยอดชำระ</th>
                <th className="p-4 font-bold border-b border-gray-100">สถานะ</th>
                <th className="p-4 font-bold border-b border-gray-100 text-center w-36">จัดการโฮลเซล</th>
                <th className="p-4 font-bold border-b border-gray-100 text-center w-40">ดูรายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    ไม่พบข้อมูลการจองในระบบ
                  </td>
                </tr>
              ) : bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-gray-900 font-bold">{b.bookingRef}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(b.createdAt).toLocaleDateString('th-TH')}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{b.customer?.firstName} {b.customer?.lastName}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-700 truncate max-w-[250px]" title={b.tour?.tourName}>{b.tour?.tourName || "ไม่ระบุ"}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {b.departure?.startDate ? new Date(b.departure.startDate).toLocaleDateString('th-TH') : "N/A"}</p>
                  </td>
                  <td className="p-4 font-bold text-gray-900 text-right">฿{b.totalPrice?.toLocaleString() || 0}</td>
                  <td className="p-4">{getStatusBadge(b.status)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-center w-full">
                      <span className="flex items-center justify-center gap-1 w-full bg-emerald-50 text-emerald-600 text-[10px] font-bold py-1.5 px-2 rounded border border-emerald-100">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> จองเรียบร้อย
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/admin/bookings/${b.id}`} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-200 transition-colors">
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <p>แสดง {bookings.length} รายการ</p>
        </div>
      </div>
    </div>
  );
}
