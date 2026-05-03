import Link from "next/link";
import { PlaneTakeoff, Users, Bus, FileCheck, Ticket, Search, Filter } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminOperationsPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const activeTab = searchParams.tab || "departure-list";
  const searchQuery = searchParams.q || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const tabs = [
    { id: "departure-list", name: "Departure List", icon: PlaneTakeoff },
    { id: "passenger-list", name: "Passenger List", icon: Users },
    { id: "pickup-list", name: "Pickup List", icon: Bus },
    { id: "supplier-confirmation", name: "Supplier Confirmation", icon: FileCheck },
    { id: "voucher-control", name: "Voucher Control", icon: Ticket },
  ];

  let activeData: any = null;

  if (activeTab === "departure-list") {
    // ดึงรอบเดินทางที่มีคนจอง
    const { data: departuresData } = await supabase
      .from('departures')
      .select(`
        *,
        tour:tours(tourName, tourCode),
        bookings:bookings(id, status, customerId)
      `)
      .gte('startDate', new Date().toISOString())
      .order('startDate', { ascending: true })
      .limit(50);
    
    activeData = departuresData;
  } else if (activeTab === "passenger-list") {
    // ดึงผู้โดยสารจากการจองที่จ่ายเงินแล้วหรือยืนยันแล้ว
    const { data: travelersData } = await supabase
      .from('booking_travelers')
      .select(`
        *,
        booking:bookings(
          bookingRef, 
          status,
          departure:departures(startDate, tour:tours(tourName))
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(100);
      
    // กรองเอาเฉพาะรายการที่ status การจองตรงตามต้องการ (ในโค้ดจริงอาจต้อง Query ฝั่ง server)
    activeData = travelersData?.filter(t => 
      t.booking?.status === 'FULL_PAID' || 
      t.booking?.status === 'READY_TO_TRAVEL' || 
      t.booking?.status === 'CONFIRMED'
    );
  }

  // Handle Search Filtering
  if (searchQuery && activeData) {
    const q = searchQuery.toLowerCase();
    if (activeTab === "departure-list") {
      activeData = activeData.filter((d: any) => 
        d.tour?.tourName?.toLowerCase().includes(q) || 
        d.tour?.tourCode?.toLowerCase().includes(q)
      );
    } else if (activeTab === "passenger-list") {
      activeData = activeData.filter((t: any) => 
        t.firstName?.toLowerCase().includes(q) || 
        t.lastName?.toLowerCase().includes(q) ||
        t.booking?.bookingRef?.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ฝ่ายปฏิบัติการ (Operations)</h2>
          <p className="text-gray-500">จัดการทัวร์ออกเดินทาง ผู้โดยสาร รถรับส่ง และการยืนยันกับโฮลเซลล์</p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg shadow-gray-900/20">
          Export {tabs.find(t => t.id === activeTab)?.name} (Excel)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                  ${isActive ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Filters */}
        <form className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <input type="hidden" name="tab" value={activeTab} />
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="ค้นหาชื่อกรุ๊ปทัวร์, ชื่อผู้โดยสาร..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 bg-white" 
            />
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
            ค้นหา
          </button>
        </form>

        {/* Tab Content Area */}
        {activeTab === "departure-list" ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold border-b border-gray-100">วันเดินทาง</th>
                  <th className="p-4 font-bold border-b border-gray-100">รหัสทัวร์ / ชื่อทัวร์</th>
                  <th className="p-4 font-bold border-b border-gray-100">จำนวนที่นั่งรวม</th>
                  <th className="p-4 font-bold border-b border-gray-100">สถานะออกเดินทาง</th>
                  <th className="p-4 font-bold border-b border-gray-100 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activeData && activeData.length > 0 ? activeData.map((d: any) => {
                  // Count total bookings that are paid/confirmed
                  const validBookings = d.bookings?.filter((b: any) => ['FULL_PAID', 'READY_TO_TRAVEL', 'CONFIRMED'].includes(b.status)) || [];
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">
                        {d.startDate ? new Date(d.startDate).toLocaleDateString('th-TH') : "N/A"}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-indigo-600">{d.tour?.tourCode}</p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{d.tour?.tourName}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        {validBookings.length} / {d.totalSeats || 0}
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          {d.status || 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-200">ดูรายชื่อคน</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบรอบเดินทางในช่วงเวลานี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "passenger-list" ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold border-b border-gray-100">ชื่อ - นามสกุล</th>
                  <th className="p-4 font-bold border-b border-gray-100">ประเภท (Pax)</th>
                  <th className="p-4 font-bold border-b border-gray-100">รหัสจอง</th>
                  <th className="p-4 font-bold border-b border-gray-100">ทัวร์ / วันเดินทาง</th>
                  <th className="p-4 font-bold border-b border-gray-100">เลข Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activeData && activeData.length > 0 ? activeData.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">
                      {t.title || ""} {t.firstName} {t.lastName}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{t.paxType}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-600">
                      {t.booking?.bookingRef}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-700 text-xs truncate max-w-[200px]">{t.booking?.departure?.tour?.tourName}</p>
                      <p className="text-gray-500 text-xs">{t.booking?.departure?.startDate ? new Date(t.booking.departure.startDate).toLocaleDateString('th-TH') : ""}</p>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {t.passportNo || <span className="text-red-400">ยังไม่ระบุ</span>}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบรายชื่อผู้โดยสาร</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 h-[400px]">
            {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              โมดูล: {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <p className="max-w-md text-sm">
              ระบบกำลังเตรียมดึงข้อมูล {tabs.find(t => t.id === activeTab)?.name} จากฐานข้อมูลการจองที่ชำระเงินเรียบร้อยแล้ว
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
