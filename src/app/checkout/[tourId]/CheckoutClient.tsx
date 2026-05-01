"use client";

import { useState } from "react";
import { ShieldCheck, MapPin, Calendar, Users, Info, Plus } from "lucide-react";
import { submitCheckout } from "@/app/actions/checkout";
import { useSearchParams } from "next/navigation";

export default function CheckoutClient({ tour, departures }: { tour: any, departures: any[] }) {
  const searchParams = useSearchParams();
  const initAdults = parseInt(searchParams.get('adults') || '2', 10);
  const initChildren = parseInt(searchParams.get('children') || '0', 10);
  const initDepId = searchParams.get('departureId') || (departures.length > 0 ? departures[0].id : "");

  const [selectedDepId, setSelectedDepId] = useState(initDepId);
  const [adults, setAdults] = useState(initAdults);
  const [children, setChildren] = useState(initChildren);
  const [singleRooms, setSingleRooms] = useState(0);
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'deposit'
  
  // Extra Services (quantity instead of boolean)
  const [disneylandQty, setDisneylandQty] = useState(0);
  const [insuranceQty, setInsuranceQty] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDep = departures.find(d => d.id === selectedDepId);
  const pricePerPax = selectedDep ? selectedDep.price : tour.price;
  
  // MOCK PRICES (To be replaced with real DB data later)
  const childPrice = pricePerPax * 0.95; // 5% discount mock
  const singleRoomPrice = 4000;
  const depositPrice = 7000;
  const disneylandPrice = 2500;
  const insurancePrice = 500;

  const totalPax = adults + children;
  
  const basePrice = (adults * pricePerPax) + (children * childPrice);
  const singleSupplement = singleRooms * singleRoomPrice;
  const extrasTotal = (disneylandQty * disneylandPrice) + (insuranceQty * insurancePrice);
  
  const totalPrice = basePrice + singleSupplement + extrasTotal;
  const totalDeposit = (totalPax * depositPrice) + extrasTotal; // deposit + extras paid upfront usually

  const finalAmountToPay = paymentType === 'deposit' ? totalDeposit : totalPrice;

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
      <input type="hidden" name="pax" value={totalPax} />
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Forms */}
        <div className="flex-1 space-y-6">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">รายละเอียดการจอง</h2>
            <div className="space-y-6 mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ผู้ใหญ่</label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                    <span className="text-lg font-bold w-full text-center">{adults}</span>
                    <button type="button" onClick={() => setAdults(adults + 1)} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เด็ก (2-11 ปี)</label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                    <span className="text-lg font-bold w-full text-center">{children}</span>
                    <button type="button" onClick={() => setChildren(children + 1)} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">พักเดี่ยว (ท่าน)</label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setSingleRooms(Math.max(0, singleRooms - 1))} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                    <span className="text-lg font-bold w-full text-center">{singleRooms}</span>
                    <button type="button" onClick={() => setSingleRooms(Math.min(totalPax, singleRooms + 1))} className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">บริการเสริมพิเศษ (Extra Services)</h2>
            <p className="text-gray-500 mb-6 text-sm">เพิ่มความสะดวกสบายให้การเดินทางของคุณ (สามารถเลือกจำนวนที่ต้องการได้)</p>
            
            <div className="space-y-4">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-colors ${disneylandQty > 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">บัตรเข้าสวนสนุก Disneyland (รวมรถรับส่ง)</div>
                  <div className="text-sm text-gray-500 mt-1">สนุกสุดเหวี่ยงกับเครื่องเล่นระดับโลก พร้อมรถรับส่งจากโรงแรม</div>
                  <div className="font-bold text-orange-600 mt-2">+{disneylandPrice.toLocaleString()} ฿ / ท่าน</div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border border-gray-300 bg-white rounded-xl overflow-hidden shrink-0 h-12">
                  <button type="button" onClick={() => setDisneylandQty(Math.max(0, disneylandQty - 1))} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                  <span className="font-bold w-12 text-center">{disneylandQty}</span>
                  <button type="button" onClick={() => setDisneylandQty(Math.min(totalPax, disneylandQty + 1))} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-colors ${insuranceQty > 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">ประกันภัยการเดินทางแบบพรีเมียม (ครอบคลุมโควิด-19)</div>
                  <div className="text-sm text-gray-500 mt-1">คุ้มครองค่ารักษาพยาบาลสูงสุด 2 ล้านบาท</div>
                  <div className="font-bold text-orange-600 mt-2">+{insurancePrice.toLocaleString()} ฿ / ท่าน</div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border border-gray-300 bg-white rounded-xl overflow-hidden shrink-0 h-12">
                  <button type="button" onClick={() => setInsuranceQty(Math.max(0, insuranceQty - 1))} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                  <span className="font-bold w-12 text-center">{insuranceQty}</span>
                  <button type="button" onClick={() => setInsuranceQty(Math.min(totalPax, insuranceQty + 1))} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">รูปแบบการชำระเงิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${paymentType === 'full' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <input type="radio" name="paymentType" value="full" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="font-bold text-gray-800 text-lg">ชำระเต็มจำนวน</span>
                </div>
                <span className="text-sm text-gray-500 ml-8">ชำระยอดทั้งหมดรวดเดียว</span>
              </label>

              <label className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${paymentType === 'deposit' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <input type="radio" name="paymentType" value="deposit" checked={paymentType === 'deposit'} onChange={() => setPaymentType('deposit')} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="font-bold text-gray-800 text-lg">แบ่งชำระ (มัดจำ)</span>
                </div>
                <span className="text-sm text-gray-500 ml-8">ชำระมัดจำท่านละ {depositPrice.toLocaleString()} ฿ ส่วนที่เหลือชำระก่อนเดินทาง 15 วัน</span>
              </label>
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
              <img src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} alt={tour.title} className="w-24 h-24 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">{tour.title}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tour.destination}</p>
                  {selectedDep && <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(selectedDep.startDate)} - {formatDate(selectedDep.endDate)}</p>}
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> ผู้เดินทาง: {totalPax} ท่าน</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6 border-b pb-6">
              {adults > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ผู้ใหญ่ (x{adults})</span>
                  <span>{(adults * pricePerPax).toLocaleString()} ฿</span>
                </div>
              )}
              {children > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>เด็ก (x{children})</span>
                  <span>{(children * childPrice).toLocaleString()} ฿</span>
                </div>
              )}
              {singleRooms > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>พักเดี่ยว (x{singleRooms})</span>
                  <span>{singleSupplement.toLocaleString()} ฿</span>
                </div>
              )}
              {(disneylandQty > 0 || insuranceQty > 0) && (
                <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                  <p className="font-bold text-gray-700 mb-2">บริการเสริม:</p>
                  {disneylandQty > 0 && (
                    <div className="flex justify-between text-gray-500 pl-2 mb-1">
                      <span>บัตร Disneyland (x{disneylandQty})</span>
                      <span>{(disneylandQty * disneylandPrice).toLocaleString()} ฿</span>
                    </div>
                  )}
                  {insuranceQty > 0 && (
                    <div className="flex justify-between text-gray-500 pl-2">
                      <span>ประกันการเดินทาง (x{insuranceQty})</span>
                      <span>{(insuranceQty * insurancePrice).toLocaleString()} ฿</span>
                    </div>
                  )}
                </div>
              )}
              
              {paymentType === 'deposit' && (
                <div className="pt-3 mt-3 border-t border-gray-200 font-medium">
                  <div className="flex justify-between text-gray-800">
                    <span>ยอดรวมทั้งสิ้น (Full Price)</span>
                    <span>{totalPrice.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex justify-between text-orange-600 mt-1">
                    <span>ยอดมัดจำที่ต้องชำระวันนี้</span>
                    <span>{totalDeposit.toLocaleString()} ฿</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-gray-800">ยอดชำระทั้งหมด</span>
              <span className="text-3xl font-bold text-orange-500">{finalAmountToPay.toLocaleString()} ฿</span>
            </div>

            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p>การชำระเงินของคุณปลอดภัย 100% ดำเนินการผ่านระบบของบริษัท จองทัวร์ เอไอ จำกัด โดยตรง</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !selectedDepId || totalPax === 0}
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
