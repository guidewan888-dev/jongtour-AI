'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TourCard from '@/components/tour/TourCard';

interface Tour {
  id: string; slug: string; code: string; title: string; supplier: string;
  country: string; city: string; durationDays: number; durationNights: number;
  nextDeparture: string; price: number; availableSeats: number; imageUrl?: string;
  airline?: string;
}

const COUNTRY_MAP: Record<string, { name: string; flagCode: string }> = {
  'japan': { name: 'ญี่ปุ่น', flagCode: 'jp' },
  'south-korea': { name: 'เกาหลีใต้', flagCode: 'kr' },
  'korea': { name: 'เกาหลีใต้', flagCode: 'kr' },
  'china': { name: 'จีน', flagCode: 'cn' },
  'taiwan': { name: 'ไต้หวัน', flagCode: 'tw' },
  'vietnam': { name: 'เวียดนาม', flagCode: 'vn' },
  'hongkong': { name: 'ฮ่องกง', flagCode: 'hk' },
  'europe': { name: 'ยุโรป', flagCode: 'eu' },
  'india': { name: 'อินเดีย', flagCode: 'in' },
  'turkey': { name: 'ตุรกี', flagCode: 'tr' },
  'dubai': { name: 'ดูไบ', flagCode: 'ae' },
  'singapore': { name: 'สิงคโปร์', flagCode: 'sg' },
  'malaysia': { name: 'มาเลเซีย', flagCode: 'my' },
  'laos': { name: 'ลาว', flagCode: 'la' },
  'myanmar': { name: 'พม่า', flagCode: 'mm' },
  'cambodia': { name: 'กัมพูชา', flagCode: 'kh' },
  'russia': { name: 'รัสเซีย', flagCode: 'ru' },
  'australia': { name: 'ออสเตรเลีย', flagCode: 'au' },
  'newzealand': { name: 'นิวซีแลนด์', flagCode: 'nz' },
  'egypt': { name: 'อียิปต์', flagCode: 'eg' },
  'georgia': { name: 'จอร์เจีย', flagCode: 'ge' },
  'usa': { name: 'อเมริกา', flagCode: 'us' },
  'canada': { name: 'แคนาดา', flagCode: 'ca' },
  'uk': { name: 'อังกฤษ', flagCode: 'gb' },
  'france': { name: 'ฝรั่งเศส', flagCode: 'fr' },
  'italy': { name: 'อิตาลี', flagCode: 'it' },
  'switzerland': { name: 'สวิตเซอร์แลนด์', flagCode: 'ch' },
  'spain': { name: 'สเปน', flagCode: 'es' },
  'philippines': { name: 'ฟิลิปปินส์', flagCode: 'ph' },
  'srilanka': { name: 'ศรีลังกา', flagCode: 'lk' },
  'macau': { name: 'มาเก๊า', flagCode: 'mo' },
};

const SUPPLIER_PRIORITY = [
  { key: "let'sgo", name: "Let's Go", color: 'bg-green-600', logo: '/images/logos/download.png', priority: 1 },
  { key: "checkingroup", name: "Checkin Group", color: 'bg-teal-600', logo: '/images/logos/Check in group.jpg', priority: 2 },
  { key: "tourfactory", name: "Tour Factory", color: 'bg-purple-600', logo: '/images/logos/Tour-Factory.jpg', priority: 3 },
  { key: "go365", name: "Go365", color: 'bg-green-500', logo: '/images/logos/download.jfif', priority: 4 },
];

