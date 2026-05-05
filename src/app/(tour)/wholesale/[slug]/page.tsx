'use client';
import React, { useState, useEffect } from 'react';
import TourCard from '@/components/tour/TourCard';
import { generateSupplierToursGroupedByCountry, WHOLESALES } from '@/data/tourTaxonomy';

export default function WholesaleSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Basic mock mapper to convert slug back to our known wholesale names
  const supplierName = WHOLESALES.find(w => w.toLowerCase().replace(/\s+/g, '-') === slug) 
    || slug.toUpperCase().replace('-', ' ');

  const [aiQuery, setAiQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [slug]);

  // Generate data scoped strictly to this supplier, grouped by country
  const countryGroups = generateSupplierToursGroupedByCountry(supplierName, 4);
  const countries = Object.keys(countryGroups);

  return (
    <div className="bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
      <main>
        {/* 1. Supplier Hero & Logo Info */}
        <section className="bg-slate-900 text-white pt-16 pb-24 relative overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><polygon fill="currentColor" points="0,100 100,0 100,100"/></svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              
              {/* Supplier Identity */}
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-3xl flex items-center justify-center shrink-0 border-4 border-slate-700 shadow-2xl p-4">
                <span className="font-black text-slate-800 text-2xl md:text-3xl text-center leading-none tracking-tight">{supplierName}</span>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full text-xs mb-4 border border-blue-500/30">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Official Wholesale Partner
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">ทัวร์คุณภาพจาก {supplierName}</h1>
                <p className="text-slate-300 text-lg max-w-2xl leading-relaxed mb-8">
                  Jongtour เป็นตัวแทนจำหน่ายอย่างเป็นทางการของโฮลเซลล์ชั้นนำ {supplierName} มั่นใจได้ว่าทุกโปรแกรมทัวร์ได้รับการคัดสรรคุณภาพและคุ้มค่าที่สุด
                </p>

                {/* 2. AI Search Locked to Supplier */}
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 max-w-2xl relative">
                  <div className="relative bg-white rounded-xl shadow-inner flex flex-col md:flex-row gap-2 p-1.5">
                    <div className="flex-1 relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <input 
                        type="text" 
                        value={aiQuery}
                        onChange={e => setAiQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 outline-none" 
                        placeholder={`หาทัวร์ของ ${supplierName} เช่น 'ญี่ปุ่น 5 วัน เดือนหน้า'`} 
                      />
                    </div>
                    {/* Hard filter via parameter */}
                    <a 
                      href={`/ai-search?q=${encodeURIComponent(aiQuery)}&supplier_id=${slug}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-sm whitespace-nowrap flex items-center justify-center"
                    >
                      ให้ AI ค้นหาทัวร์นี้
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 3. Supplier Promotions */}
        <div className="bg-orange-50 border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar text-sm font-bold text-orange-800">
              <svg className="w-5 h-5 shrink-0 text-orange-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              <span>โปรโมชั่นพิเศษจาก {supplierName}:</span>
              <span className="bg-white text-orange-600 px-3 py-1 rounded-full border border-orange-200">แถมฟรี! น้ำหนักกระเป๋า 30kg ทุกเส้นทาง</span>
              <span className="bg-white text-orange-600 px-3 py-1 rounded-full border border-orange-200">ลด 1,000 บาท/ท่าน สำหรับกรุ๊ปครอบครัว 4 ท่านขึ้นไป</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
          
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-32">
                <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-slate-500 font-medium">กำลังโหลดโปรแกรมทัวร์ทั้งหมดจาก {supplierName} ผ่านระบบ API...</p>
             </div>
          ) : (
            // 4. Tour Listings Grouped by Country
            <section className="space-y-16">
              {countries.map(country => {
                const group = countryGroups[country];
                if (!group || group.tours.length === 0) return null;

                return (
                  <div key={country} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 text-orange-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            ทัวร์{country} โดย {supplierName}
                          </h3>
                        </div>
                      </div>
                      {/* Hard filter applied in the link as well */}
                      <a href={`/search?supplier=${supplierName}&country=${country}`} className="bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-orange-600 border border-slate-200 font-bold py-2 px-5 rounded-xl transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                        ดูทั้งหมด {group.totalAvailable} โปรแกรม <span aria-hidden="true">&rarr;</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {group.tours.map(tour => (
                        // Force supplier lock mentally on UI
                        <TourCard key={tour.id} data={tour} viewMode="grid" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* 5. FAQ & CTA */}
          <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h2 className="text-3xl font-bold mb-4">ข้อมูลโฮลเซลล์</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  เราคัดสรรพันธมิตรคุณภาพ เพื่อให้ทริปของคุณราบรื่น ไร้กังวล
                </p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-white mb-4">สนใจจัดกรุ๊ปเหมา {supplierName}?</h4>
                  <p className="text-slate-300 text-sm mb-6">เราสามารถประสานงานขอใบเสนอราคาพิเศษจาก {supplierName} โดยตรง พร้อมส่วนลด B2B</p>
                  <a href="/contact" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md">
                    ติดต่อเจ้าหน้าที่ฝ่ายขาย
                  </a>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <h3 className="font-bold text-xl mb-4">คำถามที่พบบ่อย (FAQ)</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-blue-300 mb-2">ทำไมถึงควรจองทัวร์ {supplierName} ผ่าน Jongtour?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      จองผ่านเราได้ราคาเท่ากับหรือถูกกว่าจองตรง เนื่องจากเราเป็น Agent รายใหญ่ พร้อมบริการหลังการขาย และระบบสะสมแต้ม Jongtour Points
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="font-bold text-blue-300 mb-2">สถานะ 'คอนเฟิร์มเดินทาง' เชื่อถือได้ไหม?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      เชื่อถือได้ 100% ระบบของเราเชื่อมต่อ API โดยตรงกับระบบตัดที่นั่งของ {supplierName} หากขึ้นสถานะคอนเฟิร์ม หมายความว่ากรุ๊ปนั้นสามารถออกเดินทางได้แน่นอน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
