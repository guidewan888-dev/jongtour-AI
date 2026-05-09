'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

const SUPPLIER_INFO: Record<string, { displayName: string; logo: string; accent: string; gradient: string; landingPath: string }> = {
  oneworldtour: {
    displayName: 'One World Tour',
    logo: '/images/logos/oneworldtour.png',
    accent: 'text-orange-600',
    gradient: 'from-amber-600 to-orange-500',
    landingPath: '/wholesaler/oneworldtour',
  },
  itravels: {
    displayName: 'iTravels Center',
    logo: '/images/logos/itravels.png',
    accent: 'text-sky-600',
    gradient: 'from-sky-600 to-cyan-500',
    landingPath: '/wholesaler/itravels',
  },
  bestintl: {
    displayName: 'Best International',
    logo: '/images/logos/bestintl.png',
    accent: 'text-red-600',
    gradient: 'from-red-600 to-rose-500',
    landingPath: '/wholesaler/bestintl',
  },
  gs25: {
    displayName: 'GS25 Travel',
    logo: '/images/logos/gs25.png',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-600 to-green-500',
    landingPath: '/wholesaler/gs25',
  },
};

interface TourPeriod {
  id: number;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  seatsLeft: number | null;
  status: string;
  rawText: string;
}

interface ScraperTour {
  id: string;
  code: string;
  title: string;
  site: string;
  country: string;
  duration: string;
  durationDays: number;
  durationNights: number;
  airline: string;
  price: number;
  imageUrl: string;
  sourceUrl: string;
  pdfUrl: string;
  deposit: number;
  hotelRating: number;
  highlights: string[];
  lastScraped: string;
  periods: TourPeriod[];
}

