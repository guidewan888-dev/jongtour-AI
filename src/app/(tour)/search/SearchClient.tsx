'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  imageUrl: string;
}

export default function SearchClient({ initialTours }: { initialTours: TourResult[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tours, setTours] = useState<TourResult[]>(initialTours);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('recommend');

  useEffect(() => {
    fetch('/api/tours/list?limit=1000')
      .then(r => r.json())
      .then(data => {
        if (data.tours && data.tours.length > 0) {
          setTours(data.tours);
        } else if (initialTours.length > 0) {
          setTours(initialTours);
        }
      })
      .catch(() => {
        if (initialTours.length > 0) setTours(initialTours);
      })
      .finally(() => setIsLoading(false));
  }, [initialTours]);

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileFilterOpen]);

  // Derive available countries and suppliers from data
  const { countries, suppliers } = useMemo(() => {
    const cMap: Record<string, number> = {};
    const sMap: Record<string, number> = {};
    tours.forEach(t => {
      if (t.country) cMap[t.country] = (cMap[t.country] || 0) + 1;
      if (t.supplier) sMap[t.supplier] = (sMap[t.supplier] || 0) + 1;
    });
    return {
      countries: Object.entries(cMap).sort((a, b) => b[1] - a[1]),
      suppliers: Object.entries(sMap).sort((a, b) => b[1] - a[1]),
    };
  }, [tours]);

  // Apply filters + sort
  const filteredTours = useMemo(() => {
    let result = tours;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    }

    // Country filter
    if (selectedCountries.size > 0) {
      result = result.filter(t => selectedCountries.has(t.country));
    }

    // Supplier filter
    if (selectedSuppliers.size > 0) {
      result = result.filter(t => selectedSuppliers.has(t.supplier));
    }

    // Sort
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => (a.price || 999999) - (b.price || 999999));
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));

    return result;
  }, [tours, searchQuery, selectedCountries, selectedSuppliers, sortBy]);

  const toggleFilter = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCountries(new Set());
    setSelectedSuppliers(new Set());
    setSortBy('recommend');
  };

  const FilterSidebar = () => (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Supplier Filter */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">🏢 โฮลเซล</h4>
        <div className="space-y-2">
          {suppliers.map(([name, count]) => (
            <label key={name} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSuppliers.has(name)}
                  onChange={() => toggleFilter(selectedSuppliers, name, setSelectedSuppliers)}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">{name}</span>
              </div>
              <span className="text-xs text-slate-400">{count}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Country Filter */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">🌍 ประเทศ / โซน</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {countries.map(([name, count]) => (
            <label key={name} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCountries.has(name)}
                  onChange={() => toggleFilter(selectedCountries, name, setSelectedCountries)}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">{name}</span>
              </div>
              <span className="text-xs text-slate-400">{count}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Budget Filter */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">💰 งบประมาณ</h4>
        <div className="space-y-2">
          {['ไม่เกิน ฿15,000', '฿15,000 - ฿25,000', '฿25,000 - ฿40,000', '฿40,000+'].map((p, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="budget" className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">{p}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const activeFilterCount = selectedCountries.size + selectedSuppliers.size + (searchQuery ? 1 : 0);

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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="g-input pl-9 !py-2 !text-sm"
                placeholder="ค้นหาทัวร์ ประเทศ รหัส..."
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden md:block g-input !w-auto !py-2 !text-sm"
            >
              <option value="recommend">แนะนำ</option>
              <option value="price-asc">ราคา: ต่ำ→สูง</option>
              <option value="price-desc">ราคา: สูง→ต่ำ</option>
            </select>
            <button onClick={() => setIsMobileFilterOpen(true)} className="md:hidden btn-secondary text-sm !py-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              กรอง {activeFilterCount > 0 && <span className="bg-primary-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
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
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-primary-600 font-semibold hover:underline">ล้างทั้งหมด</button>
              )}
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
                {isLoading ? 'กำลังโหลด...' : `พบ ${filteredTours.length} โปรแกรม จาก ${suppliers.length} โฮลเซล`}
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="g-input !w-auto !py-1.5 !text-xs md:hidden"
              >
                <option value="recommend">แนะนำ</option>
                <option value="price-asc">ราคา: ต่ำ→สูง</option>
                <option value="price-desc">ราคา: สูง→ต่ำ</option>
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
          ) : filteredTours.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredTours.map(tour => (
                <Link key={tour.id} href={`/tour/${tour.slug}`} className="group block bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all overflow-hidden">
                  {viewMode === 'grid' ? (
                    /* Grid View — Image Card */
                    <>
                      <div className="relative h-40 bg-slate-100 overflow-hidden">
                        {tour.imageUrl ? (
                          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50"><span className="text-4xl">🌍</span></div>
                        )}
                        {tour.availableSeats > 0 && tour.availableSeats <= 10 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 เหลือ {tour.availableSeats} ที่</div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">{tour.durationDays}วัน{tour.durationNights}คืน</div>
                        <div className="absolute bottom-2 left-2 bg-white/90 text-[10px] font-semibold text-primary-700 px-2 py-0.5 rounded-full backdrop-blur-sm">{tour.supplier}</div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.code}</span>
                          <span className="text-[10px] text-slate-400">🌍 {tour.country}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">{tour.title}</h3>
                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-50">
                          <div>
                            {tour.nextDeparture !== 'N/A' && <p className="text-[11px] text-slate-400">📅 {tour.nextDeparture}</p>}
                          </div>
                          <div className="text-right">
                            {tour.price > 0 ? (
                              <><div className="text-base font-bold text-primary-600">฿{tour.price.toLocaleString()}</div><div className="text-[10px] text-slate-400">/ท่าน</div></>
                            ) : (
                              <span className="text-xs text-slate-400">สอบถามราคา</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* List View — Horizontal */
                    <div className="flex gap-4 p-4">
                      <div className="w-32 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {tour.imageUrl ? (
                          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50"><span className="text-2xl">🌍</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.code}</span>
                          <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded">{tour.supplier}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 line-clamp-2 transition-colors">{tour.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">🌍 {tour.country} • ⏱️ {tour.durationDays}วัน{tour.durationNights}คืน</p>
                      </div>
                      <div className="text-right shrink-0">
                        {tour.price > 0 ? (
                          <><div className="text-lg font-bold text-primary-600">฿{tour.price.toLocaleString()}</div><div className="text-[10px] text-slate-400">/ท่าน</div></>
                        ) : (
                          <div className="text-sm text-slate-400">สอบถามราคา</div>
                        )}
                        {tour.availableSeats > 0 && tour.availableSeats <= 15 && (
                          <div className="text-[10px] text-red-600 font-semibold mt-1">🔥 เหลือ {tour.availableSeats} ที่</div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="g-card p-16 text-center">
              <div className="g-empty">
                <span className="text-5xl mb-4">🔍</span>
                <p className="g-empty-title">ไม่พบโปรแกรมทัวร์</p>
                <p className="g-empty-desc">ลองเปลี่ยนคำค้นหาหรือเงื่อนไขตัวกรอง</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="btn-secondary mt-4 text-sm">ล้างตัวกรอง</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
