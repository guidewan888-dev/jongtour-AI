import { Button } from '@/components/ui/Button';
import { RefreshCw, Database, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WholesaleSyncPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wholesale Sync</h1>
        <p className="text-slate-400">ควบคุมระบบดึงข้อมูลทัวร์จากคู่ค้า (Zego, Letgo, และอื่นๆ) ผ่าน API</p>
      </div>

      {/* Sync Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-slate-700/30">
            <Server className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-xl font-bold text-white">Zego API</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Status: Connected & Healthy</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">ซิงค์ครั้งล่าสุด</span>
                <span className="text-white">วันนี้, 10:15 น.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">อัปเดตทัวร์</span>
                <span className="text-emerald-400 font-semibold">+45 รายการ</span>
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="w-4 h-4 mr-2" /> ดึงข้อมูลตอนนี้ (Force Sync)
            </Button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-slate-700/30">
            <Database className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
              </span>
              <h2 className="text-xl font-bold text-white">Letgo API</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">Status: Auto-Sync Disabled</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">ซิงค์ครั้งล่าสุด</span>
                <span className="text-white">เมื่อวาน, 23:00 น.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">อัปเดตทัวร์</span>
                <span className="text-white font-semibold">0 รายการ</span>
              </div>
            </div>

            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="w-4 h-4 mr-2" /> ดึงข้อมูลตอนนี้ (Force Sync)
            </Button>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">ตั้งค่าการซิงค์ข้อมูล (Mapping Settings)</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-500 w-5 h-5"/> กฎการตั้งราคา (Price Markup)</h4>
            <p className="text-sm text-slate-400 mb-4">ระบบจะบวกราคาจากต้นทุน API เป็นราคาขายหน้าเว็บ</p>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-300">Zego API Markup</span>
                <span className="text-sm font-bold text-emerald-400">+500 บาท / ที่นั่ง</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Letgo API Markup</span>
                <span className="text-sm font-bold text-emerald-400">+3% จากต้นทุน</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2"><AlertCircle className="text-amber-500 w-5 h-5"/> การกรองข้อมูล (Filters)</h4>
            <p className="text-sm text-slate-400 mb-4">ตั้งค่าไม่ให้นำทัวร์บางประเภทเข้ามาในระบบ</p>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-2">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" checked className="rounded bg-slate-800 border-slate-600 text-blue-500" />
                ซ่อนทัวร์ที่มีคำว่า "รถบัส" (ไม่รวมตั๋วเครื่องบิน)
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" checked className="rounded bg-slate-800 border-slate-600 text-blue-500" />
                ซ่อนทัวร์ที่ที่นั่งเหลือน้อยกว่า 2 ที่
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
