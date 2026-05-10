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
  airline: string;
  sourceUrl?: string;
}

// Friendly display names for wholesalers (fallback for initialTours from server)
const SUPPLIER_DISPLAY: Record<string, string> = {
  worldconnection: 'World Connection',
  oneworldtour: 'World Connection',
  letsgo: "Let's Go",
  "let'sgo": "Let's Go",
  bestintl: 'Best International',
  bestinternational: 'Best International',
  gs25: 'GS25 Travel',
  itravels: 'iTravels',
  checkingroup: 'Check-in Group',
  tourfactory: 'Tour Factory',
};

type BudgetRange = '' | '0-15000' | '15000-25000' | '25000-40000' | '40000+';

const CONTINENT_MAP: Record<string, { name: string; countries: Record<string, { name: string; flagCode: string; cities: string[] }> }> = {
  asia: { name: 'เอเชีย', countries: {
    'ญี่ปุ่น': { name: 'ญี่ปุ่น', flagCode: 'jp', cities: ['โตเกียว','โอซาก้า','ฮอกไกโด','เกียวโต','ฟุกุโอกะ','นาโกย่า','โอกินาว่า'] },
    'จีน': { name: 'จีน', flagCode: 'cn', cities: ['เฉิงตู','จางเจียเจี้ย','คุนหมิง','ปักกิ่ง','เซี่ยงไฮ้','กวางเจา','กุ้ยหลิน','ซีอาน','ฉงชิ่ง','ชิงเต่า'] },
    'เกาหลี': { name: 'เกาหลีใต้', flagCode: 'kr', cities: ['โซล','ปูซาน','เชจู'] },
    'ไต้หวัน': { name: 'ไต้หวัน', flagCode: 'tw', cities: ['ไทเป','เกาสง'] },
    'เวียดนาม': { name: 'เวียดนาม', flagCode: 'vn', cities: ['ดานัง','ฮานอย','โฮจิมินห์','ซาปา'] },
    'ฮ่องกง': { name: 'ฮ่องกง', flagCode: 'hk', cities: [] },
    'สิงคโปร์': { name: 'สิงคโปร์', flagCode: 'sg', cities: [] },
    'มาเลเซีย': { name: 'มาเลเซีย', flagCode: 'my', cities: ['กัวลาลัมเปอร์'] },
    'อินเดีย': { name: 'อินเดีย', flagCode: 'in', cities: ['เดลี','แคชเมียร์'] },
    'กัมพูชา': { name: 'กัมพูชา', flagCode: 'kh', cities: [] },
    'พม่า': { name: 'พม่า', flagCode: 'mm', cities: [] },
    'ลาว': { name: 'ลาว', flagCode: 'la', cities: [] },
    'ฟิลิปปินส์': { name: 'ฟิลิปปินส์', flagCode: 'ph', cities: [] },
  }},
  europe: { name: 'ยุโรป', countries: {
    'อังกฤษ': { name: 'อังกฤษ', flagCode: 'gb', cities: ['ลอนดอน','แมนเชสเตอร์'] },
    'ฝรั่งเศส': { name: 'ฝรั่งเศส', flagCode: 'fr', cities: ['ปารีส'] },
    'อิตาลี': { name: 'อิตาลี', flagCode: 'it', cities: ['โรม','มิลาน','เวนิส','ฟลอเรนซ์'] },
    'สวิตเซอร์แลนด์': { name: 'สวิตเซอร์แลนด์', flagCode: 'ch', cities: ['ซูริค','ลูเซิร์น'] },
    'เยอรมนี': { name: 'เยอรมนี', flagCode: 'de', cities: ['มิวนิค','แฟรงก์เฟิร์ต','เบอร์ลิน'] },
    'สเปน': { name: 'สเปน', flagCode: 'es', cities: ['บาร์เซโลน่า','มาดริด'] },
    'เนเธอร์แลนด์': { name: 'เนเธอร์แลนด์', flagCode: 'nl', cities: ['อัมสเตอร์ดัม'] },
    'ออสเตรีย': { name: 'ออสเตรีย', flagCode: 'at', cities: ['เวียนนา'] },
    'สแกนดิเนเวีย': { name: 'สแกนดิเนเวีย', flagCode: 'se', cities: ['สตอกโฮล์ม','ออสโล','โคเปนเฮเกน','เฮลซิงกิ'] },
    'บอลติก': { name: 'บอลติก', flagCode: 'lv', cities: [] },
    'นอร์เวย์': { name: 'นอร์เวย์', flagCode: 'no', cities: ['ออสโล'] },
    'สวีเดน': { name: 'สวีเดน', flagCode: 'se', cities: ['สตอกโฮล์ม'] },
    'ฟินแลนด์': { name: 'ฟินแลนด์', flagCode: 'fi', cities: ['เฮลซิงกิ'] },
    'เดนมาร์ก': { name: 'เดนมาร์ก', flagCode: 'dk', cities: ['โคเปนเฮเกน'] },
    'เบลเยียม': { name: 'เบลเยียม', flagCode: 'be', cities: ['บรัสเซลส์'] },
    'เช็ก': { name: 'เช็ก', flagCode: 'cz', cities: ['ปราก'] },
    'ฮังการี': { name: 'ฮังการี', flagCode: 'hu', cities: ['บูดาเปสต์'] },
    'โปรตุเกส': { name: 'โปรตุเกส', flagCode: 'pt', cities: ['ลิสบอน'] },
    'ยุโรป': { name: 'ยุโรป (รวม)', flagCode: 'eu', cities: [] },
  }},
  'middle-east': { name: 'ตะวันออกกลาง', countries: {
    'ตุรกี': { name: 'ตุรกี', flagCode: 'tr', cities: ['อิสตันบูล','คัปปาโดเกีย'] },
    'อียิปต์': { name: 'อียิปต์', flagCode: 'eg', cities: ['ไคโร'] },
    'จอร์แดน': { name: 'จอร์แดน', flagCode: 'jo', cities: [] },
    'ดูไบ': { name: 'ดูไบ', flagCode: 'ae', cities: [] },
  }},
  americas: { name: 'อเมริกา', countries: {
    'อเมริกา': { name: 'อเมริกา', flagCode: 'us', cities: ['นิวยอร์ก','ลอสแอนเจลิส'] },
    'แคนาดา': { name: 'แคนาดา', flagCode: 'ca', cities: [] },
  }},
  oceania: { name: 'โอเชียเนีย', countries: {
    'ออสเตรเลีย': { name: 'ออสเตรเลีย', flagCode: 'au', cities: ['ซิดนีย์','เมลเบิร์น'] },
    'นิวซีแลนด์': { name: 'นิวซีแลนด์', flagCode: 'nz', cities: [] },
  }},
  others: { name: 'อื่นๆ', countries: {
    'จอร์เจีย': { name: 'จอร์เจีย', flagCode: 'ge', cities: [] },
    'ภูฏาน': { name: 'ภูฏาน', flagCode: 'bt', cities: [] },
    'ศรีลังกา': { name: 'ศรีลังกา', flagCode: 'lk', cities: [] },
  }},
};

