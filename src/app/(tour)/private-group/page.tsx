'use client';
import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
interface PrivateGroupFormData {
  country: string;
  days: number;
  pax: number;
  period: string;
  budget: number;
  hotel: string;
  style: string;
  meals: string;
  phone: string;
}

interface GeneratedItinerary {
  id: string;
  estimatedPricePerPax: number;
  totalPrice: number;
  days: { day: number; title: string; desc: string }[];
}

// ----------------------------------------------------------------------
// TODO: Replace with real API call to Jongtour AI / Backend
// Example: const result = await fetch('/api/ai/generate-itinerary', { method: 'POST', body: JSON.stringify(formData) }).then(r=>r.json());
// ----------------------------------------------------------------------
async function mockGenerateItinerary(data: PrivateGroupFormData): Promise<GeneratedItinerary> {
  await new Promise(r => setTimeout(r, 2500)); // Simulate AI generation delay

  // Basic simulation logic based on inputs
  const baseCost = data.country === 'ญี่ปุ่น' ? 5000 : data.country === 'ยุโรป' ? 10000 : 4000;
  const hotelMult = data.hotel.includes('5') ? 1.8 : data.hotel.includes('4') ? 1.3 : 1.0;
  
  let estPerPax = baseCost * data.days * hotelMult;
  
  // Adjust if budget is lower than estimate, make it realistic but closer to budget
  if (data.budget > 0 && estPerPax > data.budget) {
    estPerPax = data.budget * 0.95; // Try to fit budget
  }

  const days = [];
  for (let i = 1; i <= data.days; i++) {
    if (i === 1) {
      days.push({ day: 1, title: `ออกเดินทางสู่ ${data.country}`, desc: `ออกเดินทางไปยัง ${data.country} ด้วยสายการบินชั้นนำ พร้อมบริการต้อนรับส่วนตัวที่สนามบิน เดินทางเข้าสู่ที่พักระดับ ${data.hotel}` });
    } else if (i === data.days) {
      days.push({ day: i, title: `เดินทางกลับโดยสวัสดิภาพ`, desc: `ช้อปปิ้งของฝากตามอัธยาศัย ก่อนเดินทางไปสนามบินเพื่อเดินทางกลับ` });
    } else {
      days.push({ 
        day: i, 
        title: `ท่องเที่ยวสไตล์ ${data.style}`, 
        desc: `รถตู้ส่วนตัวพร้อมคนขับและไกด์ท้องถิ่น พาท่านเที่ยวชมสถานที่ไฮไลท์ของ ${data.country} แบบ Private (จัดเตรียมอาหารพิเศษ: ${data.meals})` 
      });
    }
  }

  return {
    id: `REQ-${Date.now().toString().slice(-6)}`,
    estimatedPricePerPax: Math.round(estPerPax / 100) * 100,
    totalPrice: Math.round((estPerPax * data.pax) / 100) * 100,
    days
  };
}

