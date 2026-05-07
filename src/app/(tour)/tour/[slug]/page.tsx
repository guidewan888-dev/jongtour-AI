'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

interface TourData {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: { id: string; name: string };
  country: string;
  city: string;
  duration: { days: number; nights: number };
  images: string[];
  price: { starting: number };
  status: string;
  summary: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  policies: { payment: string; cancellation: string };
  pdfUrl?: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
    meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  }[];
  departures: {
    id: string;
    startDate: string;
    endDate: string;
    priceAdult: number;
    priceChild: number;
    priceSingle: number;
    status: string;
    remainingSeats: number;
  }[];
  airline?: string;
}

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'departures' | 'info'>('itinerary');

  useEffect(() => {
    fetch(`/api/tours/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.tour) setTour(data.tour);
        else setError(data.error || 'ไม่พบโปรแกรมทัวร์');
      })
      .catch(() => setError('เกิดข้อผิดพลาดในการโหลดข้อมูล'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 rounded-xl" />
            <div className="h-32 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">ไม่พบโปรแกรมทัวร์</h1>
        <p className="text-slate-500 mb-8">{error || 'ทัวร์นี้อาจถูกลบหรือยังไม่เผยแพร่'}</p>
        <Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-800 pb-32 md:pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-xs font-medium text-slate-500">
          <ol className="flex items-center space-x-2">
            <li><Link href="/" className="hover:text-primary-600 transition-colors">หน้าหลัก</Link></li>
            <li><ChevronIcon /></li>
            <li><Link href="/search" className="hover:text-primary-600 transition-colors">ค้นหาทัวร์</Link></li>
            <li><ChevronIcon /></li>
            <li><Link href={`/search?q=${encodeURIComponent(tour.country)}`} className="hover:text-primary-600 transition-colors">ทัวร์{tour.country}</Link></li>
            <li><ChevronIcon /></li>
            <li className="text-slate-900 truncate max-w-[200px]">{tour.code}</li>
          </ol>
        </nav>
      </div>

      {/* Hero Image — Enhanced */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden h-[300px] md:h-[450px] bg-slate-100 group">
          <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-primary-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">{tour.code}</span>
            <span className="bg-white/90 backdrop-blur-md text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">🏢 {tour.supplier.name}</span>
            {tour.airline && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">✈️ {tour.airline}</span>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-3 text-white/80 text-sm font-medium">
              <span className="flex items-center gap-1">🌍 {tour.country}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="flex items-center gap-1">⏱️ {tour.duration.days} วัน {tour.duration.nights} คืน</span>
              {tour.departures.length > 0 && <><span className="w-1 h-1 rounded-full bg-white/50" /><span>👥 {tour.departures[0].remainingSeats} ที่นั่ง</span></>}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">{tour.title}</h1>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 py-4 text-xs text-slate-500 font-semibold">
          {['✅ บริษัททัวร์จดทะเบียนถูกต้อง','⭐ รีวิวจากลูกค้าจริง มากกว่า 5,000 รีวิว','💳 ชำระเงินปลอดภัย','📞 ทีมงานดูแลตลอดการเดินทาง'].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column */}
          <div className="w-full lg:w-[65%] space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl text-center border border-orange-100">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-xs text-slate-500">ระยะเวลา</div>
                <div className="font-black text-slate-900">{tour.duration.days}วัน {tour.duration.nights}คืน</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-xl text-center border border-blue-100">
                <div className="text-2xl mb-1">🌍</div>
                <div className="text-xs text-slate-500">ประเทศ</div>
                <div className="font-black text-slate-900">{tour.country}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl text-center border border-emerald-100">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs text-slate-500">เดินทางเร็วสุด</div>
                <div className="font-black text-slate-900">{tour.departures.length > 0 ? new Date(tour.departures[0].startDate).toLocaleDateString('th-TH',{day:'numeric',month:'short'}) : 'สอบถาม'}</div>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl text-center border border-violet-100">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-xs text-slate-500">ที่นั่งเหลือ</div>
                <div className="font-black text-slate-900">{tour.departures.length > 0 ? `${tour.departures[0].remainingSeats} ท่าน` : 'สอบถาม'}</div>
              </div>
            </div>

            {/* Summary */}
            {tour.summary && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">รายละเอียดโปรแกรม</h2>
                <p className="text-slate-600 leading-relaxed">{tour.summary}</p>
              </section>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-1">
                {[
                  { key: 'itinerary' as const, label: '📋 แผนการเดินทาง', count: tour.itinerary.length },
                  { key: 'departures' as const, label: '📅 รอบเดินทาง', count: tour.departures.length },
                  { key: 'info' as const, label: 'ℹ️ เงื่อนไข', count: 0 },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'text-primary-600 border-primary-600'
                        : 'text-slate-500 border-transparent hover:text-slate-700'
                    }`}
                  >
                    {tab.label} {tab.count > 0 && <span className="text-xs text-slate-400">({tab.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {tour.itinerary.length > 0 ? tour.itinerary.map(day => (
                  <div key={day.day} className="g-card p-5 border-l-4 border-primary-500">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                        {day.day}
                      </span>
                      <h3 className="font-bold text-slate-900">{day.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 ml-11 leading-relaxed">{day.description}</p>
                    <div className="flex gap-3 mt-3 ml-11">
                      {day.meals.breakfast && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">🌅 เช้า</span>}
                      {day.meals.lunch && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">☀️ กลางวัน</span>}
                      {day.meals.dinner && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">🌙 เย็น</span>}
                    </div>
                  </div>
                )) : (
                  <div className="g-card p-8 text-center text-slate-400">
                    <p className="text-3xl mb-3">📋</p>
                    <p>ยังไม่มีแผนการเดินทาง — ดาวน์โหลด PDF สำหรับรายละเอียด</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'departures' && (
              <div className="space-y-3">
                {tour.departures.length > 0 ? tour.departures.map(dep => (
                  <div key={dep.id} className="g-card p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {new Date(dep.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' → '}
                        {new Date(dep.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {dep.remainingSeats > 0 ? (
                          <span className="text-emerald-600 font-semibold">เหลือ {dep.remainingSeats} ที่</span>
                        ) : (
                          <span className="text-red-500 font-semibold">เต็ม</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {dep.priceAdult > 0 ? (
                        <div className="text-lg font-bold text-primary-600">฿{dep.priceAdult.toLocaleString()}</div>
                      ) : (
                        <div className="text-sm text-slate-400">สอบถามราคา</div>
                      )}
                      <div className="text-xs text-slate-400">/ท่าน</div>
                    </div>
                  </div>
                )) : (
                  <div className="g-card p-8 text-center text-slate-400">
                    <p className="text-3xl mb-3">📅</p>
                    <p>ยังไม่มีรอบเดินทาง — ติดต่อสอบถาม</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.included.length > 0 && (
                  <div className="g-card p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="text-emerald-500">✅</span> อัตราค่ารวม
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {tour.included.map((item, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">•</span> {item}</li>)}
                    </ul>
                  </div>
                )}
                {tour.excluded.length > 0 && (
                  <div className="g-card p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="text-red-500">❌</span> อัตราค่าไม่รวม
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {tour.excluded.map((item, i) => <li key={i} className="flex gap-2"><span className="text-red-500">•</span> {item}</li>)}
                    </ul>
                  </div>
                )}
                <div className="g-card p-5 md:col-span-2">
                  <h3 className="font-bold text-slate-900 mb-3">📜 เงื่อนไขการจอง</h3>
                  <div className="grid gap-4 text-sm text-slate-600">
                    <div><strong>การชำระเงิน:</strong> {tour.policies.payment}</div>
                    <div><strong>การยกเลิก:</strong> {tour.policies.cancellation}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Enhanced Sticky Card */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-orange-500 p-5 text-white">
                  <p className="text-xs font-medium text-white/80">จองทัวร์</p>
                  <p className="text-sm text-white/70 mb-1">ราคาเริ่มต้น</p>
                  {tour.price.starting > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{tour.price.starting.toLocaleString()}</span>
                      <span className="text-sm font-medium">บาท/ท่าน</span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold">สอบถามราคา</p>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-slate-500">รหัสทัวร์</span><span className="font-bold text-slate-900">{tour.code}</span></div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-slate-500">ระยะเวลา</span><span className="font-bold text-slate-900">{tour.duration.days}วัน {tour.duration.nights}คืน</span></div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-slate-500">ประเทศ</span><span className="font-bold text-slate-900">{tour.country}</span></div>
                    <div className="flex justify-between py-1.5"><span className="text-slate-500">Wholesale</span><span className="font-bold text-slate-900">{tour.supplier.name}</span></div>
                  </div>
                  {tour.pdfUrl && (
                    <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-primary-200 text-primary-600 font-bold text-sm hover:bg-primary-50 transition-colors">📥 ดาวน์โหลดโปรแกรมทัวร์</a>
                  )}
                  <Link href={`/book/tour/${tour.slug}`} className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white text-center font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">จองเลย →</Link>
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-md">📱 สอบถามเพิ่มเติม</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LINE CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 md:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} /></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-emerald-500" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-2">สอบถามโปรแกรมทัวร์นี้</h3>
            <p className="text-emerald-100 mb-4 text-sm max-w-md mx-auto">ทีมงานพร้อมให้บริการ เช็คที่นั่ง / โปรโมชั่น / ขอใบเสนอราคา</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
              <span>📋 สอบถามโปรแกรมทัวร์</span><span>🎫 เช็คที่นั่ง / โปรโมชั่น</span><span>💰 ขอใบเสนอราคา / ออกใบกำกับภาษี</span>
            </div>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold text-base shadow-lg transition-all hover:scale-105">ติดต่อผ่าน LINE 💬</a>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar — Enhanced */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center gap-3">
        <div>
          <p className="text-[10px] text-slate-500 font-medium">ราคาเริ่มต้น</p>
          {tour.price.starting > 0 ? (
            <p className="text-xl font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p>
          ) : (
            <p className="text-sm font-bold text-slate-400">สอบถามราคา</p>
          )}
        </div>
        <div className="flex gap-2">
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md">💬 LINE</a>
          <Link href={`/book/tour/${tour.slug}`} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg">จองเลย →</Link>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
}
