'use client';
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// Phase 8 Real Data Audit: Strip Mock Data
// ----------------------------------------------------------------------
async function searchAgentTours(query: string, country: string, month: string) {
  await new Promise(r => setTimeout(r, 600)); // Simulate API delay
  
  // Real data API is pending. Force Empty State to prevent Mock Data leaks.
  return [];
}

export default function AgentSearchPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [month, setMonth] = useState('');

  const fetchTours = async () => {
    setIsLoading(true);
    const data = await searchAgentTours(query, country, month);
    setTours(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTours();
  }, [country, month]); // Auto refetch on dropdown change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTours();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <a href="/dashboard" className="text-2xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></a>
              <nav className="hidden md:flex gap-6 text-sm font-bold">
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">หน้าหลัก</a>
                <a href="/bookings" className="text-slate-400 hover:text-white transition-colors">การจองทั้งหมด</a>
                <a href="/payments" className="text-slate-400 hover:text-white transition-colors">การเงิน & คอมมิชชัน</a>
                <a href="/search" className="text-white">ค้นหาทัวร์</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-tight">บริษัท ทราเวลเอ็กซ์เพิร์ท จำกัด</div>
                <div className="text-xs text-orange-400 font-bold">Gold Partner</div>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold text-slate-300">
                AG
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ค้นหาและจองทัวร์ (B2B Inventory)</h1>
            <p className="text-slate-500 mt-1">เช็กที่นั่งแบบเรียลไทม์ และเช็กเรทคอมมิชชันทันที</p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="md:col-span-2 relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหารหัสทัวร์, ชื่อโปรแกรม..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="">ทุกประเทศ</option>
                <option value="Japan">ญี่ปุ่น (Japan)</option>
                <option value="South Korea">เกาหลีใต้ (South Korea)</option>
                <option value="Europe">ยุโรป (Europe)</option>
                <option value="Taiwan">ไต้หวัน (Taiwan)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="">ทุกเดือน</option>
                <option value="2026-05">พฤษภาคม 2569</option>
                <option value="2026-06">มิถุนายน 2569</option>
              </select>
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white w-14 rounded-xl flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

          </form>
        </div>

        {/* Results Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-slate-500 font-bold">กำลังค้นหาโควต้าที่นั่ง...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">ไม่พบแพ็กเกจทัวร์</h3>
            <p className="text-slate-500">ลองเปลี่ยนเงื่อนไขการค้นหาอีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tours.map((tour) => {
              const commissionAmt = (tour.sellingPrice * tour.commissionRate) / 100;
              const netPrice = tour.sellingPrice - commissionAmt;
              const isSoldOut = tour.availability === 0;
              const isLowSeat = tour.availability > 0 && tour.availability <= 5;

              return (
                <div key={tour.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow group">
                  
                  {/* Image Section */}
                  <div className="sm:w-2/5 relative h-48 sm:h-auto">
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                      {tour.supplier}
                    </div>
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl border-2 border-red-400 rotate-[-10deg] tracking-widest uppercase">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 sm:w-3/5 flex flex-col justify-between relative">
                    
                    {/* B2B Commission Badge */}
                    {!isSoldOut && (
                      <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1 shadow-sm">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        คอมมิชชัน {tour.commissionRate}%
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-bold text-orange-600 mb-1">{tour.id}</div>
                      <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 pr-16 mb-2">{tour.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-3">
                        <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {tour.dateStr}
                      </div>

                      {/* Seat Availability */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-600">ที่นั่งคงเหลือ</span>
                          <span className={isSoldOut ? 'text-red-500' : isLowSeat ? 'text-orange-500' : 'text-emerald-600'}>
                            {tour.availability} / {tour.totalSeats}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${isSoldOut ? 'bg-red-500' : isLowSeat ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(0, (tour.availability / tour.totalSeats) * 100)}%` }}></div>
                        </div>
                        {isLowSeat && <div className="text-[10px] text-orange-600 font-bold mt-1 animate-pulse">🔥 ใกล้เต็มแล้ว!</div>}
                      </div>
                    </div>

                    {/* B2B Pricing Area */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ราคาขาย (Selling)</span>
                        <span className="text-xs font-bold text-slate-700 line-through decoration-slate-400">฿{tour.sellingPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">ส่วนลดคอมมิชชัน</span>
                        <span className="text-xs font-bold text-emerald-600">- ฿{commissionAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-900">ราคาเน็ต (Net)</span>
                        <span className="text-lg font-black text-orange-600">฿{netPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      <a href={`/booking/tour/${tour.id}?agent_mode=true`} className={`w-full block text-center font-bold py-2.5 rounded-xl transition-all shadow-sm text-sm ${
                        isSoldOut ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md'
                      }`}>
                        {isSoldOut ? 'ที่นั่งเต็มแล้ว' : 'จองให้ลูกค้า (Book Now)'}
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