export default function CountryPage({ params }: { params: { slug: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const countryInfo = COUNTRY_MAP[params.slug] || { name: params.slug, flagCode: '' };

  // Read city from URL query param on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    if (cityParam) setActiveCity(cityParam);
  }, []);

  useEffect(() => {
    fetch(`/api/tours/list?country=${encodeURIComponent(countryInfo.name)}&limit=1000`)
      .then(r => r.json())
      .then(data => { if (data.tours) setTours(data.tours); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryInfo.name]);

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    tours.forEach(t => { if (t.city) citySet.add(t.city); });
    return [...citySet].sort();
  }, [tours]);

  // Filter by city
  const displayedTours = useMemo(() => {
    if (!activeCity) return tours;
    return tours.filter(t => t.city === activeCity || t.title.includes(activeCity));
  }, [tours, activeCity]);

  const supplierGroups = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    displayedTours.forEach(t => {
      const key = (t.supplier || 'other').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).sort((a, b) => {
      const infoA = SUPPLIER_PRIORITY.find(s => a[0].includes(s.key));
      const infoB = SUPPLIER_PRIORITY.find(s => b[0].includes(s.key));
      return (infoA?.priority || 99) - (infoB?.priority || 99);
    });
  }, [displayedTours]);

  const getSupplierInfo = (key: string) => {
    return SUPPLIER_PRIORITY.find(s => key.includes(s.key)) || { name: key, color: 'bg-slate-500', logo: '', priority: 99 };
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <nav className="text-sm text-white/70 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <span>›</span>
            <Link href="/search" className="hover:text-white transition-colors">ค้นหาทัวร์</Link>
            <span>›</span>
            <span className="text-white font-medium">ทัวร์{countryInfo.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            {countryInfo.flagCode && (
              <img src={`https://flagcdn.com/w80/${countryInfo.flagCode}.png`} width="56" height="42" alt={countryInfo.name} className="rounded shadow-lg" />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">ทัวร์{countryInfo.name}</h1>
              <p className="text-white/80 text-base mt-1">
                {loading ? 'กำลังค้นหาโปรแกรมทัวร์...' : `พบ ${tours.length} โปรแกรม จาก ${supplierGroups.length} โฮลเซล`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* City filter chips */}
        {cities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-500 mb-3">📍 กรองตามเมือง</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCity(null)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${!activeCity ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>ทั้งหมด ({tours.length})</button>
              {cities.map(city => {
                const cityCount = tours.filter(t => t.city === city || t.title.includes(city)).length;
                return (
                  <button key={city} onClick={() => setActiveCity(activeCity === city ? null : city)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${activeCity === city ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>
                    {city} ({cityCount})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">{[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
              <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-slate-200 rounded-xl" /><div><div className="h-5 bg-slate-200 rounded w-40 mb-2" /><div className="h-3 bg-slate-100 rounded w-24" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{[1,2,3,4].map(j => <div key={j} className="h-64 bg-slate-100 rounded-xl" />)}</div>
            </div>
          ))}</div>
        ) : tours.length > 0 ? (
          <div className="space-y-8">
            {supplierGroups.map(([supplier, supplierTours]) => {
              const display = getSupplierInfo(supplier);
              return (
                <section key={supplier} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-slate-50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                        {display.logo ? (
                          <img src={display.logo} alt={display.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className={`w-full h-full ${display.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>{display.name.slice(0, 2)}</div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">ดีลจาก {display.name}</h2>
                        <p className="text-sm text-slate-500">{supplierTours.length} โปรแกรม</p>
                      </div>
                    </div>
                    <Link href={`/search?supplier=${encodeURIComponent(display.name)}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">ดูทัวร์ทั้งหมดจาก {display.name} →</Link>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {supplierTours.map(tour => (
                        <TourCard key={tour.id} tour={{ ...tour, flagCode: countryInfo.flagCode }} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            {countryInfo.flagCode && <img src={`https://flagcdn.com/w80/${countryInfo.flagCode}.png`} width="48" height="36" alt="" className="mx-auto rounded mb-4" />}
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีทัวร์{countryInfo.name}</h2>
            <p className="text-slate-500 mb-6">กรุณากลับมาตรวจสอบใหม่ หรือค้นหาทัวร์อื่น</p>
            <Link href="/search" className="btn-primary">ค้นหาทัวร์ทั้งหมด</Link>
          </div>
        )}

        {/* FAQ */}
        <section className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">❓ คำถามที่พบบ่อย — ทัวร์{countryInfo.name}</h2>
          <div className="space-y-3">
            {[
              { q: `ทัวร์${countryInfo.name}ปกติใช้เวลากี่วัน?`, a: 'โปรแกรมทัวร์ส่วนใหญ่มักจะจัดอยู่ที่ประมาณ 4-8 วัน ขึ้นอยู่กับเส้นทาง' },
              { q: 'จองทัวร์ผ่าน Jongtour ปลอดภัยไหม?', a: 'ปลอดภัย 100% ครับ เราทำงานร่วมกับโฮลเซลล์ที่มีใบอนุญาตจากการท่องเที่ยวเท่านั้น' },
              { q: `มีกรุ๊ปเหมาส่วนตัวไป${countryInfo.name}ไหม?`, a: 'มีครับ! ติดต่อเจ้าหน้าที่เพื่อจัดโปรแกรม Private Group เริ่มต้นที่ 8 ท่าน' },
            ].map(faq => (
              <details key={faq.q} className="group bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-primary-200 open:shadow-sm transition-all">
                <summary className="flex items-center justify-between p-5 font-semibold text-slate-900 cursor-pointer list-none text-sm">
                  {faq.q}
                  <svg className="w-4 h-4 transition group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
