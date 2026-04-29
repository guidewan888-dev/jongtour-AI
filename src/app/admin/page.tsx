import { Ticket, DollarSign, RefreshCcw, Users } from "lucide-react";

export default function AdminDashboard() {
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
          value="12" 
          subtitle="เพิ่มขึ้น 3 รายการจากเมื่อวาน" 
          icon={Ticket} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="รอชำระเงิน" 
          value="5" 
          subtitle="มูลค่ารวมประมาณ 240,000 บาท" 
          icon={DollarSign} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="ลูกค้าใหม่วันนี้" 
          value="28" 
          subtitle="ยอดสมัครสมาชิกใหม่" 
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
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">รายการจองที่ต้องดำเนินการด่วน (Pending Actions)</h3>
            <button className="text-sm font-medium text-orange-500 hover:text-orange-600">ดูทั้งหมด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-sm text-gray-500">
                  <th className="p-4 font-medium">รหัสจอง</th>
                  <th className="p-4 font-medium">ลูกค้า</th>
                  <th className="p-4 font-medium">แพ็กเกจทัวร์</th>
                  <th className="p-4 font-medium">ยอดชำระ</th>
                  <th className="p-4 font-medium">สถานะ</th>
                  <th className="p-4 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <BookingRow 
                  id="BK-240401" 
                  customer="สมชาย ใจดี" 
                  tour="ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (5D4N)" 
                  amount="71,800 ฿" 
                  status="AWAITING_CONFIRMATION" 
                  statusText="รอตรวจสลิป" 
                  color="text-orange-600 bg-orange-50"
                />
                <BookingRow 
                  id="BK-240402" 
                  customer="วิภาวรรณ สุขสม" 
                  tour="ทัวร์ยุโรปตะวันออก (8D5N)" 
                  amount="111,800 ฿" 
                  status="AWAITING_CONFIRMATION" 
                  statusText="รอตรวจสลิป" 
                  color="text-orange-600 bg-orange-50"
                />
                <BookingRow 
                  id="BK-240403" 
                  customer="นพดล ทองแท้" 
                  tour="ทัวร์ไต้หวัน ไทเป (4D3N)" 
                  amount="31,800 ฿" 
                  status="PENDING" 
                  statusText="รอชำระเงิน" 
                  color="text-gray-600 bg-gray-100"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs / Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">ความเคลื่อนไหวล่าสุด (System Logs)</h3>
          <div className="space-y-6">
            <LogItem 
              time="10:45 น." 
              text="ระบบสร้าง Invoice อัตโนมัติและส่งอีเมลให้ลูกค้า (BK-240399) สำเร็จ" 
              type="success"
            />
            <LogItem 
              time="09:30 น." 
              text="แอดมิน (Super Admin) อนุมัติการชำระเงิน (BK-240399)" 
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

function BookingRow({ id, customer, tour, amount, status, statusText, color }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium text-gray-800">{id}</td>
      <td className="p-4 text-gray-600">{customer}</td>
      <td className="p-4 text-gray-600">{tour}</td>
      <td className="p-4 font-bold text-gray-800">{amount}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>
          {statusText}
        </span>
      </td>
      <td className="p-4">
        {status === "AWAITING_CONFIRMATION" ? (
          <button className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600">
            ตรวจสลิป
          </button>
        ) : (
          <button className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100">
            ดูรายละเอียด
          </button>
        )}
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
        <div className="w-px h-full bg-gray-200 mt-2"></div>
      </div>
      <div className="pb-4">
        <span className="text-xs font-bold text-gray-400">{time}</span>
        <p className="text-sm text-gray-600 mt-1 leading-snug">{text}</p>
      </div>
    </div>
  );
}
