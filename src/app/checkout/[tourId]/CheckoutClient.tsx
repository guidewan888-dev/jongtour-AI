"use client";

import { useState } from "react";
import { ChevronRight, ShieldCheck, MapPin, Calendar, Users } from "lucide-react";
import { submitCheckout } from "@/app/actions/checkout";

export default function CheckoutClient({ tour, departures }: { tour: any, departures: any[] }) {
  const [pax, setPax] = useState(1);
  const [selectedDepId, setSelectedDepId] = useState(departures[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDep = departures.find(d => d.id === selectedDepId);
  const pricePerPax = selectedDep ? selectedDep.price : tour.price;
  const totalPrice = pricePerPax * pax;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: 'numeric'});

  return (
    <form action={async (formData) => {
      setIsSubmitting(true);
      try {
        await submitCheckout(formData);
      } catch (err) {
        setIsSubmitting(false);
        alert(err instanceof Error ? err.message : 'Error submitting booking');
      }
    }}>
      <input type="hidden" name="tourId" value={tour.id} />
      <input type="hidden" name="pax" value={pax} />
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Forms */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">รายละเอียดการจอง</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลือกรอบเดินทาง *</label>
                <select 
                  name="departureId"
                  value={selectedDepId}
                  onChange={(e) => setSelectedDepId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                >
                  <option value="" disabled>-- กรุณาเลือกรอบเดินทาง --</option>
                  {departures.map(d => (
                    <option key={d.id} value={d.id}>
                      {formatDate(d.startDate)} - {formatDate(d.endDate)} (ว่าง {d.availableSeats} ที่)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนผู้เดินทาง *</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setPax(Math.max(1, pax - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                  <span className="text-lg font-bold w-8 text-center">{pax}</span>
                  <button type="button" onClick={() => setPax(Math.min(selectedDep?.availableSeats || 99, pax + 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลผู้ติดต่อหลัก (Lead Traveler)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อจริง (ภาษาอังกฤษตามพาสปอร์ต) *</label>
                <input type="text" name="firstName" required className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="First Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (ภาษาอังกฤษตามพาสปอร์ต) *</label>
                <input type="text" name="lastName" required className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Last Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์มือถือ *</label>
                <input type="tel" name="phone" required className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="08X-XXX-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล (สำหรับรับเอกสาร) *</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="email@example.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">สรุปการทำรายการ (Order Summary)</h2>
            
            <div className="flex gap-4 mb-6">
              <img src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop"} alt={tour.title} className="w-24 h-24 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">{tour.title}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tour.destination}</p>
                  {selectedDep && <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(selectedDep.startDate)} - {formatDate(selectedDep.endDate)}</p>}
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> ผู้เดินทาง: {pax} ท่าน</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6 border-b pb-6">
              <div className="flex justify-between text-gray-600">
                <span>ราคาต่อท่าน</span>
                <span>{pricePerPax.toLocaleString()} ฿</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>จำนวน</span>
                <span>x {pax}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-gray-800">ยอดชำระทั้งหมด</span>
              <span className="text-3xl font-bold text-orange-500">{totalPrice.toLocaleString()} ฿</span>
            </div>

            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p>การชำระเงินของคุณปลอดภัย 100% ดำเนินการผ่านระบบของบริษัท จองทัวร์ เอไอ จำกัด โดยตรง</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !selectedDepId}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันและดำเนินการชำระเงิน"}
            </button>
          </div>
        </aside>

      </div>
    </form>
  );
}
