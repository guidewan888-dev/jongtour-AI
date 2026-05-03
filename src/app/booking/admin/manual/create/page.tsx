"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plane, Users, Search, Save, ArrowRight, UserPlus, FileText, CheckCircle2 } from 'lucide-react';

export default function CreateManualBookingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Plane className="w-8 h-8 text-blue-500" />
          สร้างออเดอร์แมนนวล (Manual Booking)
        </h1>
        <p className="text-slate-400">สำหรับแอดมินหรือเซลส์สร้างการจองให้กับลูกค้าผ่านระบบโดยตรง</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${(step - 1) * 33.33}%` }}></div>
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
            step >= s ? 'bg-blue-600 border-slate-950 text-white' : 'bg-slate-800 border-slate-950 text-slate-500'
          }`}>
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">
        <span>1. เลือกทัวร์</span>
        <span className="text-center">2. ข้อมูลผู้ติดต่อ</span>
        <span className="text-center">3. ผู้เดินทาง</span>
        <span className="text-right">4. สรุปยอด</span>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              ค้นหาโปรแกรมทัวร์ (Tour Search)
            </h2>
            <div className="flex gap-4">
              <Input placeholder="ค้นหาด้วยรหัสทัวร์, ประเทศ หรือ ชื่อโปรแกรม..." className="bg-slate-900 border-slate-700 flex-1" />
              <Button className="bg-blue-600 hover:bg-blue-700">ค้นหาทัวร์</Button>
            </div>

            {/* Dummy Tour Result */}
            <div className="p-4 bg-slate-900 border border-blue-500/50 rounded-xl flex items-center justify-between cursor-pointer ring-2 ring-blue-500/20">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">🇯🇵</div>
                <div>
                  <h3 className="font-bold text-white text-lg">ทัวร์ญี่ปุ่น โตเกียว ฟูจิ คาวากุจิโกะ</h3>
                  <p className="text-slate-400 text-sm">รหัสทัวร์: ZG-JP-001 | Wholesale: Zego</p>
                  <p className="text-emerald-400 text-sm font-medium mt-1">ราคาเริ่มต้น: ฿35,900 / ที่นั่ง</p>
                </div>
              </div>
              <div className="text-right">
                <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none mb-2 block w-48">
                  <option>เลือกวันเดินทาง</option>
                  <option>10-15 ตุลาคม 2026 (ว่าง 12 ที่)</option>
                  <option>17-22 ตุลาคม 2026 (ว่าง 5 ที่)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              ข้อมูลผู้ติดต่อ (Contact Person)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">เบอร์โทรศัพท์ (ค้นหาจากฐานข้อมูล)</label>
                <div className="flex gap-2">
                  <Input placeholder="089xxxxxxx" className="bg-slate-900 border-slate-700 flex-1" defaultValue="0891234567" />
                  <Button variant="outline" className="border-slate-700 text-slate-300">ค้นหา</Button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">ชื่อ-นามสกุล</label>
                <Input placeholder="ชื่อ" className="bg-slate-800 border-slate-700" defaultValue="สมชาย ใจดี" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">อีเมล</label>
                <Input placeholder="อีเมล" className="bg-slate-800 border-slate-700" defaultValue="somchai@example.com" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">LINE ID</label>
                <Input placeholder="LINE ID" className="bg-slate-800 border-slate-700" defaultValue="somchai.j" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                รายชื่อผู้เดินทาง (Travelers)
              </h2>
              <Button size="sm" className="bg-slate-700 hover:bg-slate-600">เพิ่มผู้เดินทาง</Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex gap-4">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold">1</div>
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <Input placeholder="ชื่อ (ภาษาอังกฤษ)" className="bg-slate-800 border-slate-700" />
                  <Input placeholder="นามสกุล (ภาษาอังกฤษ)" className="bg-slate-800 border-slate-700" />
                  <select className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 outline-none">
                    <option>ผู้ใหญ่ (Adult)</option>
                    <option>เด็ก (Child)</option>
                    <option>ทารก (Infant)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              สรุปยอดจอง (Order Summary)
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="font-bold text-white">ทัวร์ญี่ปุ่น โตเกียว ฟูจิ คาวากุจิโกะ</h3>
                  <p className="text-slate-400 text-sm">เดินทาง: 10-15 ตุลาคม 2026</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>ผู้ใหญ่ 1 ท่าน (฿35,900 x 1)</span>
                  <span className="font-medium">฿35,900</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>ส่วนลดแมนนวล (เซลส์)</span>
                  <Input type="number" placeholder="ใส่ส่วนลด..." className="w-32 h-8 bg-slate-800 border-rose-500/50 text-right text-rose-400" />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-lg font-bold text-white">ยอดสุทธิ (Net Total)</span>
                <span className="text-3xl font-black text-blue-400">฿35,900</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          className="border-slate-700 text-slate-300"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          ย้อนกลับ
        </Button>
        {step < 4 ? (
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setStep(Math.min(4, step + 1))}
          >
            ต่อไป <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" /> บันทึกการจอง (Create Order)
          </Button>
        )}
      </div>
    </div>
  );
}
