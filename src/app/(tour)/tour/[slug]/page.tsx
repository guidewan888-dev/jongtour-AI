'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden h-[300px] md:h-[420px] bg-slate-100">
          <img
            src={tour.images[0]}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-white/90 backdrop-blur text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{tour.code}</span>
              <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-3 py-1 rounded-full">🏢 {tour.supplier.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{tour.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Column */}
          <div className="w-full lg:w-[65%] space-y-8">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">⏱️ {tour.duration.days} วัน {tour.duration.nights} คืน</div>
              <div className="flex items-center gap-2">🌍 {tour.country} {tour.city && `• ${tour.city}`}</div>
              {tour.departures.length > 0 && (
                <div className="flex items-center gap-2">📅 เดินทาง {new Date(tour.departures[0].startDate).toLocaleDateString('th-TH')}</div>
              )}
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

          {/* Right Column: Sticky Card */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="sticky top-24 g-card p-6 space-y-5">
              <div>
                <p className="text-xs text-slate-500 font-medium">ราคาเริ่มต้น</p>
                {tour.price.starting > 0 ? (
                  <p className="text-3xl font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p>
                ) : (
                  <p className="text-lg font-bold text-slate-400">สอบถามราคา</p>
                )}
                <p className="text-xs text-slate-400">/ท่าน</p>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>รหัสทัวร์</span><span className="font-semibold text-slate-900">{tour.code}</span></div>
                <div className="flex justify-between"><span>ระยะเวลา</span><span className="font-semibold text-slate-900">{tour.duration.days}วัน {tour.duration.nights}คืน</span></div>
                <div className="flex justify-between"><span>ประเทศ</span><span className="font-semibold text-slate-900">{tour.country}</span></div>
                <div className="flex justify-between"><span>Wholesale</span><span className="font-semibold text-slate-900">{tour.supplier.name}</span></div>
              </div>
              <hr className="border-slate-100" />
              {tour.pdfUrl && (
                <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center gap-2">
                  📥 ดาวน์โหลด PDF โปรแกรม
                </a>
              )}
              <Link href={`/book/tour/${tour.slug}`} className="btn-primary w-full text-center block">
                🛒 จองทัวร์นี้
              </Link>
              <Link href={`/contact?tour=${tour.code}`} className="btn-secondary w-full text-center block">
                📞 สอบถามเพิ่มเติม
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500 font-medium">ราคาเริ่มต้น</p>
          {tour.price.starting > 0 ? (
            <p className="text-xl font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p>
          ) : (
            <p className="text-sm font-bold text-slate-400">สอบถามราคา</p>
          )}
        </div>
        <Link href={`/book/tour/${tour.slug}`} className="btn-primary">
          🛒 จองเลย
        </Link>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
}
