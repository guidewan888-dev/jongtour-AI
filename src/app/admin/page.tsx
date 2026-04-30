import { Ticket, DollarSign, RefreshCcw, Users, Link as LinkIcon, AlertTriangle, FileWarning } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const now = new Date();

  // Fetch live bookings
  const liveBookings = await prisma.booking.findMany({
    include: {
      user: true,
      departure: {
        include: { tour: true }
      },
      travelers: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const activeBookings = liveBookings
    .map((b) => {
      let statusText = "รอตรวจสอบ";
      let color = "text-gray-600 bg-gray-100";
      let actionText = "ดูรายละเอียด";
      let actionUrl = `/admin/bookings/${b.id}`;
      let isPrimary = false;
      let warning = "";

      // Missing Documents Check
      const missingDocsCount = b.travelers.filter(t => !t.passportFileUrl || !t.visaFileUrl).length;

      switch(b.status) {
        case "PENDING":
          statusText = "รอชำระเงิน";
          actionText = "ติดตามลูกค้า";
          break;
        case "AWAITING_CONFIRMATION":
          statusText = "รอตรวจสลิป";
          color = "text-blue-600 bg-blue-50";
          actionText = "ตรวจสลิป";
          isPrimary = true;
          break;
        case "DEPOSIT_PAID":
          statusText = "จ่ายมัดจำแล้ว";
          color = "text-indigo-600 bg-indigo-50";
          if (missingDocsCount > 0) warning = `ขาดเอกสาร ${missingDocsCount} ท่าน`;
          break;
        case "FULL_PAID":
          statusText = missingDocsCount > 0 ? "รอเอกสารวีซ่า" : "รอเดินทาง";
          color = missingDocsCount > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50";
          actionText = missingDocsCount > 0 ? "ติดตามเอกสาร" : "จัดการโฮลเซลล์";
          actionUrl = missingDocsCount > 0 ? `/admin/bookings/${b.id}/follow-up` : `/admin/wholesale`;
          if (missingDocsCount > 0) warning = `ขาดพาสปอร์ต ${missingDocsCount} ท่าน`;
          break;
        case "CANCELLED":
          statusText = "ยกเลิกแล้ว";
          color = "text-red-600 bg-red-50";
          break;
      }

      return {
        id: b.id,
        customer: b.user?.name || b.user?.email || "Unknown",
        tour: b.departure.tour.title,
        amount: `${b.totalPrice.toLocaleString()} ฿`,
        statusText,
        color,
        actionUrl,
        actionText,
        isPrimary,
        warning
      };
    });

  const pendingCount = liveBookings.filter(b => b.status === 'AWAITING_CONFIRMATION').length;
  const newCustomersToday = liveBookings.filter(b => b.createdAt >= new Date(now.setHours(0,0,0,0))).length;
  const unpaidCount = liveBookings.filter(b => b.status === 'PENDING').length;
  const unpaidAmount = liveBookings.filter(b => b.status === 'PENDING').reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">ภาพรวมระบบ (Dashboard Overview)</h2>
        <p className="text-gray-500">สรุปข้อมูลการจองและสถานะการทำงานของระบบในวันนี้</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="การจองใหม่ (รอตรวจสอบ)" 
          value={pendingCount.toString()} 
          subtitle="สลิปที่รอแอดมินยืนยัน" 
          icon={Ticket} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="รอชำระเงิน" 
          value={unpaidCount.toString()} 
          subtitle={`มูลค่ารวมประมาณ ${unpaidAmount.toLocaleString()} บาท`} 
          icon={DollarSign} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="ลูกค้าใหม่วันนี้" 
          value={newCustomersToday.toString()} 
          subtitle="ยอดสมัคร/จองใหม่" 
          icon={Users} 
          color="bg-green-500" 
        />
        <StatCard 
          title="สถานะ API Sync ล่าสุด" 
          value="Success" 
          subtitle="ซิงค์ข้อมูลเมื่อ 15 นาทีที่แล้ว" 
          icon={RefreshCcw} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Recent Bookings & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Table: Bookings that need attention */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-800">รายการจองที่ต้องดำเนินการด่วน (Pending Actions)</h3>
              <p className="text-sm text-gray-500 mt-1">เรียงจากรายการจองล่าสุด (กรองที่เดินทางเสร็จแล้วออก)</p>
            </div>
            <button className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">ดูทั้งหมด</button>
          </div>
          
          {/* Scrollable Table Area */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold border-b border-gray-100">รหัสจอง</th>
                  <th className="p-4 font-bold border-b border-gray-100">แพ็กเกจทัวร์ / ลูกค้า</th>
                  <th className="p-4 font-bold border-b border-gray-100">สถานะ</th>
                  <th className="p-4 font-bold border-b border-gray-100 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeBookings.map((booking) => (
                  <BookingRow 
                    key={booking.id}
                    id={booking.id} 
                    customer={booking.customer} 
                    tour={booking.tour} 
                    amount={booking.amount} 
                    statusText={booking.statusText} 
                    color={booking.color}
                    actionUrl={booking.actionUrl}
                    actionText={booking.actionText}
                    isPrimary={booking.isPrimary}
                    warning={booking.warning}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs / Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[500px] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-gray-800 mb-6 sticky top-0 bg-white pb-2 border-b border-gray-50">ความเคลื่อนไหวล่าสุด (System Logs)</h3>
          <div className="space-y-6">
            <LogItem 
              time="10:45 น." 
              text="ระบบสร้าง Invoice อัตโนมัติและส่งอีเมลให้ลูกค้า (BK-240399) สำเร็จ" 
              type="success"
            />
            <LogItem 
              time="09:30 น." 
              text="แอดมิน (Super Admin) อนุมัติการชำระเงิน (BK-12345678)" 
              type="info"
            />
            <LogItem 
              time="08:15 น." 
              text="Zego API Sync พบทัวร์ใหม่ 5 รายการ และอัปเดตราคา 12 รายการ" 
              type="sync"
            />
            <LogItem 
              time="08:00 น." 
              text="Go365 API Sync สำเร็จ ไม่มีรายการเปลี่ยนแปลง" 
              type="sync"
            />
            <LogItem 
              time="เมื่อวาน 18:00 น." 
              text="ออกใบนัดหมายให้ลูกค้ากรุ๊ปทัวร์เกาหลี โซล (BK-240405) จำนวน 15 ท่านเรียบร้อย" 
              type="success"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-800 mb-1">{value}</h4>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function BookingRow({ id, customer, tour, amount, statusText, color, actionUrl, actionText, isPrimary, warning }: any) {
  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
      <td className="p-4 align-top">
        <p className="font-mono text-gray-800 font-bold">{id.replace('mock-', 'BK-')}</p>
        <p className="text-xs text-gray-400 mt-1">{amount}</p>
      </td>
      <td className="p-4 align-top">
        <p className="font-bold text-gray-700">{tour}</p>
        <p className="text-sm text-gray-500 mt-0.5">{customer}</p>
        {warning && (
          <div className="flex items-center gap-1.5 mt-2 bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-red-100 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warning}
          </div>
        )}
      </td>
      <td className="p-4 align-top">
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block mt-0.5 ${color}`}>
          {statusText}
        </span>
      </td>
      <td className="p-4 align-top text-right">
        <Link href={actionUrl}>
          <button className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm mt-0.5
            ${isPrimary 
              ? 'bg-[#5392f9] text-white hover:bg-blue-600 shadow-blue-500/30' 
              : statusText === "รอตรวจสลิป" || statusText === "รอออกใบนัดหมาย" || statusText === "รอเอกสารวีซ่า"
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-100 bg-white'
            }
          `}>
            {actionText}
          </button>
        </Link>
      </td>
    </tr>
  );
}

function LogItem({ time, text, type }: { time: string, text: string, type: string }) {
  const getDotColor = () => {
    if (type === 'success') return 'bg-green-500';
    if (type === 'sync') return 'bg-blue-500';
    return 'bg-gray-400';
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${getDotColor()}`}></div>
        <div className="w-px h-full bg-gray-100 mt-2"></div>
      </div>
      <div className="pb-4">
        <span className="text-xs font-bold text-gray-400">{time}</span>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
