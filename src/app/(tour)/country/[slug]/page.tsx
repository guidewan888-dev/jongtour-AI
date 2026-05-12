'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TourCard from '@/components/tour/TourCard';
import { getSupplierInfo } from '@/config/suppliers';
import { getCountryBySlug, resolveCountryMeta } from '@/lib/geo';

interface Tour {
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
  imageUrl?: string;
  airline?: string;
}

export default function CountryPage({ params }: { params: { slug: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const countryMeta = getCountryBySlug(params.slug);
  const countryInfo = countryMeta || { slug: params.slug, name: params.slug, flagCode: '', regionKey: 'others', aliases: [] };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    if (cityParam) setActiveCity(cityParam);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tours/list?limit=3000')
      .then((response) => response.json())
      .then((payload) => {
        const allTours = (payload.tours || []) as Tour[];
        const filtered = allTours.filter((tour) => resolveCountryMeta(tour.country, tour.title).slug === countryInfo.slug);
        setTours(filtered);
      })
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [countryInfo.slug]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    tours.forEach((tour) => {
      if (tour.city) citySet.add(tour.city);
    });
    return [...citySet].sort();
  }, [tours]);

  const displayedTours = useMemo(() => {
    if (!activeCity) return tours;
    return tours.filter((tour) => tour.city === activeCity || tour.title.includes(activeCity));
  }, [tours, activeCity]);

  const supplierGroups = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    displayedTours.forEach((tour) => {
      const key = (tour.supplier || 'other').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(tour);
    });
    return Object.entries(groups).sort((a, b) => {
      const infoA = getSupplierInfo(a[0]);
      const infoB = getSupplierInfo(b[0]);
      return (infoA?.priority || 99) - (infoB?.priority || 99);
    });
  }, [displayedTours]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <nav className="text-sm text-white/80 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              หน้าหลัก
            </Link>
            <span>›</span>
            <Link href="/search" className="hover:text-white transition-colors">
              ค้นหาทัวร์
            </Link>
            <span>›</span>
            <span className="text-white font-medium">ทัวร์{countryInfo.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            {countryInfo.flagCode && (
              <img src={`https://flagcdn.com/w80/${countryInfo.flagCode}.png`} width="56" height="42" alt={countryInfo.name} className="rounded shadow-lg" />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">ทัวร์{countryInfo.name}</h1>
              <p className="text-white/90 text-base mt-1">
                {loading ? 'กำลังค้นหาโปรแกรมทัวร์...' : `พบ ${tours.length} โปรแกรม จาก ${supplierGroups.length} โฮลเซล`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {cities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-500 mb-3">กรองตามเมือง</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCity(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  !activeCity ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}
              >
                ทั้งหมด ({tours.length})
              </button>
              {cities.map((city) => {
                const cityCount = tours.filter((tour) => tour.city === city || tour.title.includes(city)).length;
                return (
                  <button
                    key={city}
                    onClick={() => setActiveCity(activeCity === city ? null : city)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      activeCity === city ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    {city} ({cityCount})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div>
                    <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-64 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                          <div className={`w-full h-full ${display.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>
                            {display.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">ดีลจาก {display.name}</h2>
                        <p className="text-sm text-slate-500">{supplierTours.length} โปรแกรม</p>
                      </div>
                    </div>
                    <Link href={`/search?supplier=${encodeURIComponent(display.name)}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                      ดูทั้งหมดจาก {display.name} →
                    </Link>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {supplierTours.map((tour) => (
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
            {countryInfo.flagCode && (
              <img src={`https://flagcdn.com/w80/${countryInfo.flagCode}.png`} width="48" height="36" alt={countryInfo.name} className="mx-auto rounded mb-4" />
            )}
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีทัวร์{countryInfo.name}</h2>
            <p className="text-slate-500 mb-6">กรุณาลองค้นหาใหม่ หรือเลือกประเทศอื่นเพิ่มเติม</p>
            <Link href="/search" className="btn-primary">
              ค้นหาทัวร์ทั้งหมด
            </Link>
          </div>
        )}

        <section className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">คำถามที่พบบ่อย - ทัวร์{countryInfo.name}</h2>
          <div className="space-y-3">
            {[
              {
                q: `ทัวร์${countryInfo.name} ใช้เวลากี่วัน?`,
                a: 'โดยทั่วไปโปรแกรมทัวร์จะอยู่ที่ประมาณ 4-8 วัน ขึ้นกับเส้นทางและสายการบิน',
              },
              {
                q: 'จองทัวร์ผ่าน Jongtour ปลอดภัยไหม?',
                a: 'ปลอดภัย เราทำงานร่วมกับโฮลเซลที่ผ่านการคัดเลือกและมีประวัติการให้บริการจริง',
              },
              {
                q: `มีกรุ๊ปเหมาส่วนตัวไป${countryInfo.name}ไหม?`,
                a: 'มี สามารถแจ้งจำนวนผู้เดินทาง งบประมาณ และช่วงวันเดินทางเพื่อให้ทีมจัดแพ็กเกจเฉพาะกลุ่มได้',
              },
            ].map((faq) => (
              <details key={faq.q} className="group bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-primary-200 open:shadow-sm transition-all">
                <summary className="flex items-center justify-between p-5 font-semibold text-slate-900 cursor-pointer list-none text-sm">
                  {faq.q}
                  <svg className="w-4 h-4 transition group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
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
