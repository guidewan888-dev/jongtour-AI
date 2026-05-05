'use client';
import React, { useState, useEffect } from 'react';
import TourCard from '@/components/tour/TourCard';
import { getRegionData, generateWholesaleGroupedTours, WHOLESALES } from '@/data/tourTaxonomy';

export default function CitySlugPage({ params }: { params: { slug: string, city: string } }) {
  const { slug, city } = params;
  const countryData = getRegionData(slug);
  
  // Format city name for display (very basic mock formatting)
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace('-', ' ');
  
  const [aiQuery, setAiQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [city]);

  // Specific Empty State condition for demonstration
  const isEmptyState = city.toLowerCase() === 'empty' || city.toLowerCase() === 'unknown';
  
  // If not empty state, generate tours scoped to this city
  const wholesaleGroups = isEmptyState ? {} : generateWholesaleGroupedTours(`${countryData.name} - ${cityName}`, 4);
  const hasTours = Object.keys(wholesaleGroups).length > 0;

  // City specific mock data
  const cityHeroImage = cityName.toLowerCase() === 'tokyo' 
    ? 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop';

  return (
    <div className="bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
      <main>
        {/* 1. City Hero & Breadcrumb */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0">
            <img src={cityHeroImage} alt={cityName} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full mt-10">
            
            {/* Breadcrumb */}
            <nav className="flex justify-center text-sm font-medium text-slate-300 mb-6 drop-shadow">
              <ol className="flex items-center space-x-2">
                <li><a href="/" className="hover:text-white transition-colors">หน้าหลัก</a></li>
                <li><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                <li><a href={`/country/${slug}`} className="hover:text-white transition-colors">{countryData.name}</a></li>
                <li><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                <li className="text-orange-400" aria-current="page">{cityName}</li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
              ทัวร์{cityName}
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow">
              สำรวจโปรแกรมเที่ยว{cityName}ที่ดีที่สุดจาก {countryData.name} พร้อมส่วนลดพิเศษ
            </p>

            {/* AI Context Search */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 max-w-2xl mx-auto">
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
                    placeholder={`ค้นหาทัวร์${cityName} ด้วย AI...`} 
                  />
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-sm whitespace-nowrap">
                  ค้นหา
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลทัวร์จากระบบส่วนกลาง...</p>
            </div>
          ) : !hasTours ? (
            
            // EMPTY STATE UX
            <section className="py-16">
              <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-slate-200 shadow-sm max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">ยังไม่พบโปรแกรมทัวร์จริงของเมืองนี้</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  ขออภัยค่ะ ปัจจุบันยังไม่มีโฮลเซลล์เปิดขายโปรแกรมทัวร์ที่ระบุจุดหมายเป็น "{cityName}" แบบเฉพาะเจาะจง <br className="hidden md:block"/>
                  แต่คุณสามารถให้ AI ช่วยหาเมืองใกล้เคียง หรือปรึกษาเจ้าหน้าที่เพื่อจัดกรุ๊ปส่วนตัวได้ค่ะ
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href={`/ai-search?q=หาทัวร์ใกล้เคียง ${cityName}`} className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    ให้ AI หาเมืองใกล้เคียง
                  </a>
                  <a href="/contact" className="bg-slate-900 text-white hover:bg-slate-800 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    ติดต่อเจ้าหน้าที่
                  </a>
                </div>
              </div>
            </section>

          ) : (
            
            // Tour Listing by Wholesale
            <div className="space-y-20">
              {WHOLESALES.map(supplier => {
                const group = wholesaleGroups[supplier];
                if (!group || group.tours.length === 0) return null;

                return (
                  <section key={supplier} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200">
                          <span className="font-black text-slate-400 text-xs text-center leading-none">{supplier}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            ทัวร์จาก {supplier}
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </h3>
                          <p className="text-slate-500 mt-1 font-medium text-sm">อัปเดตสถานะที่นั่ง Real-time</p>
                        </div>
                      </div>
                      <a href={`/search?supplier=${supplier}&city=${cityName}`} className="bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-orange-600 border border-slate-200 font-bold py-2 px-5 rounded-xl transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                        ดูทั้งหมด {group.totalAvailable} โปรแกรม <span aria-hidden="true">&rarr;</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                      {group.tours.map(tour => (
                        <TourCard key={tour.id} data={tour} viewMode="grid" />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Related Cities & FAQ (Show even if empty state, to keep user engaged) */}
          <section className="mt-24 bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h2 className="text-3xl font-bold mb-4">ค้นหาเมืองอื่นใน {countryData.name}</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  หากคุณยังไม่ถูกใจทัวร์ในเมืองนี้ ลองดูโปรแกรมทัวร์ในเมืองใกล้เคียงที่ได้รับความนิยมไม่แพ้กัน
                </p>
                <div className="flex flex-wrap gap-3">
                  {countryData.popularSubRegions.map(sub => (
                    <a key={sub.name} href={`/country/${slug}/${sub.name.toLowerCase()}`} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                      {sub.name}
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <h3 className="font-bold text-xl mb-4">คำถามที่พบบ่อย (FAQ)</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                    <h4 className="font-bold text-orange-400 mb-2">ทัวร์ไป{cityName} ปกติใช้เวลากี่วัน?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">โปรแกรมทัวร์ส่วนใหญ่มักจะจัดอยู่ที่ประมาณ 4-6 วัน ขึ้นอยู่กับการพ่วงเมืองใกล้เคียงในเส้นทางเดียวกัน</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                    <h4 className="font-bold text-orange-400 mb-2">มีกรุ๊ปเหมาส่วนตัวไป{cityName}ไหม?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">มีครับ คุณสามารถให้เจ้าหน้าที่จัดโปรแกรม Private Group สำหรับครอบครัวหรือบริษัทได้ เริ่มต้นที่ 8 ท่าน</p>
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