export default function ScraperTourDetailPage({ params }: { params: { code: string } }) {
  const [tour, setTour] = useState<ScraperTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`/api/tours/scraper/${params.code}`)
      .then(r => r.json())
      .then(d => {
        if (d.tour) setTour(d.tour);
        else setErr(d.error || 'ไม่พบทัวร์');
      })
      .catch(() => setErr('เกิดข้อผิดพลาด'))
      .finally(() => setLoading(false));
  }, [params.code]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="h-80 bg-slate-100 rounded-xl" />
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  if (err || !tour) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="text-xl font-bold mb-2">ไม่พบโปรแกรมทัวร์</h1>
      <p className="text-slate-500 mb-6 text-sm">{err}</p>
      <Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link>
    </div>
  );

  const supplier = SUPPLIER_INFO[tour.site] || SUPPLIER_INFO.oneworldtour;

  return (
    <div className="bg-slate-50 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary-600">หน้าหลัก</Link><Ch />
          <Link href={supplier.landingPath} className="hover:text-primary-600">{supplier.displayName}</Link><Ch />
          <Link href={`/search?q=${encodeURIComponent(tour.country)}`} className="hover:text-primary-600">ทัวร์{tour.country}</Link><Ch />
          <span className="text-slate-700 font-semibold">{tour.code}</span>
        </div>
      </div>

      {/* ─── HERO: 2 columns ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* IMAGE */}
            <div className="lg:w-[45%] rounded-xl overflow-hidden bg-white border border-slate-200 relative flex-shrink-0" style={{ minHeight: 320 }}>
              {tour.imageUrl ? (
                <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-contain absolute inset-0" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-orange-50 absolute inset-0">
                  <span className="text-6xl opacity-30">✈️</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded">{tour.code}</div>
              {tour.durationDays > 0 && (
                <div className="absolute top-2.5 right-2.5 flex gap-1">
                  <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded">{tour.durationDays}วัน</span>
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">{tour.durationNights}คืน</span>
                </div>
              )}
              {tour.airline && (
                <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                  <span>✈️</span>
                  <span className="text-slate-700">{tour.airline}</span>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="lg:w-[55%] flex flex-col min-w-0">
              {/* Supplier badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-0.5">
                  <img src={supplier.logo} alt={supplier.displayName} className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <span className={`text-xs font-bold ${supplier.accent}`}>{supplier.displayName}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-400">รหัสทัวร์ : {tour.code}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                <span>🌍 {tour.country}</span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-3">{tour.title}</h1>

              {/* Quick info badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {tour.duration && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
                    🗓️ {tour.duration}
                  </span>
                )}
                {tour.airline && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                    ✈️ {tour.airline}
                  </span>
                )}
                {tour.hotelRating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full">
                    {'★'.repeat(tour.hotelRating)} โรงแรม
                  </span>
                )}
              </div>

              {/* Price card */}
              <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 border border-primary-100 mb-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">ราคาเริ่มต้น</p>
                    {tour.price > 0 ? (
                      <p className="text-2xl font-black text-primary-600">฿{tour.price.toLocaleString()}<span className="text-sm font-normal text-slate-400 ml-1">/ท่าน</span></p>
                    ) : (
                      <p className="text-lg font-bold text-slate-400">สอบถามราคา</p>
                    )}
                  </div>
                  {tour.deposit > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">มัดจำ</p>
                      <p className="text-sm font-bold text-orange-600">฿{tour.deposit.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-1.5">⭐ ไฮไลท์ทัวร์</h3>
                  <div className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 rounded-lg p-3 border border-amber-100/50 space-y-1">
                    {tour.highlights.slice(0, 8).map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold shrink-0">●</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                {tour.pdfUrl && !tour.pdfUrl.includes('gs25travel.com') && (
                  <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors shadow-sm">
                    📥 ดาวน์โหลดโปรแกรมทัวร์
                  </a>
                )}
                <Link href={`/book/tour/s/${tour.code.toLowerCase()}`} className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm hover:shadow-xl transition-all shadow-lg flex items-center gap-2">
                  ✨ สอบถาม / จองทัวร์
                </Link>
                {tour.sourceUrl && !tour.sourceUrl.includes('gs25travel.com') && (
                  <a href={tour.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    🔗 ดูที่เว็บต้นทาง
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TOUR INFO NOTICE ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">📋 รายละเอียดโปรแกรม</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">🗓️</p>
              <p className="text-xs text-slate-400">ระยะเวลา</p>
              <p className="text-sm font-bold text-slate-800">{tour.duration || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">✈️</p>
              <p className="text-xs text-slate-400">สายการบิน</p>
              <p className="text-sm font-bold text-slate-800">{tour.airline || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">🏨</p>
              <p className="text-xs text-slate-400">ระดับโรงแรม</p>
              <p className="text-sm font-bold text-yellow-600">{tour.hotelRating > 0 ? '★'.repeat(tour.hotelRating) : '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">🌍</p>
              <p className="text-xs text-slate-400">ประเทศ</p>
              <p className="text-sm font-bold text-slate-800">{tour.country || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRAVEL PERIODS / DATES ─── */}
      {tour.periods && tour.periods.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">📅 วันเดินทาง & ที่นั่งว่าง</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-2 font-semibold text-slate-500 text-xs">วันเดินทาง</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs text-center">ที่นั่ง</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs text-right">ราคา</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs text-center">สถานะ</th>
                    <th className="pb-2 text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {tour.periods.map((p) => {
                    let dateText = '-';
                    if (p.startDate && p.endDate) {
                      try {
                        dateText = `${new Date(p.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} - ${new Date(p.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`;
                      } catch { dateText = p.rawText?.slice(0, 60) || '-'; }
                    } else if (p.rawText) {
                      // Truncate long raw text (pipe-separated data)
                      dateText = p.rawText.length > 60 ? p.rawText.slice(0, 57) + '...' : p.rawText;
                    }
                    const isFull = p.status === 'full' || (p.seatsLeft !== null && p.seatsLeft <= 0);
                    const isUrgent = p.seatsLeft !== null && p.seatsLeft > 0 && p.seatsLeft <= 5;
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 text-slate-700 font-medium">{dateText}</td>
                        <td className="py-2.5 text-center">
                          {p.seatsLeft !== null ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-50 text-red-500' : isUrgent ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                              {isFull ? 'เต็ม' : `${p.seatsLeft} ที่`}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">สอบถาม</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {p.price && p.price > 0 ? (
                            <span className="font-bold text-primary-600">฿{p.price.toLocaleString()}</span>
                          ) : (
                            <span className="text-xs text-slate-400">สอบถาม</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {isFull ? 'เต็ม' : 'ว่าง'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          {!isFull && (
                            <Link href={`/book/tour/s/${tour.code.toLowerCase()}?period=${p.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary-600 text-white px-3 py-1 rounded-full hover:bg-primary-700 transition-colors">
                              จอง
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOOKING CTA (prominent) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-r from-primary-50 via-orange-50 to-amber-50 rounded-xl border border-primary-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">🎉 สนใจจองทัวร์นี้?</h4>
            <p className="text-xs text-slate-500">จองออนไลน์ได้เลย หรือแอดไลน์ @jongtour เพื่อสอบถามเพิ่มเติม</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/book/tour/s/${tour.code.toLowerCase()}`} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-orange-500 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all shadow-lg whitespace-nowrap">
              จองเลย →
            </Link>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors whitespace-nowrap">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-5 h-5" /> สอบถาม
            </a>
          </div>
        </div>
      </div>
      {tour.pdfUrl && !tour.pdfUrl.includes('gs25travel.com') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">โปรแกรมทัวร์ฉบับเต็ม</h4>
                <p className="text-xs text-slate-500">ดาวน์โหลด PDF เพื่อดูโปรแกรมการเดินทาง วันต่อวัน</p>
              </div>
            </div>
            <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg whitespace-nowrap">
              📥 ดาวน์โหลด PDF
            </a>
          </div>
        </div>
      )}

      {/* ─── BOOKING CTA ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">📞 สนใจจองทัวร์นี้?</h3>
          <p className="text-sm text-slate-500 mb-4">
            ติดต่อทีมงาน Jongtour เพื่อสอบถามวันเดินทาง ราคาอัพเดท และจองทัวร์ ผ่านทาง LINE
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-5 h-5" /> แอดไลน์สอบถาม
            </a>
            <a href="tel:0612345678" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
              📱 โทรสอบถาม
            </a>
          </div>
        </div>
      </div>

      {/* ─── TRUST BADGES ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">✅ <b className="text-slate-700">บริษัทจดทะเบียนถูกต้อง</b></span>
          <span className="flex items-center gap-1.5">⭐ <b className="text-slate-700">รีวิวจากลูกค้าจริง มากกว่า 5,000 รีวิว</b></span>
          <span className="flex items-center gap-1.5">🔒 <b className="text-slate-700">ชำระเงินปลอดภัย</b></span>
          <span className="flex items-center gap-1.5">👨‍✈️ <b className="text-slate-700">ทีมงานดูแลตลอดการเดินทาง</b></span>
        </div>
      </div>

      {/* Mobile Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-slate-500">ราคาเริ่มต้น</p>
          {tour.price > 0 ? (
            <p className="text-lg font-black text-primary-600">฿{tour.price.toLocaleString()}</p>
          ) : (
            <p className="text-sm font-bold text-slate-400">สอบถาม</p>
          )}
        </div>
        <div className="flex gap-2">
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-bold text-sm shadow">💬</a>
          <Link href={`/book/tour/s/${tour.code.toLowerCase()}`} className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg">จองเลย →</Link>
        </div>
      </div>
    </div>
  );
}

function Ch() {
  return <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
}