export default function PrivateGroupPage() {
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form');
  const [formData, setFormData] = useState<PrivateGroupFormData>({
    country: 'ญี่ปุ่น',
    days: 5,
    pax: 10,
    period: '',
    budget: 0,
    hotel: '4 ดาว',
    style: 'เน้นกินเที่ยวสบายๆ ไม่เหนื่อย',
    meals: 'ไม่ระบุ / ทานได้ทุกอย่าง',
    phone: ''
  });

  const [result, setResult] = useState<GeneratedItinerary | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('generating');
    
    // Simulate API Call
    const generated = await mockGenerateItinerary(formData);
    setResult(generated);
    setStep('result');

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
      <main>
        {/* 1. Hero Section */}
        <section className="bg-slate-900 text-white pt-20 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1517868163143-6eb6c78dddb9?q=80&w=2000&auto=format&fit=crop" alt="Private Group" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              บริการจัดกรุ๊ปเหมาส่วนตัว (Private Group)
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              ออกแบบทริปในฝัน <br className="hidden md:block" />ด้วย AI อัจฉริยะ ภายใน 1 นาที
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              ให้ Jongtour AI ช่วยร่างแผนการเดินทางและประเมินราคาเบื้องต้นให้กับกรุ๊ปครอบครัว หรือบริษัทของคุณได้ทันที ฟรี! ไม่มีค่าใช้จ่าย
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
          
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Form & Result Area */}
            <div className="flex-1">
              
              {step === 'form' && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    บอกความต้องการของคุณ
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">จุดหมายปลายทาง (ประเทศ/เมือง)</label>
                        <input type="text" required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="เช่น ญี่ปุ่น, ยุโรป" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ช่วงเดือนที่ต้องการเดินทาง</label>
                        <input type="text" required value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="เช่น ธันวาคม, ปีใหม่" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนวัน</label>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                          <button type="button" onClick={() => setFormData({...formData, days: Math.max(1, formData.days - 1)})} className="p-2 text-slate-500 hover:text-slate-900">-</button>
                          <input type="number" value={formData.days} onChange={e => setFormData({...formData, days: Number(e.target.value)})} className="w-full bg-transparent border-none text-center outline-none focus:ring-0 font-bold" min="1" />
                          <button type="button" onClick={() => setFormData({...formData, days: formData.days + 1})} className="p-2 text-slate-500 hover:text-slate-900">+</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนผู้เดินทาง (คน)</label>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                          <button type="button" onClick={() => setFormData({...formData, pax: Math.max(2, formData.pax - 1)})} className="p-2 text-slate-500 hover:text-slate-900">-</button>
                          <input type="number" value={formData.pax} onChange={e => setFormData({...formData, pax: Number(e.target.value)})} className="w-full bg-transparent border-none text-center outline-none focus:ring-0 font-bold" min="2" />
                          <button type="button" onClick={() => setFormData({...formData, pax: formData.pax + 1})} className="p-2 text-slate-500 hover:text-slate-900">+</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">งบประมาณ/ท่าน (บาท)</label>
                        <input type="number" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="ไม่ระบุ" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ระดับโรงแรมที่พัก</label>
                        <select value={formData.hotel} onChange={e => setFormData({...formData, hotel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500">
                          <option>3 ดาว (เน้นประหยัด)</option>
                          <option>4 ดาว (มาตรฐานสากล)</option>
                          <option>5 ดาว (หรูหรา)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">สไตล์ทริปที่ชอบ</label>
                        <select value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500">
                          <option>เน้นกินเที่ยวสบายๆ ไม่เหนื่อย</option>
                          <option>เก็บแลนด์มาร์คครบ ถ่ายรูปสวย</option>
                          <option>เน้นช้อปปิ้ง อิสระเยอะ</option>
                          <option>สัมผัสวัฒนธรรม เจาะลึก</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">ข้อจำกัดเรื่องอาหาร / ความต้องการพิเศษ</label>
                      <input type="text" value={formData.meals} onChange={e => setFormData({...formData, meals: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="เช่น ไม่ทานเนื้อวัว, มีผู้สูงอายุใช้วีลแชร์" />
                    </div>

                    <hr className="border-slate-100" />

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทรศัพท์ (เพื่อให้เจ้าหน้าที่ติดต่อกลับ)</label>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="08X-XXX-XXXX" />
                    </div>

                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md transition-all text-lg flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A120.153 120.153 0 0121 8a120.149 120.149 0 01-9.7 6.954V1.046zm1.414 10.852a120.093 120.093 0 008.28-5.898 120.096 120.096 0 00-8.28-5.898v11.796z" clipRule="evenodd" /></svg>
                      สร้างแผนการเดินทางด้วย AI
                    </button>

                  </form>
                </div>
              )}

              {step === 'generating' && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                    <svg className="w-10 h-10 absolute inset-0 m-auto text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Jongtour AI กำลังทำงาน...</h3>
                  <p className="text-slate-500">กำลังวิเคราะห์ความต้องการและคำนวณต้นทุนโรงแรม ตั๋วเครื่องบิน สำหรับ {formData.pax} ท่าน</p>
                </div>
              )}

              {step === 'result' && result && (
                <div ref={resultRef} className="space-y-8 animate-fade-in-up">
                  
                  {/* Price Estimate Preview */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-8 md:p-10 text-white relative overflow-hidden border border-slate-700">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-orange-400 text-sm font-bold tracking-widest uppercase mb-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        สร้างแผนสำเร็จ (Ref: {result.id})
                      </div>
                      
                      <h2 className="text-3xl font-bold mb-8">สรุปงบประมาณเบื้องต้น (Estimate)</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                          <p className="text-slate-400 text-sm mb-1">ราคาประเมินต่อท่าน</p>
                          <div className="text-3xl font-black text-white">฿{result.estimatedPricePerPax.toLocaleString()}</div>
                          <p className="text-xs text-emerald-400 mt-2">รวมค่าตั๋ว ที่พัก และอาหารแล้ว</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                          <p className="text-slate-400 text-sm mb-1">ราคารวมทั้งกรุ๊ป ({formData.pax} ท่าน)</p>
                          <div className="text-3xl font-black text-orange-400">฿{result.totalPrice.toLocaleString()}</div>
                          <p className="text-xs text-slate-400 mt-2">ราคานี้เป็นเพียงการประเมินเบื้องต้น</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg">
                        ส่งแผนนี้เพื่อขอใบเสนอราคาทางการ
                      </button>
                    </div>
                  </div>

                  {/* Itinerary Draft Preview */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">ร่างแผนการเดินทาง (Draft Itinerary)</h3>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {result.days.map((day, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Marker */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-[.is-active]:bg-orange-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <span className="font-bold text-sm">{day.day}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-2">{day.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{day.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button onClick={() => setStep('form')} className="text-slate-500 hover:text-orange-600 font-bold underline transition-colors">
                      แก้ไขข้อมูลความต้องการใหม่
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Right Column: Examples / Social Proof */}
            <div className="lg:w-[35%] space-y-6">
              
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xl text-slate-900 mb-4">ตัวอย่างกรุ๊ปเหมาที่เราดูแล</h3>
                <div className="space-y-4">
                  {[
                    { title: 'บริษัท ABC', desc: 'สัมมนาดูงาน ญี่ปุ่น 50 ท่าน', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=200&auto=format&fit=crop' },
                    { title: 'ครอบครัวสุขสันต์', desc: 'เที่ยวยุโรปแบบส่วนตัว 8 ท่าน', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=200&auto=format&fit=crop' },
                    { title: 'แก๊งค์เพื่อน', desc: 'ชิลๆ ไต้หวัน 15 ท่าน', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200&auto=format&fit=crop' }
                  ].map((ex, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={ex.img} alt={ex.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ex.title}</h4>
                        <p className="text-xs text-slate-500">{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 text-center">
                <svg className="w-12 h-12 text-orange-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="font-bold text-lg text-slate-900 mb-2">ทำไมต้องจัดกรุ๊ปกับเรา?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  เรามี Connection กับแลนด์โอเปอเรเตอร์และโรงแรมทั่วโลก ทำให้ได้ราคาดีที่สุด และปรับแต่งได้ 100% ตามใจคุณ
                </p>
                <div className="text-orange-600 font-black text-xl">
                  โทร: 02-XXX-XXXX
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
