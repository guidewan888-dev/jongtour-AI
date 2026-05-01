"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plane, Hotel, Utensils, Bus, UserCheck, ShieldCheck, Map, Calendar, Users, Send, Loader2 } from "lucide-react";
import InteractiveItinerary from "@/components/InteractiveItinerary";

export default function CustomTourPage() {
  const [serviceType, setServiceType] = useState<"FULL_SERVICE" | "A_LA_CARTE">("FULL_SERVICE");
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pax: 2,
    startDate: "",
    endDate: "",
    country: "",
    cities: "",
    includeFlights: true,
    includeHotels: true,
    includeMeals: true,
    includeTransport: true,
    includeGuide: true,
    includeInsurance: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.country) {
      alert("กรุณากรอกวันที่เดินทางและประเทศที่ต้องการไปให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
    setItineraryResult(null);

    try {
      const res = await fetch("/api/fit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, serviceType })
      });
      const data = await res.json();
      if (data.itinerary) {
        setItineraryResult(data.itinerary);
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างแผนการเดินทาง");
      }
    } catch (err) {
      console.error(err);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/ai-planner" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">จัดทริปส่วนตัว (F.I.T)</h1>
              <p className="text-xs text-gray-500">กรอกข้อมูลให้เราออกแบบทริปในฝันให้คุณ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Toggle Service Type */}
        <div className="flex bg-gray-200 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setServiceType("FULL_SERVICE")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${serviceType === "FULL_SERVICE" ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ทัวร์จัดเต็ม (Full Service)
          </button>
          <button 
            onClick={() => setServiceType("A_LA_CARTE")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${serviceType === "A_LA_CARTE" ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            เลือกบริการเอง (A La Carte)
          </button>
        </div>

        {/* Results View */}
        {itineraryResult && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" /> ข้อมูลของคุณถูกส่งให้ทีมงานเรียบร้อยแล้ว!
              </h2>
              <p className="text-sm">เซลส์ของเราจะติดต่อกลับไปโดยเร็วที่สุด ระหว่างนี้ เชิญดูแผนการเดินทางเบื้องต้นที่ AI จัดเตรียมไว้ให้ครับ</p>
            </div>
            <InteractiveItinerary itinerary={itineraryResult} />
            <button onClick={() => setItineraryResult(null)} className="mt-6 w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">
              แก้ไขข้อมูล / จัดทริปใหม่
            </button>
          </div>
        )}

        {/* Loading View */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">AI กำลังจัดตารางเที่ยวเบื้องต้นให้คุณ...</h2>
            <p className="text-gray-500">กำลังคำนวณระยะทาง หาราคา และร้อยเรียงสถานที่ท่องเที่ยว...</p>
          </div>
        )}

        {/* Form View */}
        {!itineraryResult && !isLoading && (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            
            {/* Destination */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Map className="w-5 h-5 text-orange-500"/> 1. สถานที่ที่ต้องการเดินทาง</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ประเทศ</label>
                  <input required name="country" value={formData.country} onChange={handleChange} type="text" placeholder="เช่น ญี่ปุ่น, สวิสเซอร์แลนด์" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เมืองที่อยากไป (ถ้ามี)</label>
                  <input name="cities" value={formData.cities} onChange={handleChange} type="text" placeholder="เช่น โตเกียว, ฟูจิ, โอซาก้า" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Dates & Pax */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500"/> 2. วันเดินทางและจำนวนคน</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเดินทางไป</label>
                  <input required name="startDate" value={formData.startDate} onChange={handleChange} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเดินทางกลับ</label>
                  <input required name="endDate" value={formData.endDate} onChange={handleChange} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Users className="w-4 h-4"/> จำนวนผู้เดินทาง (คน)</label>
                  <input required name="pax" value={formData.pax} onChange={handleChange} type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* A La Carte Options */}
            {serviceType === "A_LA_CARTE" ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">3. เลือกบริการที่ต้องการรวมในแพ็กเกจ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeFlights" checked={formData.includeFlights} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Plane className="w-4 h-4 text-gray-400"/> ตั๋วเครื่องบินไป-กลับ</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeHotels" checked={formData.includeHotels} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Hotel className="w-4 h-4 text-gray-400"/> โรงแรมระดับ 3-4 ดาว</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeMeals" checked={formData.includeMeals} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Utensils className="w-4 h-4 text-gray-400"/> อาหารครบทุกมื้อ</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeTransport" checked={formData.includeTransport} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><Bus className="w-4 h-4 text-gray-400"/> รถบัส/รถตู้ พร้อมคนขับ</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeGuide" checked={formData.includeGuide} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><UserCheck className="w-4 h-4 text-gray-400"/> หัวหน้าทัวร์ไทยดูแลตลอดทริป</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <input type="checkbox" name="includeInsurance" checked={formData.includeInsurance} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded" />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><ShieldCheck className="w-4 h-4 text-gray-400"/> ประกันการเดินทาง</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">3. บริการที่รวมในแพ็กเกจ (จัดเต็มครบวงจร)</h3>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-sm text-gray-700 space-y-2">
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> ตั๋วเครื่องบินไป-กลับ ชั้นประหยัด</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> โรงแรมที่พักระดับ 3-4 ดาว</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> อาหารตามโปรแกรม</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> รถโค้ชหรือรถตู้ปรับอากาศ พร้อมคนขับชำนาญทาง</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> หัวหน้าทัวร์คนไทย ดูแลตลอดการเดินทาง</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> ประกันอุบัติเหตุระหว่างการเดินทาง</p>
                </div>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">4. ข้อมูลติดต่อผู้จอง</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="ชื่อผู้ติดต่อ" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ หรือ LINE ID</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="text" placeholder="เพื่อให้เซลส์ติดต่อกลับ" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:bg-white outline-none transition-colors" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Send className="w-5 h-5" /> ส่งให้ AI จัดทริปเลย!
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">ไม่มีค่าใช้จ่ายในการขอใบเสนอราคา</p>

          </form>
        )}
      </div>
    </div>
  );
}
