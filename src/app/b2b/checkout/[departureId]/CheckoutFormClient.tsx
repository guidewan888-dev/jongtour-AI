"use client";

import { useState } from "react";
import { submitB2BBooking } from "@/actions/b2b-checkout";
import { Users, Info, ShieldCheck, UserPlus, Trash2 } from "lucide-react";

export default function CheckoutFormClient({ departure, agent, adultPrice, netPrice, discountAmount }: any) {
  const [paxCount, setPaxCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = netPrice * paxCount;

  return (
    <form action={async (formData) => {
      setIsSubmitting(true);
      await submitB2BBooking(formData);
    }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <input type="hidden" name="departureId" value={departure.id} />
      <input type="hidden" name="agentId" value={agent.id} />
      <input type="hidden" name="paxCount" value={paxCount} />
      <input type="hidden" name="totalPrice" value={totalPrice} />

      <div className="lg:col-span-2 space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" /> ข้อมูลผู้ติดต่อ (Contact Person)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ชื่อ-นามสกุล</label>
              <input required name="contactName" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="เช่น นายสมชาย ใจดี" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">เบอร์โทรศัพท์</label>
              <input required name="contactPhone" type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="เช่น 0812345678" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">อีเมล</label>
              <input required name="contactEmail" type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="เช่น somchai@email.com" />
            </div>
          </div>
        </div>

        {/* Travelers Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> ข้อมูลผู้เดินทาง (Travelers)
            </h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => paxCount > 1 && setPaxCount(paxCount - 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
              <span className="font-bold text-lg w-4 text-center">{paxCount}</span>
              <button type="button" onClick={() => paxCount < departure.remainingSeats && setPaxCount(paxCount + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: paxCount }).map((_, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">ผู้เดินทางคนที่ {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">ชื่อ (ภาษาอังกฤษ)</label>
                    <input required name={`pax_${i}_firstName`} type="text" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">นามสกุล (ภาษาอังกฤษ)</label>
                    <input required name={`pax_${i}_lastName`} type="text" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm" placeholder="Last Name" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Passport No.</label>
                    <input required name={`pax_${i}_passportNo`} type="text" className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm" placeholder="AA1234567" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">สรุปรายการจอง (Summary)</h3>
          
          <div className="mb-4">
            <p className="font-bold text-slate-800 text-sm">{departure.tour.tourName}</p>
            <p className="text-xs text-slate-500 mt-1">{new Date(departure.startDate).toLocaleDateString('th-TH')} - {new Date(departure.endDate).toLocaleDateString('th-TH')}</p>
          </div>

          <div className="space-y-3 text-sm border-t border-slate-100 pt-4 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">ราคาผู้ใหญ่ (Selling Price)</span>
              <span className="font-medium text-slate-800">฿{adultPrice.toLocaleString()} x {paxCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">ส่วนลด Agent ({agent.tier})</span>
              <span className="font-bold text-emerald-600">- ฿{(discountAmount * paxCount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-indigo-700 font-medium">
              <span>ราคาสุทธิ / ท่าน (Net Price)</span>
              <span>฿{netPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-800 text-lg">ยอดรวมทั้งสิ้น</span>
              <span className="font-black text-2xl text-indigo-600">฿{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg ${isSubmitting ? 'bg-slate-400 text-white cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'}`}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : <><ShieldCheck className="w-5 h-5" /> ยืนยันการจอง (ตัดที่นั่ง)</>}
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-3">
            การกดยืนยันหมายถึงคุณยอมรับเงื่อนไขการจองและนโยบายการยกเลิกของบริษัท
          </p>
        </div>
      </div>
    </form>
  );
}
