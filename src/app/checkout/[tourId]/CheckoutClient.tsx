"use client";

import { useState, useRef } from "react";
import { ShieldCheck, MapPin, Calendar, Users, Info, Plus, ScanLine, Loader2 } from "lucide-react";
import { submitCheckout } from "@/app/actions/checkout";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutClient({ tour, departures, agentId }: { tour: any, departures: any[], agentId?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initAdults = parseInt(searchParams.get('adults') || '2', 10);
  const initChildren = parseInt(searchParams.get('children') || '0', 10);
  const initDepId = searchParams.get('departureId') || (departures.length > 0 ? departures[0].id : "");

  const [selectedDepId, setSelectedDepId] = useState(initDepId);
  const [adults, setAdults] = useState(initAdults);
  const [children, setChildren] = useState(initChildren);
  const [singleRooms, setSingleRooms] = useState(0);
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'deposit'
  
  // Extra Services
  const availableExtras = [
    { id: 'disneyland', name: 'บัตรเข้าสวนสนุก Disneyland (รวมรถรับส่ง)', desc: 'สนุกสุดเหวี่ยงกับเครื่องเล่นระดับโลก พร้อมรถรับส่งจากโรงแรม', price: 2500 },
    { id: 'insurance', name: 'ประกันภัยการเดินทางแบบพรีเมียม (ครอบคลุมโควิด-19)', desc: 'คุ้มครองค่ารักษาพยาบาลสูงสุด 2 ล้านบาท', price: 500 }
  ];
  
  const [selectedExtras, setSelectedExtras] = useState<{id: string, qty: number}[]>([]);
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/ocr/passport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const form = document.getElementById('checkout-form') as HTMLFormElement;
          if (form) {
            if (data.data.firstName) form.firstName.value = data.data.firstName;
            if (data.data.lastName) form.lastName.value = data.data.lastName;
            // Optionally set other fields if added later
          }
        } else {
          alert("ไม่สามารถอ่านข้อมูลพาสปอร์ตได้ กรุณากรอกด้วยตนเอง");
        }
        setIsOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsOcrLoading(false);
    }
  };

  const selectedDep = departures.find(d => d.id === selectedDepId);
  const pricePerPax = selectedDep ? selectedDep.price : tour.price;
  
  // Real Prices from Database (Zego API)
  const childPrice = selectedDep?.childPrice || pricePerPax;
  const singleRoomPrice = selectedDep?.singleRoomPrice || 0;
  const depositPrice = selectedDep?.depositPrice || 0;
  
  // Check days before departure
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const startDate = selectedDep ? new Date(selectedDep.startDate) : new Date();
  startDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const canPayDeposit = diffDays >= 30 && depositPrice > 0;
  const effectivePaymentType = canPayDeposit ? paymentType : 'full';

  // Calculate payment due date
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() - 30);
  const formattedDueDate = dueDate.toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: 'numeric'});

  const disneylandPrice = 2500;
  const insurancePrice = 500;

  const totalPax = adults + children;
  
  const basePrice = (adults * pricePerPax) + (children * childPrice);
  const singleSupplement = singleRooms * singleRoomPrice;
  
  const extrasTotal = selectedExtras.reduce((sum, extra) => {
    const service = availableExtras.find(e => e.id === extra.id);
    return sum + (service ? service.price * extra.qty : 0);
  }, 0);
  
  const totalPrice = basePrice + singleSupplement + extrasTotal;
  const totalDeposit = (totalPax * depositPrice) + extrasTotal; // deposit + extras paid upfront usually

  const finalAmountToPay = effectivePaymentType === 'deposit' ? totalDeposit : totalPrice;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: 'numeric'});

  return (
    <form id="checkout-form" action={async (formData) => {
      setIsSubmitting(true);
      try {
        const result = await submitCheckout(formData);
        if (result?.success && result.bookingId) {
          router.push(`/payment/${result.bookingId}`);
        } else {
          setIsSubmitting(false);
          alert(result?.error || 'Error submitting booking');
        }
      } catch (err) {
        setIsSubmitting(false);
        alert(err instanceof Error ? err.message : 'Error submitting booking');
      }
    }}>
      <input type="hidden" name="tourId" value={tour.id} />
      <input type="hidden" name="pax" value={totalPax} />
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={children} />
      <input type="hidden" name="singleRooms" value={singleRooms} />
      <input type="hidden" name="paymentType" value={effectivePaymentType} />
      <input type="hidden" name="totalPrice" value={totalPrice} />
      <input type="hidden" name="totalDeposit" value={totalDeposit} />
      {agentId && <input type="hidden" name="agentId" value={agentId} />}
      
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">บริการเสริมพิเศษ (Extra Services)</h2>
                <p className="text-gray-500 text-sm mt-1">เพิ่มความสะดวกสบายให้การเดินทางของคุณ</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddingExtra(true)} 
                className="flex items-center justify-center gap-1 text-orange-600 font-bold hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl text-sm transition-colors border border-orange-100 shrink-0"
              >
                <Plus className="w-4 h-4" /> เพิ่มบริการเสริม
              </button>
            </div>
            
            {selectedExtras.length === 0 && !isAddingExtra ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                <div className="text-gray-400 mb-2">ยังไม่มีบริการเสริมที่เลือก</div>
                <button type="button" onClick={() => setIsAddingExtra(true)} className="text-orange-600 font-bold hover:underline text-sm">
                  คลิกเพื่อเลือกบริการเสริมเพิ่มเติม
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedExtras.map((extra, index) => {
                  const service = availableExtras.find(e => e.id === extra.id);
                  if (!service) return null;
                  
                  return (
                    <div key={extra.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-orange-200 bg-orange-50/30 rounded-xl relative">
                      <button 
                        type="button" 
                        onClick={() => setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-200"
                        title="ลบรายการ"
                      >
                        ✕
                      </button>
                      <div className="flex-1 pr-4">
                        <div className="font-bold text-gray-800">{service.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{service.desc}</div>
                        <div className="font-bold text-orange-600 mt-2">+{service.price.toLocaleString()} ฿ / ท่าน</div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border border-gray-300 bg-white rounded-xl overflow-hidden shrink-0 h-12">
                        <button type="button" onClick={() => {
                          const newExtras = [...selectedExtras];
                          if (newExtras[index].qty > 1) {
                            newExtras[index].qty -= 1;
                            setSelectedExtras(newExtras);
                          } else {
                            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
                          }
                        }} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button>
                        <span className="font-bold w-12 text-center">{extra.qty}</span>
                        <button type="button" onClick={() => {
                          const newExtras = [...selectedExtras];
                          newExtras[index].qty = Math.min(totalPax, newExtras[index].qty + 1);
                          setSelectedExtras(newExtras);
                        }} className="w-12 h-full bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button>
                      </div>
                    </div>
                  );
                })}

                {isAddingExtra && (
                  <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-gray-800 mb-3">เลือกรายการที่ต้องการเพิ่ม:</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-3"
                      onChange={(e) => {
                        if (e.target.value) {
                          if (!selectedExtras.find(ext => ext.id === e.target.value)) {
                            setSelectedExtras([...selectedExtras, { id: e.target.value, qty: 1 }]);
                          }
                          setIsAddingExtra(false);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>-- กรุณาเลือกบริการเสริม --</option>
                      {availableExtras.map(service => {
                        const isAlreadySelected = selectedExtras.some(e => e.id === service.id);
                        return (
                          <option key={service.id} value={service.id} disabled={isAlreadySelected}>
                            {service.name} (+{service.price.toLocaleString()} ฿) {isAlreadySelected ? '(เลือกแล้ว)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setIsAddingExtra(false)} className="text-gray-500 text-sm font-medium hover:text-gray-700 hover:underline">
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">รูปแบบการชำระเงิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex flex-col p-5 border rounded-xl cursor-pointer transition-all ${effectivePaymentType === 'full' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <input type="radio" name="paymentType" value="full" checked={effectivePaymentType === 'full'} onChange={() => setPaymentType('full')} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="font-bold text-gray-800 text-lg">ชำระเต็มจำนวน</span>
                </div>
                <span className="text-sm text-gray-500 ml-8">ชำระยอดทั้งหมดรวดเดียว</span>
              </label>

              <label className={`flex flex-col p-5 border rounded-xl transition-all ${!canPayDeposit ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : (effectivePaymentType === 'deposit' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500 cursor-pointer' : 'border-gray-200 hover:border-orange-300 cursor-pointer')}`}>
                <div className="flex items-center gap-3 mb-2">
                  <input type="radio" name="paymentType" value="deposit" disabled={!canPayDeposit} checked={effectivePaymentType === 'deposit'} onChange={() => setPaymentType('deposit')} className="w-5 h-5 text-orange-600 focus:ring-orange-500 disabled:opacity-50" />
                  <span className="font-bold text-gray-800 text-lg">แบ่งชำระ (มัดจำ)</span>
                </div>
                <span className="text-sm text-gray-500 ml-8">
                  {canPayDeposit 
                    ? `ชำระมัดจำท่านละ ${depositPrice.toLocaleString()} ฿ ส่วนที่เหลือชำระภายในวันที่ ${formattedDueDate}`
                    : (depositPrice === 0 ? 'โปรแกรมนี้ไม่มีให้เลือกชำระแบบมัดจำได้' : 'ไม่สามารถชำระแบบมัดจำได้ เนื่องจากวันเดินทางเหลือน้อยกว่า 30 วัน')
                  }
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">ข้อมูลผู้ติดต่อหลัก (Lead Traveler)</h2>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isOcrLoading}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200 text-sm"
              >
                {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {isOcrLoading ? "กำลังสแกนพาสปอร์ต..." : "อัปโหลดพาสปอร์ต (กรอกอัตโนมัติ)"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
            </div>
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
              {selectedExtras.length > 0 && (
                <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                  <p className="font-bold text-gray-700 mb-2">บริการเสริม:</p>
                  {selectedExtras.map(extra => {
                    const service = availableExtras.find(e => e.id === extra.id);
                    if (!service) return null;
                    return (
                      <div key={extra.id} className="flex justify-between text-gray-500 pl-2 mb-1">
                        <span className="truncate pr-2">{service.name.split(' (')[0]} (x{extra.qty})</span>
                        <span className="shrink-0">{(extra.qty * service.price).toLocaleString()} ฿</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {effectivePaymentType === 'deposit' && (
                <div className="pt-3 mt-3 border-t border-gray-200 font-medium">
                  <div className="flex justify-between text-gray-800">
                    <span>ยอดรวมทั้งสิ้น (Full Price)</span>
                    <span>{totalPrice.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex justify-between text-orange-600 mt-1">
                    <span>ยอดมัดจำที่ต้องชำระวันนี้</span>
                    <span>{totalDeposit.toLocaleString()} ฿</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg text-center font-normal">
                    ยอดค้างชำระ {(totalPrice - totalDeposit).toLocaleString()} ฿ 
                    <br/>ต้องชำระภายในวันที่ <span className="font-bold text-gray-700">{formattedDueDate}</span>
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
