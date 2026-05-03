import { CheckCircle2, User, Users, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPassengerPage({ params }: { params: { tourId: string, departureId: string } }) {
  // In a real app, we would fetch tour, availability, and pricing from the DB here
  // and create a Price Snapshot.
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column - Main Form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Progress Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
            ผู้จอง & ผู้เดินทาง
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">2</div>
            ชำระเงิน
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
          <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">3</div>
            เสร็จสิ้น
          </div>
        </div>

        {/* Warning / Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">กรุณากรอกข้อมูลให้ตรงกับหนังสือเดินทาง (Passport)</p>
            <p>เพื่อป้องกันปัญหาการทำวีซ่าและออกบัตรโดยสาร หากชื่อไม่ตรงอาจมีค่าธรรมเนียมการแก้ไขจากสายการบิน</p>
          </div>
        </div>

        {/* Lead Booker Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
            <User className="text-slate-500" size={20} />
            <h2 className="font-bold text-slate-800">ข้อมูลผู้ติดต่อหลัก (Lead Booker)</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ (ภาษาอังกฤษ)</label>
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล (ภาษาอังกฤษ)</label>
              <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input type="tel" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
              <input type="email" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Travelers Setup (Normally dynamic based on pax selection) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
            <Users className="text-slate-500" size={20} />
            <h2 className="font-bold text-slate-800">ผู้เดินทางท่านที่ 1 (ผู้ใหญ่)</h2>
          </div>
          <div className="p-6">
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">ใช้ข้อมูลเดียวกับผู้ติดต่อหลัก</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ (ภาษาอังกฤษ)</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล (ภาษาอังกฤษ)</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Link 
            href={`/booking/payment/BOK-mock-1234`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors"
          >
            ดำเนินการต่อไปยังหน้าชำระเงิน
          </Link>
        </div>

      </div>

      {/* Right Column - Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
          {/* Summary Header */}
          <div className="bg-slate-900 text-white p-5">
            <h3 className="font-bold text-lg tracking-tight mb-1">สรุปรายละเอียดการจอง</h3>
            <p className="text-slate-400 text-sm">ฮอกไกโด ซัปโปโร โอตารุ เล่นสกี</p>
          </div>
          
          <div className="p-5 space-y-4 border-b border-slate-100">
            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-500">วันเดินทาง:</span>
              <span className="font-semibold text-slate-800 text-right">12 ต.ค. 2026<br/>ถึง 17 ต.ค. 2026</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">ระยะเวลา:</span>
              <span className="font-semibold text-slate-800">6 วัน 4 คืน</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">สายการบิน:</span>
              <span className="font-semibold text-slate-800">Thai Airways (TG)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">ผู้เดินทาง:</span>
              <span className="font-semibold text-slate-800">ผู้ใหญ่ 2 ท่าน</span>
            </div>
          </div>

          <div className="p-5 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-600">
              <span>ผู้ใหญ่ x2 (฿45,900)</span>
              <span>฿91,800</span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-600 font-medium">
              <span>ส่วนลดโปรโมชัน</span>
              <span>- ฿2,000</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
              <div>
                <span className="block text-sm text-slate-500 font-medium">ยอดสุทธิ (Net Total)</span>
                <span className="block text-xs text-slate-400">รวมภาษีมูลค่าเพิ่มแล้ว</span>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">฿89,800</span>
            </div>
          </div>

          <div className="p-4 bg-white flex items-start gap-2 text-xs text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>ราคานี้ได้รับการยืนยันและล็อกที่นั่งแล้วชั่วคราว กรุณาทำรายการภายใน 30 นาที</p>
          </div>
        </div>
      </div>

    </div>
  );
}
