'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

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
}

// Map URL slug → Thai city name for keyword search
const CITY_MAP: Record<string, { name: string; parentSlug: string; parentName: string }> = {
  // Japan cities
  'tokyo': { name: 'โตเกียว', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'hokkaido': { name: 'ฮอกไกโด', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'osaka': { name: 'โอซาก้า', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'kyoto': { name: 'เกียวโต', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'nagoya': { name: 'นาโกย่า', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'fukuoka': { name: 'ฟูกูโอกะ', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  'okinawa': { name: 'โอกินาว่า', parentSlug: 'japan', parentName: 'ญี่ปุ่น' },
  // Korea cities
  'seoul': { name: 'โซล', parentSlug: 'korea', parentName: 'เกาหลีใต้' },
  'busan': { name: 'ปูซาน', parentSlug: 'korea', parentName: 'เกาหลีใต้' },
  'jeju': { name: 'เชจู', parentSlug: 'korea', parentName: 'เกาหลีใต้' },
  // China cities
  'beijing': { name: 'ปักกิ่ง', parentSlug: 'china', parentName: 'จีน' },
  'shanghai': { name: 'เซี่ยงไฮ้', parentSlug: 'china', parentName: 'จีน' },
  'zhangjiajie': { name: 'จางเจียเจี้ย', parentSlug: 'china', parentName: 'จีน' },
  'chengdu': { name: 'เฉิงตู', parentSlug: 'china', parentName: 'จีน' },
  'kunming': { name: 'คุนหมิง', parentSlug: 'china', parentName: 'จีน' },
  'xian': { name: 'ซีอาน', parentSlug: 'china', parentName: 'จีน' },
  'chongqing': { name: 'ฉงชิ่ง', parentSlug: 'china', parentName: 'จีน' },
  'guangzhou': { name: 'กวางเจา', parentSlug: 'china', parentName: 'จีน' },
  'hongkong': { name: 'ฮ่องกง', parentSlug: 'hongkong', parentName: 'ฮ่องกง' },
  // Taiwan cities
  'taipei': { name: 'ไทเป', parentSlug: 'taiwan', parentName: 'ไต้หวัน' },
  // Vietnam cities
  'hanoi': { name: 'ฮานอย', parentSlug: 'vietnam', parentName: 'เวียดนาม' },
  'danang': { name: 'ดานัง', parentSlug: 'vietnam', parentName: 'เวียดนาม' },
  'hochiminh': { name: 'โฮจิมินห์', parentSlug: 'vietnam', parentName: 'เวียดนาม' },
};

const SUPPLIER_DISPLAY: Record<string, { name: string; color: string }> = {
  "let'sgo": { name: "Let's Go Group", color: 'bg-blue-50 border-blue-200 text-blue-700' },
  'checkingroup': { name: 'Check-in Group', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  'tourfactory': { name: 'Tour Factory', color: 'bg-purple-50 border-purple-200 text-purple-700' },
};

export default function CityPage({ params }: { params: { slug: string; city: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const cityInfo = CITY_MAP[params.city] || {
    name: params.city.charAt(0).toUpperCase() + params.city.slice(1).replace(/-/g, ' '),
    parentSlug: params.slug,
    parentName: params.slug,
  };

  useEffect(() => {
    // Search by city keyword in tour titles
    fetch(`/api/tours/list?q=${encodeURIComponent(cityInfo.name)}&limit=1000`)
      .then(r => r.json())
      .then(data => { if (data.tours) setTours(data.tours); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityInfo.name]);

  // Group tours by supplier
  const supplierGroups = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    tours.forEach(t => {
      const key = t.supplier || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [tours]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <nav className="text-sm text-white/70 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <span>›</span>
            <Link href="/search" className="hover:text-white transition-colors">ค้นหาทัวร์</Link>
            <span>›</span>
            <Link href={`/country/${cityInfo.parentSlug}`} className="hover:text-white transition-colors">ทัวร์{cityInfo.parentName}</Link>
            <span>›</span>
            <span className="text-white font-medium">ทัวร์{cityInfo.name}</span>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">ทัวร์{cityInfo.name}</h1>
            <p className="text-white/80 text-base mt-1">
              {loading ? 'กำลังค้นหาโปรแกรมทัวร์...' : tours.length > 0
                ? `พบ ${tours.length} โปรแกรมที่มีเส้นทางผ่าน${cityInfo.name} จาก ${supplierGroups.length} โฮลเซล`
                : `ยังไม่มีทัวร์ที่ระบุ${cityInfo.name}โดยเฉพาะ`}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          /* Skeleton */
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div>
                    <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(j => (
                    <div key={j} className="p-4 rounded-xl border border-slate-100">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          /* Tour Groups by Supplier */
          <div className="space-y-8">
            {supplierGroups.map(([supplier, supplierTours]) => {
              const display = SUPPLIER_DISPLAY[supplier] || { name: supplier, color: 'bg-slate-50 border-slate-200 text-slate-700' };
              return (
                <section key={supplier} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Supplier Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${display.color} rounded-xl flex items-center justify-center border font-bold text-xs text-center leading-tight`}>
                        {display.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          ทัวร์{cityInfo.name} จาก {display.name}
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </h2>
                        <p className="text-sm text-slate-500">{supplierTours.length} โปรแกรม • ข้อมูลจริงจากโฮลเซล</p>
                      </div>
                    </div>
                  </div>

                  {/* Tour Cards Grid */}
                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {supplierTours.map(tour => (
                        <Link
                          key={tour.id}
                          href={`/tour/${tour.slug}`}
                          className="group block rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
                        >
                          {/* Image */}
                          <div className="relative h-40 bg-slate-100 overflow-hidden">
                            {tour.imageUrl ? (
                              <img
                                src={tour.imageUrl}
                                alt={tour.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
                                <span className="text-4xl">🏙️</span>
                              </div>
                            )}
                            {tour.availableSeats > 0 && tour.availableSeats <= 10 && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                🔥 เหลือ {tour.availableSeats} ที่
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {tour.durationDays}วัน{tour.durationNights}คืน
                            </div>
                          </div>
                          {/* Details */}
                          <div className="p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.code}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">
                              {tour.title}
                            </h3>
                            <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-50">
                              <div>
                                {tour.nextDeparture !== 'N/A' && (
                                  <p className="text-[11px] text-slate-400">📅 {tour.nextDeparture}</p>
                                )}
                              </div>
                              <div className="text-right">
                                {tour.price > 0 ? (
                                  <>
                                    <div className="text-base font-bold text-primary-600">฿{tour.price.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">/ท่าน</div>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-400">สอบถามราคา</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Empty State — NO mock data */
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="text-5xl mb-4">🏙️</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีทัวร์ที่ระบุ{cityInfo.name}โดยเฉพาะ</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              ทัวร์ที่ผ่านเมือง{cityInfo.name}อาจอยู่ในโปรแกรมทัวร์{cityInfo.parentName}ทั่วไป ลองดูทัวร์{cityInfo.parentName}ทั้งหมด
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href={`/country/${cityInfo.parentSlug}`} className="btn-primary">
                ดูทัวร์{cityInfo.parentName}ทั้งหมด
              </Link>
              <Link href="/search" className="btn-secondary">
                ค้นหาทัวร์ทั้งหมด
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
