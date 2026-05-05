'use client';
import React, { useState } from 'react';
import TourCard from '@/components/tour/TourCard';
import { getRegionData, generateWholesaleGroupedTours, WHOLESALES } from '@/data/tourTaxonomy';

export default function CountrySlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const region = getRegionData(slug);
  const wholesaleGroups = generateWholesaleGroupedTours(region.name, 4);

  const [aiQuery, setAiQuery] = useState('');

  return (
    <div className="bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
      <main>
        {/* 1. Country Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0">
            <img src={region.heroImage} alt={region.name} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
            <span className="text-orange-500 font-bold tracking-wider uppercase text-sm md:text-base mb-4 block drop-shadow-md">
              {region.type === 'continent' ? 'Discover Continent' : 'Explore Country'}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
              ทัวร์{region.name}
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow font-medium">
              {region.description}
            </p>

            {/* 2. AI Context Search */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-xl shadow-inner flex flex-col md:flex-row gap-2 p-2">
                <div className="flex-1 relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder-slate-400 outline-none" 
                    placeholder={`ให้ AI หาทัวร์${region.name} เช่น 'ไป${region.name}ช่วงปีใหม่ งบ 4 หมื่น'`} 
                  />
                </div>
                <a 
                  href={`/ai-search?q=${encodeURIComponent(aiQuery)}&context=${region.slug}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-all flex items-center justify-center whitespace-nowrap"
                >
                  ค้นหาด้วย AI
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24">
          
          {/* 3. Popular Sub-regions / Cities */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {region.type === 'continent' ? 'ประเทศยอดฮิตในภูมิภาคนี้' : 'เมืองท่องเที่ยวยอดฮิต'}
                </h2>
                <p className="text-slate-500">เลือกดูโปรแกรมทัวร์ตามจุดหมายปลายทางที่คุณสนใจ</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {region.popularSubRegions.map(sub => (
                <a key={sub.name} href={`/search?${region.type === 'continent' ? 'country' : 'city'}=${sub.name}`} className="group relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-square shadow-sm hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 p-5 z-20 w-full">
                    <h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-md">{sub.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* 4. Tour Listing Grouped by Wholesale */}
          <section className="space-y-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">จัดเต็มทุกโปรแกรมทัวร์{region.name}</h2>
              <p className="text-slate-600 text-lg">เรารวบรวมทัวร์จากโฮลเซลล์ชั้นนำที่เชื่อถือได้มากที่สุด มาให้คุณเปรียบเทียบในที่เดียว</p>
            </div>

            {WHOLESALES.map(supplier => {
              const group = wholesaleGroups[supplier];
              if (!group || group.tours.length === 0) return null;

              return (
                <div key={supplier} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200">
                        <span className="font-black text-slate-400 text-xs text-center leading-none">{supplier}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                          จัดโดย {supplier}
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified Wholesale"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </h3>
                        <p className="text-slate-500 mt-1 font-medium text-sm">ทัวร์คุณภาพ การันตีออกเดินทาง</p>
                      </div>
                    </div>
                    <a href={`/search?supplier=${supplier}&query=${region.name}`} className="bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold py-2 px-5 rounded-xl transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                      ดูทั้งหมด {group.totalAvailable} โปรแกรม <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.tours.map(tour => (
                      <TourCard key={tour.id} data={tour} viewMode="grid" />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* 5. Travel Guide & FAQ */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">ข้อมูลน่ารู้ก่อนเที่ยว{region.name}</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  เตรียมตัวให้พร้อมก่อนเดินทาง อ่านคู่มือและข้อควรรู้ต่างๆ เพื่อให้ทริปของคุณราบรื่นที่สุด
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4">บริการเสริมจาก Jongtour</h4>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> บริการยื่นวีซ่าครบวงจร</li>
                    <li className="flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> ประกันการเดินทางต่างประเทศ</li>
                    <li className="flex items-center gap-2"><svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> บริการเช่า Pocket WiFi / Sim</li>
                  </ul>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="space-y-4">
                  {region.faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:border-orange-200 open:shadow-sm transition-all duration-300">
                      <summary className="flex items-center justify-between p-6 font-bold text-slate-900 cursor-pointer list-none">
                        {faq.q}
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                  {/* Default Extra FAQ */}
                  <details className="group bg-slate-50 rounded-2xl border border-slate-100 open:bg-white open:border-orange-200 open:shadow-sm transition-all duration-300">
                    <summary className="flex items-center justify-between p-6 font-bold text-slate-900 cursor-pointer list-none">
                      จองทัวร์ผ่าน Jongtour ปลอดภัยไหม?
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                      ปลอดภัย 100% ครับ เราจดทะเบียนบริษัทถูกต้องตามกฎหมาย และทำงานร่วมกับโฮลเซลล์ที่มีใบอนุญาตจากการท่องเที่ยวเท่านั้น
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
