'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

const SUPPLIER_INFO: Record<string, { displayName: string; logo: string; accent: string; gradient: string; landingPath: string }> = {
  worldconnection: {
    displayName: 'World Connection',
    logo: '/images/logos/worldconnection.png',
    accent: 'text-orange-600',
    gradient: 'from-amber-600 to-orange-500',
    landingPath: '/wholesaler/worldconnection',
  },
  itravels: {
    displayName: 'iTravels Center',
    logo: '/images/logos/itravels_small.jpg',
    accent: 'text-sky-600',
    gradient: 'from-sky-600 to-cyan-500',
    landingPath: '/wholesaler/itravels',
  },
  bestintl: {
    displayName: 'Best International',
    logo: '/images/logos/Bestinternational.png',
    accent: 'text-red-600',
    gradient: 'from-red-600 to-rose-500',
    landingPath: '/wholesaler/bestinternational',
  },
  gs25: {
    displayName: 'GS25 Travel',
    logo: '/images/logos/GS Group.png',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-600 to-green-500',
    landingPath: '/wholesaler/gs25',
  },
  go365: {
    displayName: 'Go365 Travel',
    logo: '/images/logos/download.jfif',
    accent: 'text-green-600',
    gradient: 'from-green-600 to-emerald-500',
    landingPath: '/wholesaler/go365',
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
  const [showAllPeriods, setShowAllPeriods] = useState(false);

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

  const supplier = SUPPLIER_INFO[tour.site] || SUPPLIER_INFO.worldconnection;

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
                {tour.pdfUrl && (
                  <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors shadow-sm">
                    📥 ดาวน์โหลดโปรแกรมทัวร์
                  </a>
                )}
                <Link href={`/book/tour/s/${tour.code.toLowerCase()}`} className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm hover:shadow-xl transition-all shadow-lg flex items-center gap-2">
                  จองเลย →
                </Link>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2">
                  ❤️ สอบถามเพิ่มเติม
                </a>
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
      {tour.periods && tour.periods.length > 0 && (() => {
        const periods = showAllPeriods ? tour.periods : tour.periods.slice(0, 4);
        return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 px-5 pt-4 pb-2 flex items-center gap-1.5">📅 วันเดินทาง & ราคา</h3>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-emerald-600 text-white text-xs">
                  <th className="text-left px-4 py-2.5">เดินทาง</th>
                  <th className="text-right px-3 py-2.5">ราคาผู้ใหญ่</th>
                  <th className="text-right px-3 py-2.5">มัดจำ</th>
                  <th className="text-center px-3 py-2.5">ที่นั่ง</th>
                  <th className="text-center px-3 py-2.5">สถานะ</th>
                  <th className="text-center px-3 py-2.5">จอง</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((p) => {
                    let dateText = '-';
                    if (p.startDate && p.endDate) {
                      try {
                        dateText = `${new Date(p.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} - ${new Date(p.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`;
                      } catch { dateText = p.rawText?.slice(0, 60) || '-'; }
                    } else if (p.rawText) {
                      dateText = p.rawText.length > 60 ? p.rawText.slice(0, 57) + '...' : p.rawText;
                    }
                    const isFull = p.status === 'full' || (p.seatsLeft !== null && p.seatsLeft <= 0);
                    const periodPrice = p.price && p.price > 0 ? p.price : tour.price;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{dateText}</td>
                        <td className="px-3 py-3 text-right font-bold text-slate-900">{periodPrice > 0 ? `฿${periodPrice.toLocaleString()}` : 'สอบถาม'}</td>
                        <td className="px-3 py-3 text-right text-orange-600 font-bold">{tour.deposit > 0 ? `฿${tour.deposit.toLocaleString()}` : '-'}</td>
                        <td className="px-3 py-3 text-center">
                          {p.seatsLeft !== null ? (
                            <span className={`inline-block min-w-[28px] py-0.5 rounded-full text-xs font-bold ${isFull ? 'bg-red-50 text-red-500' : p.seatsLeft <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isFull ? 'เต็ม' : p.seatsLeft}
                            </span>
                          ) : <span className="text-xs text-slate-400">สอบถาม</span>}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {isFull ? 'เต็ม' : 'ว่าง'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {!isFull && (
                            <Link href={`/book/tour/s/${tour.code.toLowerCase()}?period=${p.id}`} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-bold hover:bg-primary-700">
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
            {/* Mobile Cards */}
            <div className="md:hidden px-4 pb-2 space-y-2">
              {periods.map((p) => {
                let dateText = '-';
                if (p.startDate && p.endDate) {
                  try {
                    dateText = `${new Date(p.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(p.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`;
                  } catch { dateText = p.rawText?.slice(0, 40) || '-'; }
                } else if (p.rawText) {
                  dateText = p.rawText.length > 40 ? p.rawText.slice(0, 37) + '...' : p.rawText;
                }
                const isFull = p.status === 'full' || (p.seatsLeft !== null && p.seatsLeft <= 0);
                const periodPrice = p.price && p.price > 0 ? p.price : tour.price;
                return (
                  <div key={p.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{dateText}</span>
                      {p.seatsLeft !== null && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">เหลือ {p.seatsLeft}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                      <span>ราคา: <b className="text-slate-800">{periodPrice > 0 ? `฿${periodPrice.toLocaleString()}` : 'สอบถาม'}</b></span>
                      <span>มัดจำ: <b className="text-orange-600">{tour.deposit > 0 ? `฿${tour.deposit.toLocaleString()}` : '-'}</b></span>
                    </div>
                    {!isFull && (
                      <Link href={`/book/tour/s/${tour.code.toLowerCase()}?period=${p.id}`} className="mt-2 block text-center text-xs bg-primary-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-primary-700">จอง</Link>
                    )}
                  </div>
                );
              })}
            </div>
            {tour.periods.length > 4 && (
              <div className="px-5 pb-4">
                <button onClick={() => setShowAllPeriods(!showAllPeriods)} className="text-xs text-primary-600 font-bold hover:underline">
                  📅 {showAllPeriods ? '▲ ย่อ' : `ดูวันอื่นเพิ่มเติม (${tour.periods.length - 4} รอบ)`}
                </button>
              </div>
            )}
          </div>
        </div>
        );
      })()}

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
      {tour.pdfUrl && (
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