function getContinent(country: string): string | null {
  for (const [key, cont] of Object.entries(CONTINENT_MAP)) {
    if (cont.countries[country]) return key;
  }
  return null;
}

export default function SearchClient() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tours, setTours] = useState<TourResult[]>([]);

  // Filter states — 5 levels
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const [selectedContinents, setSelectedContinents] = useState<Set<string>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange>('');
  const [sortBy, setSortBy] = useState('recommend');



  useEffect(() => {
    fetch('/api/tours/list?limit=1000')
      .then(r => r.json())
      .then(data => {
        if (data.tours && data.tours.length > 0) {
          setTours(data.tours);
        }
      })
      .catch(() => { /* API failed, keep empty */ })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileFilterOpen]);

  // Derive available filters from data
  const allContinentCountries = useMemo(() =>
    Object.values(CONTINENT_MAP).flatMap(c => Object.values(c.countries))
  , []);

  const { suppliers, continentCounts, countryCounts, cityCounts } = useMemo(() => {
    const sMap: Record<string, number> = {};
    const contMap: Record<string, number> = {};
    const cMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    if (!Array.isArray(tours)) return { suppliers: [], continentCounts: contMap, countryCounts: cMap, cityCounts: cityMap };
    tours.forEach(t => {
      if (t.supplier) sMap[t.supplier] = (sMap[t.supplier] || 0) + 1;
      if (t.country) {
        cMap[t.country] = (cMap[t.country] || 0) + 1;
        const cont = getContinent(t.country);
        if (cont) contMap[cont] = (contMap[cont] || 0) + 1;
      }
      if (t.city) cityMap[t.city] = (cityMap[t.city] || 0) + 1;
      // Also extract city keywords from title
      allContinentCountries.forEach(cc => {
        (cc.cities || []).forEach(city => {
          if (city && t.title && t.title.includes(city)) {
            cityMap[city] = (cityMap[city] || 0) + 1;
          }
        });
      });
    });
    return {
      suppliers: Object.entries(sMap).sort((a, b) => b[1] - a[1]),
      continentCounts: contMap,
      countryCounts: cMap,
      cityCounts: cityMap,
    };
  }, [tours, allContinentCountries]);

  // Filtered countries based on selected continents
  const visibleCountries = useMemo(() => {
    if (selectedContinents.size === 0) return Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    const allowed = new Set<string>();
    selectedContinents.forEach(cont => {
      const c = CONTINENT_MAP[cont];
      if (c) Object.keys(c.countries).forEach(k => allowed.add(k));
    });
    return Object.entries(countryCounts).filter(([k]) => allowed.has(k)).sort((a, b) => b[1] - a[1]);
  }, [countryCounts, selectedContinents]);

  // Filtered cities based on selected countries — include ALL city data from tours too
  const visibleCities = useMemo(() => {
    const citySet = new Set<string>();
    // 1. Add cities from CONTINENT_MAP
    const targets = selectedCountries.size > 0 ? [...selectedCountries] : visibleCountries.map(([k]) => k);
    targets.forEach(country => {
      for (const cont of Object.values(CONTINENT_MAP)) {
        const cc = cont.countries[country];
        if (cc) cc.cities.forEach(c => { if (c && cityCounts[c]) citySet.add(c); });
      }
    });
    // 2. Also add ALL cities that appear in actual tour data
    Object.keys(cityCounts).forEach(city => {
      if (city && city.length > 1) citySet.add(city);
    });
    return [...citySet].map(c => [c, cityCounts[c] || 0] as [string, number]).filter(([,count]) => count > 0).sort((a, b) => b[1] - a[1]);
  }, [cityCounts, selectedCountries, visibleCountries]);

  // Apply filters + sort
  const filteredTours = useMemo(() => {
    let result = tours || [];

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

    // Continent filter
    if (selectedContinents.size > 0) {
      result = result.filter(t => {
        const cont = getContinent(t.country);
        return cont ? selectedContinents.has(cont) : false;
      });
    }

    // Country filter
    if (selectedCountries.size > 0) {
      result = result.filter(t => selectedCountries.has(t.country));
    }

    // City filter
    if (selectedCities.size > 0) {
      result = result.filter(t => {
        if (t.city && selectedCities.has(t.city)) return true;
        return [...selectedCities].some(city => t.title.includes(city));
      });
    }

    // Supplier filter
    if (selectedSuppliers.size > 0) {
      result = result.filter(t => selectedSuppliers.has(t.supplier));
    }

    // Budget filter
    if (selectedBudget) {
      result = result.filter(t => {
        if (t.price <= 0) return false;
        switch (selectedBudget) {
          case '0-15000': return t.price <= 15000;
          case '15000-25000': return t.price >= 15000 && t.price <= 25000;
          case '25000-40000': return t.price >= 25000 && t.price <= 40000;
          case '40000+': return t.price >= 40000;
          default: return true;
        }
      });
    }

    // Sort
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => (a.price || 999999) - (b.price || 999999));
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));

    return result;
  }, [tours, searchQuery, selectedContinents, selectedCountries, selectedCities, selectedSuppliers, selectedBudget, sortBy]);

  const toggleFilter = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSuppliers(new Set());
    setSelectedContinents(new Set());
    setSelectedCountries(new Set());
    setSelectedCities(new Set());
    setSelectedBudget('');
    setSortBy('recommend');
  };



  const budgetOptions: { label: string; value: BudgetRange }[] = [
    { label: 'ไม่เกิน ฿15,000', value: '0-15000' },
    { label: '฿15,000 - ฿25,000', value: '15000-25000' },
    { label: '฿25,000 - ฿40,000', value: '25000-40000' },
    { label: '฿40,000+', value: '40000+' },
  ];

  const CheckboxItem = ({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
        <span className="text-sm text-slate-600 group-hover:text-slate-900">{label}</span>
      </div>
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  );

  const FilterSidebar = () => (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* 1. Supplier */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">🏢 โฮลเซล</h4>
        <div className="space-y-2">
          {suppliers.map(([name, count]) => (
            <CheckboxItem key={name} checked={selectedSuppliers.has(name)} onChange={() => toggleFilter(selectedSuppliers, name, setSelectedSuppliers)} label={name} count={count} />
          ))}
        </div>
      </div>
      <hr className="border-slate-200" />

      {/* 2. Continent */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">🌏 ทวีป</h4>
        <div className="space-y-2">
          {Object.entries(CONTINENT_MAP).map(([key, cont]) => {
            const count = continentCounts[key] || 0;
            if (count === 0) return null;
            return <CheckboxItem key={key} checked={selectedContinents.has(key)} onChange={() => { toggleFilter(selectedContinents, key, setSelectedContinents); setSelectedCountries(new Set()); setSelectedCities(new Set()); }} label={cont.name} count={count} />;
          })}
        </div>
      </div>
      <hr className="border-slate-200" />

      {/* 3. Country */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">🏳️ ประเทศ</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {visibleCountries.map(([name, count]) => (
            <CheckboxItem key={name} checked={selectedCountries.has(name)} onChange={() => { toggleFilter(selectedCountries, name, setSelectedCountries); setSelectedCities(new Set()); }} label={name} count={count} />
          ))}
        </div>
      </div>
      <hr className="border-slate-200" />

      {/* 4. City */}
      {visibleCities.length > 0 && (
        <>
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm">🏙️ เมือง</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {visibleCities.map(([name, count]) => (
                <CheckboxItem key={name} checked={selectedCities.has(name)} onChange={() => toggleFilter(selectedCities, name, setSelectedCities)} label={name} count={count} />
              ))}
            </div>
          </div>
          <hr className="border-slate-200" />
        </>
      )}

      {/* 5. Budget */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 text-sm">💰 งบประมาณ</h4>
        <div className="space-y-2">
          {budgetOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="budget" checked={selectedBudget === opt.value} onChange={() => setSelectedBudget(selectedBudget === opt.value ? '' : opt.value)} className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const activeFilterCount = selectedSuppliers.size + selectedContinents.size + selectedCountries.size + selectedCities.size + (searchQuery ? 1 : 0) + (selectedBudget ? 1 : 0);



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
          <div className="sticky top-40 g-card p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                  <div className="h-40 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredTours.map(tour => {
                // Scraper tours (with sourceUrl) use /tour/s/CODE, wholesale uses /tour/SLUG
                const isScraperTour = !!tour.sourceUrl;
                const tourHref = isScraperTour ? `/tour/s/${tour.code.toLowerCase()}` : `/tour/${tour.slug}`;
                const supplierLabel = tour.supplier;
                return (
                <Link key={tour.id} href={tourHref} className="group block bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-lg transition-all overflow-hidden">
                  {viewMode === 'grid' ? (
                    /* Grid View — Image Card */
                    <>
                      <div className="relative aspect-[3/4] bg-white overflow-hidden">
                        {tour.imageUrl ? (
                          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50"><span className="text-4xl">🌍</span></div>
                        )}
                        {tour.availableSeats > 0 && tour.availableSeats <= 10 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">🔥 เหลือ {tour.availableSeats} ที่</div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">{tour.durationDays}วัน{tour.durationNights}คืน</div>
                        <div className="absolute bottom-2 left-2 bg-white/90 text-[10px] font-semibold text-orange-700 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">{supplierLabel}</div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.code}</span>
                          <span className="text-[10px] text-slate-400">📍 {tour.country}</span>
                          {tour.airline && <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">✈ {tour.airline}</span>}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">{tour.title}</h3>
                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-50">
                          <div>
                            {tour.nextDeparture !== 'N/A' && <p className="text-[11px] text-emerald-600 font-medium">📅 เริ่ม {tour.nextDeparture}</p>}
                          </div>
                          <div className="text-right">
                            {tour.price > 0 ? (
                              <><div className="text-base font-bold text-orange-600">฿{tour.price.toLocaleString()}</div><div className="text-[10px] text-slate-400">/ท่าน</div></>
                            ) : (
                              <span className="text-xs text-orange-500 font-semibold">ดูรายละเอียด →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* List View — Horizontal */
                    <div className="flex gap-4 p-4">
                      <div className="w-36 h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {tour.imageUrl ? (
                          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50"><span className="text-2xl">🌍</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.code}</span>
                          <span className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">{supplierLabel}</span>
                          {tour.airline && <span className="text-[10px] text-blue-500 font-medium">✈ {tour.airline}</span>}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 line-clamp-2 transition-colors">{tour.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>📍 {tour.country}</span>
                          <span>⏱️ {tour.durationDays}วัน{tour.durationNights}คืน</span>
                          {tour.nextDeparture !== 'N/A' && <span>📅 {tour.nextDeparture}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col justify-center">
                        {tour.price > 0 ? (
                          <><div className="text-lg font-bold text-orange-600">฿{tour.price.toLocaleString()}</div><div className="text-[10px] text-slate-400">/ท่าน</div></>
                        ) : (
                          <span className="text-sm font-semibold text-orange-500">ดูรายละเอียด →</span>
                        )}
                        {tour.availableSeats > 0 && tour.availableSeats <= 15 && (
                          <div className="text-[10px] text-red-600 font-semibold mt-1">🔥 เหลือ {tour.availableSeats} ที่</div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
                );
              })}
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
