'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TourCard from '@/components/tour/TourCard';
import { SUPPLIERS, getSupplierInfo } from '@/config/suppliers';
import { getRegionByKey, getRegionData, resolveCountryMeta } from '@/lib/geo';

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

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

export default function RegionPage({ params }: { params: { slug: string[] } }) {
  const regionKey = params.slug?.[0] || 'asia';
  const regionMeta = getRegionByKey(regionKey);
  const region = getRegionData(regionMeta.key);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setActiveCountry(null);
    fetch('/api/tours/list?limit=3000')
      .then((response) => response.json())
      .then((payload) => {
        const allTours = (payload.tours || []) as Tour[];
        const scoped = allTours.filter(
          (tour) => resolveCountryMeta(tour.country, tour.title).regionKey === regionMeta.key,
        );
        setTours(scoped);
      })
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [regionMeta.key]);

  const supplierGroups = useMemo(() => {
    const filtered = activeCountry
      ? tours.filter((tour) => resolveCountryMeta(tour.country, tour.title).slug === activeCountry)
      : tours;

    const groups: Record<string, { tours: Tour[]; countries: Map<string, { name: string; slug: string }> }> = {};

    filtered.forEach((tour) => {
      const key = (tour.supplier || 'other').toLowerCase();
      if (!groups[key]) groups[key] = { tours: [], countries: new Map() };

      const geo = resolveCountryMeta(tour.country, tour.title);
      groups[key].tours.push(tour);
      groups[key].countries.set(geo.slug, { name: geo.name, slug: geo.slug });
    });

    return Object.entries(groups).sort((a, b) => {
      const infoA = getSupplierInfo(a[0]);
      const infoB = getSupplierInfo(b[0]);
      return (infoA?.priority || 99) - (infoB?.priority || 99);
    });
  }, [tours, activeCountry]);

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-2">ทัวร์{region.name}</h1>
          <p className="text-white/80 text-sm mb-1">พบ {tours.length} โปรแกรม โดย {region.desc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/search" className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all">
              ค้นหาแพ็กเกจทัวร์
            </Link>
            <Link
              href="/search?type=wholesale"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold text-sm backdrop-blur-sm border border-white/30 transition-all"
            >
              ทัวร์ราคาส่ง (Wholesale)
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-slate-50 border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
          {['ราคาคุ้มค่า', 'บริการครบวงจร', 'มั่นใจทุกเส้นทาง', 'จองง่าย ได้เร็ว', 'รีวิวจากลูกค้าจริง'].map((text) => (
            <span key={text} className="flex items-center gap-1">
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">เลือกประเทศใน{region.name}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCountry(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                !activeCountry ? 'bg-primary-500 text-white border-primary-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              ทั้งหมด
            </button>
            {region.countries.map((country) => (
              <button
                key={country.slug}
                onClick={() => setActiveCountry(country.slug)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                  activeCountry === country.slug
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}
              >
                <img src={`https://flagcdn.com/w20/${country.flagCode}.png`} width="16" height="12" alt={country.name} className="rounded-sm" />
                {country.name}
              </button>
            ))}
          </div>
        </div>

        <div className="g-card p-6 mb-8 bg-gradient-to-r from-slate-50 to-white border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">พาร์ทเนอร์โฮลเซล (Wholesale Partners)</h3>
              <p className="text-sm text-slate-500">รวมทัวร์จากโฮลเซลชั้นนำ เปรียบเทียบราคาและเงื่อนไขได้ในหน้าเดียว</p>
            </div>
            <div className="flex items-center gap-6">
              {SUPPLIERS.map((supplier) => (
                <div key={supplier.key} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                    <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{supplier.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((index) => (
              <div key={index} className="g-card p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div>
                    <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-48 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : supplierGroups.length > 0 ? (
          <div className="space-y-8">
            {supplierGroups.map(([supplier, data]) => {
              const info = getSupplierInfo(supplier);
              const countriesInGroup = [...data.countries.values()];
              return (
                <section key={supplier} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 bg-slate-50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                        {info.logo ? (
                          <img src={info.logo} alt={info.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className={`w-full h-full ${info.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>
                            {info.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ดีลจาก {info.name}</h3>
                        <p className="text-xs text-slate-500">
                          {data.tours.length} โปรแกรม โดย {countriesInGroup.map((country) => country.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <Link href={`/search?supplier=${encodeURIComponent(info.name)}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                      ดูทั้งหมดจาก {info.name} →
                    </Link>
                  </div>

                  <div className="p-5 space-y-6">
                    {countriesInGroup.map((country) => {
                      const countryTours = data.tours
                        .filter((tour) => resolveCountryMeta(tour.country, tour.title).slug === country.slug)
                        .slice(0, 4);
                      const countryMeta = region.countries.find((item) => item.slug === country.slug);
                      const totalForCountry = data.tours.filter((tour) => resolveCountryMeta(tour.country, tour.title).slug === country.slug).length;

                      return (
                        <div key={country.slug}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              {countryMeta?.flagCode && (
                                <img src={`https://flagcdn.com/w20/${countryMeta.flagCode}.png`} width="16" height="12" alt={country.name} className="rounded-sm" />
                              )}
                              {country.name}
                              <span className="text-xs text-slate-400 font-normal">({totalForCountry})</span>
                            </h4>
                            <Link href={`/country/${country.slug}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                              ดูทั้งหมด →
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {countryTours.map((tour) => (
                              <TourCard
                                key={tour.id}
                                tour={{ ...tour, flagCode: countryMeta?.flagCode || resolveCountryMeta(tour.country, tour.title).flagCode }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="g-card p-16 text-center">
            <div className="text-5xl mb-4">🌏</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              ยังไม่มีทัวร์{region.countries.find((country) => country.slug === activeCountry)?.name || region.name}
            </h2>
            <p className="text-slate-500 mb-6">กรุณาลองค้นหาใหม่ หรือติดต่อเจ้าหน้าที่เพื่อแนะนำโปรแกรมที่เหมาะกับคุณ</p>
            <Link href="/search" className="btn-primary">
              ค้นหาทัวร์ทั้งหมด
            </Link>
          </div>
        )}

        <section className="mt-12 g-card p-8 md:p-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center rounded-3xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-500" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
            <h3 className="text-2xl font-black mb-2">รับโปรโมชันก่อนใครทางไลน์</h3>
            <p className="text-emerald-100 mb-6 max-w-md mx-auto">ไม่พลาดดีลใหม่และราคาอัปเดตทุกวัน พร้อมแชตสอบถามทีมงานได้ตลอดเวลา</p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold text-base shadow-lg transition-all hover:scale-105"
            >
              แอดไลน์ @jongtour
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
