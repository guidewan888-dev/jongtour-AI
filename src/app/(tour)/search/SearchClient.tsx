'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TourResult {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: string;
  country: string;
  city: string;
  durationDays: number;
  durationNights: number;
  nextDeparture: string;
  price: number;
  availableSeats: number;
}

export default function SearchClient({ initialTours }: { initialTours: TourResult[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileFilterOpen]);

  const FilterSidebar = () => (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Quick Toggles */}
      <div className="space-y-2">
        <label className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer">
          <span className="text-sm font-bold text-red-700 flex items-center gap-2">🔥 ทัวร์ไฟไหม้</span>
          <input type="checkbox" className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
        </label>
        <label className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer">
          <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">✅ คอนเฟิร์มเดินทาง</span>
          <input type="checkbox" className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" defaultChecked />
        </label>
      </div>

      <hr className="border-slate-200" />

      {/* Country */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">ประเทศ / โซน</h4>
        <div className="space-y-2">
          {['🇯🇵 ญี่ปุ่น', '🇰🇷 เกาหลีใต้', '🇨🇳 จีน', '🇪🇺 ยุโรป', '🇻🇳 เวียดนาม'].map(c => (
            <label key={c} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Budget */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">งบประมาณ</h4>
        <div className="space-y-2">
          {['ไม่เกิน ฿15,000', '฿15,000 - ฿25,000', '฿25,000 - ฿40,000', '฿40,000+'].map((p, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="budget" className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">{p}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Duration */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">ระยะเวลา</h4>
        <div className="flex flex-wrap gap-2">
          {['1-3 วัน', '4-5 วัน', '6-8 วัน', '9+ วัน'].map(d => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" />
              <div className="g-chip text-xs peer-checked:!bg-primary-50 peer-checked:!text-primary-700 peer-checked:!border-primary-500">{d}</div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sticky Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="g-container py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input type="text" className="g-input pl-9 !py-2 !text-sm" placeholder="ค้นหาทัวร์..." />
            </div>
            <select className="hidden md:block g-input !w-auto !py-2 !text-sm">
              <option>ทุกเดือน</option>
            </select>
            <button className="btn-primary text-sm !py-2 hidden md:block">ค้นหา</button>
            <button onClick={() => setIsMobileFilterOpen(true)} className="md:hidden btn-secondary text-sm !py-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              กรอง
            </button>
          </div>
        </div>
      </div>

      <div className="g-container py-8 flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-40 g-card p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-900">ตัวกรอง</h3>
              <button className="text-xs text-primary-600 font-semibold hover:underline">ล้างทั้งหมด</button>
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
                <h3 className="font-bold text-slate-900">ตัวกรอง</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-5"><FilterSidebar /></div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">ค้นหาทัวร์</h1>
              <p className="text-sm text-slate-500 mt-1">
                พบ {isLoading ? '...' : initialTours.length} โปรแกรม
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
              <select className="g-input !w-auto !py-1.5 !text-xs">
                <option>แนะนำ (AI)</option>
                <option>ราคา: ต่ำ→สูง</option>
                <option>ราคา: สูง→ต่ำ</option>
                <option>วันเดินทางล่าสุด</option>
              </select>
            </div>
          </div>

          {/* Tour Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="g-card p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : initialTours.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {initialTours.map(tour => (
                <Link key={tour.id} href={`/tour/${tour.slug}`} className="g-card-interactive p-5 block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{tour.code}</span>
                        <span className="text-xs text-primary-600 font-semibold">{tour.supplier}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{tour.title}</h3>
                      <p className="text-xs text-slate-500">
                        {tour.country} {tour.city && `• ${tour.city}`} • {tour.durationDays}วัน{tour.durationNights}คืน
                      </p>
                      <p className="text-xs text-slate-400 mt-1">เดินทาง: {tour.nextDeparture}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {tour.price > 0 ? (
                        <>
                          <div className="text-lg font-bold text-primary-600">฿{tour.price.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">/ท่าน</div>
                        </>
                      ) : (
                        <div className="text-sm text-slate-400">สอบถามราคา</div>
                      )}
                      {tour.availableSeats > 0 && (
                        <div className="text-xs text-emerald-600 font-semibold mt-1">เหลือ {tour.availableSeats} ที่</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="g-card p-16 text-center">
              <div className="g-empty">
                <span className="text-5xl mb-4">🔍</span>
                <p className="g-empty-title">ไม่พบโปรแกรมทัวร์</p>
                <p className="g-empty-desc">ลองเปลี่ยนคำค้นหาหรือเงื่อนไขตัวกรอง</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
