import { Plane, CalendarDays, RefreshCw, Flame } from 'lucide-react';
import Link from 'next/link';

export default function TourAdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tour Management Dashboard</h1>
        <p className="text-slate-400">ภาพรวมระบบจัดการโปรแกรมทัวร์และสถานะการดึงข้อมูลจาก API</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">โปรแกรมทัวร์ที่เปิดขาย (Active)</h3>
          <p className="text-3xl font-bold text-white">3,245</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">รอบเดินทางทั้งหมด (พีเรียด)</h3>
          <p className="text-3xl font-bold text-white">12,500</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">ทัวร์ไฟไหม้ (ลดราคาพิเศษ)</h3>
          <p className="text-3xl font-bold text-rose-400">84</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Wholesale Sync ครั้งล่าสุด</h3>
          <p className="text-lg font-bold text-emerald-400 truncate">15 นาทีที่แล้ว</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">เมนูลัด (Quick Actions)</h3>
          <div className="space-y-4">
            <Link href="/admin/sync" className="flex items-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mr-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">ดึงข้อมูลทัวร์ล่าสุด (Manual Sync)</h4>
                <p className="text-sm text-slate-400">อัปเดตข้อมูลและราคาจากระบบ Zego ทันที</p>
              </div>
            </Link>
            <Link href="/admin/fire-sale" className="flex items-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-rose-500 transition-colors">
              <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center mr-4">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">จัดการทัวร์ไฟไหม้</h4>
                <p className="text-sm text-slate-400">ตั้งค่าส่วนลดพิเศษสำหรับทัวร์ใกล้เดินทาง</p>
              </div>
            </Link>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">บันทึกระบบ (System Logs)</h3>
            <span className="text-sm text-blue-400 cursor-pointer hover:underline">ดูทั้งหมด</span>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm text-white">Zego Sync Completed: Added 45 new tours</p>
                <p className="text-xs text-slate-500">วันนี้ 10:15 น.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm text-white">Price Update: JP-001 price changed to 29,900</p>
                <p className="text-xs text-slate-500">วันนี้ 09:30 น.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm text-white">Fire Sale Alert: 5 tours marked as Fire Sale</p>
                <p className="text-xs text-slate-500">เมื่อวาน 18:00 น.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
