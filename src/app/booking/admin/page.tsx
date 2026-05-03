"use client";
import { DollarSign, ShoppingCart, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function BookingDashboardPage() {
  const stats = [
    { title: 'รายรับวันนี้', value: '฿125,000', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'ออเดอร์ใหม่', value: '45', icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'ลูกค้าใหม่', value: '12', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ภาพรวมระบบ (Booking Dashboard)</h1>
        <p className="text-slate-400">สรุปข้อมูลการจอง รายได้ และสถานะการทำงานประจำวัน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            ออเดอร์ที่ต้องดำเนินการด่วน (Pending Actions)
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-bold text-white">ตรวจสลิปโอนเงิน (JT-2605-001)</p>
                  <p className="text-xs text-slate-500">รอตรวจตั้งแต่ 10 นาทีที่แล้ว</p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-medium">ดูสลิป</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-white">รอ Wholesale ยืนยัน (JT-2605-002)</p>
                  <p className="text-xs text-slate-500">ทัวร์เกาหลี Zego-102</p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-medium">ติดตามสถานะ</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            การแจ้งเตือนระบบ (System Alerts)
          </h3>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-sm font-bold text-rose-400 mb-1">Letgo API Connection Error</p>
            <p className="text-xs text-slate-400">ระบบไม่สามารถดึงข้อมูลรอบเดินทางจาก Letgo ได้เมื่อ 5 นาทีที่แล้ว</p>
          </div>
        </div>
      </div>
    </div>
  );
}
