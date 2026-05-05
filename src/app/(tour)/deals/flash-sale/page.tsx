'use client';
import React, { useState, useEffect } from 'react';
import FlashSaleCard from '@/components/tour/FlashSaleCard';
import { generateWholesaleGroupedTours, WHOLESALES } from '@/data/tourTaxonomy';

export default function FlashSalePage() {
  const [aiQuery, setAiQuery] = useState('');
  
  // Create mock flash sale tours using our generator
  const wholesaleGroups = generateWholesaleGroupedTours('ทัวร์ไฟไหม้รวมประเทศ', 4);
  // Modify generated data to ensure they look like flash sales
  Object.keys(wholesaleGroups).forEach(ws => {
    wholesaleGroups[ws].tours.forEach(tour => {
      tour.isFlashSale = true;
      tour.availableSeats = Math.floor(Math.random() * 5) + 1; // 1-5 seats
      tour.price = tour.price * 0.7; // 30% off
    });
  });

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else { hours = 23; }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-50 selection:bg-red-200 selection:text-red-900">
      <main>
        {/* 1. Orange Hero & Countdown */}
        <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-red-700">
          {/* Dynamic background patterns */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,100 L100,0 Z" fill="white" />
              <path d="M0,100 L100,0 L0,0 Z" fill="black" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm tracking-wider uppercase mb-6 shadow-sm border border-white/30">
              <svg className="w-5 h-5 animate-pulse text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
              Jongtour Flash Sale
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
              ทัวร์ไฟไหม้ <span className="text-yellow-300">ลดสูงสุด 60%</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 font-medium">
              ดีลหลุดจอง บินด่วนภายในสัปดาห์นี้ โอกาสสุดท้ายในราคาที่ถูกที่สุด!
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-4 mb-12">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl w-20 h-24 flex flex-col items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/70 uppercase tracking-widest mt-1">Hours</span>
              </div>
              <div className="text-3xl font-black text-white/50 self-center -mt-4">:</div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl w-20 h-24 flex flex-col items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/70 uppercase tracking-widest mt-1">Mins</span>
              </div>
              <div className="text-3xl font-black text-white/50 self-center -mt-4">:</div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl w-20 h-24 flex flex-col items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-yellow-300 animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/70 uppercase tracking-widest mt-1">Secs</span>
              </div>
            </div>

            {/* 2. AI Search for Flash Sale */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2 relative z-20">
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder-slate-400 outline-none" 
                  placeholder="หาโปรไฟไหม้ที่ไหน? เช่น 'ญี่ปุ่น วันเสาร์นี้'" 
                />
              </div>
              <a 
                href={`/ai-search?q=${encodeURIComponent(aiQuery)}&filter=flash-sale`}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all flex items-center justify-center whitespace-nowrap"
              >
                ให้ AI ค้นหาด่วน
              </a>
            </div>

          </div>
        </section>

        {/* 3. Filters */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
              <span className="text-sm font-bold text-slate-800 shrink-0 mr-2">ตัวกรองด่วน:</span>
              {['ทั้งหมด', 'ญี่ปุ่นไฟไหม้', 'ยุโรปหลุดจอง', 'บินพรุ่งนี้!', 'ลดเกิน 50%', 'เหลือ 1-2 ที่'].map((filter, idx) => (
                <button key={filter} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${idx === 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

          {/* 4. Tour Listings by Wholesale */}
          <section className="space-y-16">
            {WHOLESALES.map(supplier => {
              const group = wholesaleGroups[supplier];
              if (!group || group.tours.length === 0) return null;

              return (
                <div key={supplier}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 border-2 border-red-100 shadow-sm">
                        <span className="font-black text-red-500 text-xs text-center leading-none">{supplier}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                          ดีลหลุดจองจาก {supplier}
                        </h3>
                        <p className="text-red-500 mt-1 font-bold text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                          ต้องตัดสินใจด่วน!
                        </p>
                      </div>
                    </div>
                    <a href={`/search?supplier=${supplier}&tag=flash-sale`} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-5 rounded-xl transition-colors text-sm flex items-center gap-2 whitespace-nowrap border border-red-100">
                      ดูทั้งหมด {group.totalAvailable} ดีลไฟไหม้ <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.tours.map(tour => (
                      <FlashSaleCard key={tour.id} data={tour} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* 5. FAQ */}
          <section className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">ข้อควรรู้ก่อนจองทัวร์ไฟไหม้</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ทัวร์ไฟไหม้คืออะไร ทำไมถึงถูก?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">คือที่นั่งหลุดจอง หรือโฮลเซลล์ขายไม่หมดก่อนวันเดินทาง จึงนำมาลดราคาพิเศษเพื่อปิดกรุ๊ป คุณภาพและการบริการเหมือนจองราคาเต็มทุกประการ</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  เงื่อนไขการชำระเงิน?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">เนื่องจากเป็นโปรแกรมที่ต้องเดินทางด่วน ลูกค้าต้องชำระเงิน **เต็มจำนวน** ทันทีหลังได้รับการคอนเฟิร์มที่นั่ง ไม่สามารถมัดจำได้</p>
              </div>
            </div>
          </section>

          {/* 6. CTA */}
          <section className="text-center py-8">
            <div className="inline-flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">กลัวพลาดดีลเด็ด?</h3>
              <p className="text-slate-600 mb-6">เข้าร่วมกลุ่ม LINE VIP อัปเดตโปรไฟไหม้ก่อนใครทุกวัน</p>
              <a href="https://lin.ee/jongtour" className="bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 10.364c0-4.398-4.237-7.973-9.455-7.973-5.216 0-9.454 3.575-9.454 7.973 0 3.963 3.42 7.333 8.01 7.893.313.064.738.197.846.678.097.432-.03.882-.03.882s-.132.793-.162.977c-.038.232-.178.913.805.498 1.154-.486 6.223-3.666 8.163-6.07 1.01-1.238 1.278-2.678 1.278-4.858z"/></svg>
                เข้ากลุ่ม LINE แจ้งเตือนโปรไฟไหม้
              </a>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
