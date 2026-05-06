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
}

const COUNTRY_MAP: Record<string, { name: string; emoji: string }> = {
  'japan': { name: 'ญี่ปุ่น', emoji: '🇯🇵' },
  'korea': { name: 'เกาหลีใต้', emoji: '🇰🇷' },
  'china': { name: 'จีน', emoji: '🇨🇳' },
  'taiwan': { name: 'ไต้หวัน', emoji: '🇹🇼' },
  'vietnam': { name: 'เวียดนาม', emoji: '🇻🇳' },
  'hongkong': { name: 'ฮ่องกง', emoji: '🇭🇰' },
  'europe': { name: 'ยุโรป', emoji: '🇪🇺' },
  'india': { name: 'อินเดีย', emoji: '🇮🇳' },
  'turkey': { name: 'ตุรกี', emoji: '🇹🇷' },
  'dubai': { name: 'ดูไบ', emoji: '🇦🇪' },
  'singapore': { name: 'สิงคโปร์', emoji: '🇸🇬' },
  'malaysia': { name: 'มาเลเซีย', emoji: '🇲🇾' },
  'laos': { name: 'ลาว', emoji: '🇱🇦' },
  'myanmar': { name: 'พม่า', emoji: '🇲🇲' },
  'cambodia': { name: 'กัมพูชา', emoji: '🇰🇭' },
  'russia': { name: 'รัสเซีย', emoji: '🇷🇺' },
  'australia': { name: 'ออสเตรเลีย', emoji: '🇦🇺' },
  'newzealand': { name: 'นิวซีแลนด์', emoji: '🇳🇿' },
  'egypt': { name: 'อียิปต์', emoji: '🇪🇬' },
  'georgia': { name: 'จอร์เจีย', emoji: '🇬🇪' },
  'usa': { name: 'อเมริกา', emoji: '🇺🇸' },
  'canada': { name: 'แคนาดา', emoji: '🇨🇦' },
};

const SUPPLIER_DISPLAY: Record<string, { name: string; color: string }> = {
  "let'sgo": { name: "Let's Go Group", color: 'bg-blue-50 border-blue-200 text-blue-700' },
  'checkingroup': { name: 'Check-in Group', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  'tourfactory': { name: 'Tour Factory', color: 'bg-purple-50 border-purple-200 text-purple-700' },
};

export default function CountryPage({ params }: { params: { slug: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const countryInfo = COUNTRY_MAP[params.slug] || { name: params.slug, emoji: '🌍' };

  useEffect(() => {
    fetch(`/api/tours/list?country=${encodeURIComponent(countryInfo.name)}&limit=1000`)
      .then(r => r.json())
      .then(data => { if (data.tours) setTours(data.tours); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryInfo.name]);

  // Group tours by supplier
  const supplierGroups = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    tours.forEach(t => {
      const key = t.supplier || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    // Sort groups by tour count (most tours first)
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
            <span className="text-white font-medium">ทัวร์{countryInfo.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-5xl md:text-6xl">{countryInfo.emoji}</span>
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
        {loading ? (
          /* Skeleton Loading */
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
                          ทัวร์จาก {display.name}
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </h2>
                        <p className="text-sm text-slate-500">{supplierTours.length} โปรแกรม • อัปเดตสถานะที่นั่ง Real-time</p>
                      </div>
                    </div>
                    <Link
                      href={`/search?q=${encodeURIComponent(countryInfo.name)}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      ดูทั้งหมด {supplierTours.length} โปรแกรม →
                    </Link>
                  </div>

                  {/* Tour Cards Grid */}
                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplierTours.map(tour => (
                        <Link
                          key={tour.id}
                          href={`/tour/${tour.slug}`}
                          className="group block p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 bg-white hover:bg-primary-50/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{tour.code}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3 min-h-[2.5rem]">
                            {tour.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                              ⏱️ {tour.durationDays}วัน{tour.durationNights}คืน
                            </div>
                            <div className="text-right">
                              {tour.price > 0 ? (
                                <span className="text-base font-bold text-primary-600">฿{tour.price.toLocaleString()}</span>
                              ) : (
                                <span className="text-xs text-slate-400">สอบถามราคา</span>
                              )}
                            </div>
                          </div>
                          {tour.nextDeparture !== 'N/A' && (
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                              📅 {tour.nextDeparture}
                              {tour.availableSeats > 0 && tour.availableSeats <= 10 && (
                                <span className="text-red-500 font-semibold ml-auto">🔥 เหลือ {tour.availableSeats} ที่</span>
                              )}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="text-5xl mb-4">{countryInfo.emoji}</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีทัวร์{countryInfo.name}</h2>
            <p className="text-slate-500 mb-6">กรุณากลับมาตรวจสอบใหม่ หรือค้นหาทัวร์อื่น</p>
            <Link href="/search" className="btn-primary">ค้นหาทัวร์ทั้งหมด</Link>
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">❓ คำถามที่พบบ่อย — ทัวร์{countryInfo.name}</h2>
          <div className="space-y-3">
            <details className="group bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-primary-200 open:shadow-sm transition-all">
              <summary className="flex items-center justify-between p-5 font-semibold text-slate-900 cursor-pointer list-none text-sm">
                ทัวร์{countryInfo.name}ปกติใช้เวลากี่วัน?
                <svg className="w-4 h-4 transition group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600">โปรแกรมทัวร์ส่วนใหญ่มักจะจัดอยู่ที่ประมาณ 4-8 วัน ขึ้นอยู่กับเส้นทาง</div>
            </details>
            <details className="group bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-primary-200 open:shadow-sm transition-all">
              <summary className="flex items-center justify-between p-5 font-semibold text-slate-900 cursor-pointer list-none text-sm">
                จองทัวร์ผ่าน Jongtour ปลอดภัยไหม?
                <svg className="w-4 h-4 transition group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600">ปลอดภัย 100% ครับ เราทำงานร่วมกับโฮลเซลล์ที่มีใบอนุญาตจากการท่องเที่ยวเท่านั้น</div>
            </details>
            <details className="group bg-slate-50 rounded-xl border border-slate-100 open:bg-white open:border-primary-200 open:shadow-sm transition-all">
              <summary className="flex items-center justify-between p-5 font-semibold text-slate-900 cursor-pointer list-none text-sm">
                มีกรุ๊ปเหมาส่วนตัวไป{countryInfo.name}ไหม?
                <svg className="w-4 h-4 transition group-open:rotate-180 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600">มีครับ! ติดต่อเจ้าหน้าที่เพื่อจัดโปรแกรม Private Group เริ่มต้นที่ 8 ท่าน</div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
