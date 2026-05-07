'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

// Airline logo map
const AIRLINE_LOGOS: Record<string, string> = {
  'TURKISH AIRLINES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Turkish_Airlines_logo_2019_compact.svg/120px-Turkish_Airlines_logo_2019_compact.svg.png',
  'THAI AIRWAYS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Thai_Airways_Logo.svg/120px-Thai_Airways_Logo.svg.png',
  'ALL NIPPON AIRWAYS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/All_Nippon_Airways_Logo.svg/120px-All_Nippon_Airways_Logo.svg.png',
  'JAPAN AIRLINES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Japan_Airlines_logo_%282011%29.svg/120px-Japan_Airlines_logo_%282011%29.svg.png',
  'SINGAPORE AIRLINES': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/120px-Singapore_Airlines_Logo_2.svg.png',
  'EMIRATES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/120px-Emirates_logo.svg.png',
  'QATAR AIRWAYS': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/120px-Qatar_Airways_Logo.svg.png',
  'KOREAN AIR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KoreanAir_logo.svg/120px-KoreanAir_logo.svg.png',
  'EVA AIR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/EVA_Air_logo.svg/120px-EVA_Air_logo.svg.png',
  'CATHAY PACIFIC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Cathay_Pacific_logo.svg/120px-Cathay_Pacific_logo.svg.png',
  'AIR ASIA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/120px-AirAsia_New_Logo.svg.png',
  'THAI VIETJET AIR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'VIETJET AIR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'HAINAN AIRLINES': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Hainan_Airlines_logo.svg/120px-Hainan_Airlines_logo.svg.png',
  'CHINA AIRLINES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/China_Airlines_logo.svg/120px-China_Airlines_logo.svg.png',
  'INDIGO AIRLINES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/120px-IndiGo_Airlines_logo.svg.png',
  'KUNMING AIRLINES': '',
  'NOZL AIR': '',
};

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
  flight?: { airline: string; details: string };
}

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllDeps, setShowAllDeps] = useState(false);

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
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="flex gap-6"><div className="w-[45%] h-48 bg-slate-100 rounded-xl" /><div className="w-[55%] space-y-3"><div className="h-5 bg-slate-100 rounded w-3/4" /><div className="h-4 bg-slate-100 rounded w-1/2" /></div></div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">ไม่พบโปรแกรมทัวร์</h1>
        <p className="text-slate-500 mb-6 text-sm">{error || 'ทัวร์นี้อาจถูกลบหรือยังไม่เผยแพร่'}</p>
        <Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link>
      </div>
    );
  }

  const rawAirline = tour.flight?.airline;
  const airlineName = (rawAirline && rawAirline !== 'ตามโปรแกรมทัวร์') ? rawAirline : null;
  const airlineLogo = airlineName ? AIRLINE_LOGOS[airlineName.toUpperCase()] : null;
  const visibleDeps = showAllDeps ? tour.departures : tour.departures.slice(0, 4);

  return (
    <div className="bg-slate-50 text-slate-800 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary-600">หน้าหลัก</Link><Chev />
            <Link href="/search" className="hover:text-primary-600">ค้นหาทัวร์</Link><Chev />
            <Link href={`/search?q=${encodeURIComponent(tour.country)}`} className="hover:text-primary-600">ทัวร์{tour.country}</Link><Chev />
            <span className="text-slate-700 font-semibold">{tour.code}</span>
          </nav>
        </div>
      </div>

      {/* ─── Hero: 3 columns — Image | Info | Price ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Image — 38% */}
            <div className="lg:w-[38%] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative group">
              <img
                src={tour.images[0]}
                alt={tour.title}
                className="w-full h-full min-h-[220px] max-h-[300px] object-cover"
              />
              {/* Code overlay */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {tour.code}
              </div>
              {/* Duration overlay */}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{tour.duration.days}วัน</span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{tour.duration.nights}คืน</span>
              </div>
              {airlineName && (
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                  {airlineLogo ? (
                    <img src={airlineLogo} alt={airlineName} className="h-3.5 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  ) : (
                    <span>✈️</span>
                  )}
                  <span className="text-slate-700">{airlineName}</span>
                </div>
              )}
            </div>

            {/* Info — 37% */}
            <div className="lg:w-[37%] flex flex-col min-w-0">
              {/* Country tag */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span>🌍 {tour.country}</span>
                <span>·</span>
                <span>รหัสทัวร์ : {tour.code}</span>
              </div>

              {/* Title */}
              <h1 className="text-base md:text-lg font-black text-slate-900 leading-snug mb-2 line-clamp-2">{tour.title}</h1>

              {/* Duration + Seats */}
              <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">🗓️ <b>{tour.duration.days} วัน {tour.duration.nights} คืน</b></span>
                <span className="flex items-center gap-1">👥 <b>เดินทางขั้นต่ำ {tour.departures.length > 0 ? Math.max(tour.departures[0].remainingSeats, 0) : 0} ท่าน</b></span>
              </div>

              {/* Airline badge */}
              {airlineName && (
                <div className="flex items-center gap-2.5 p-2 bg-blue-50/80 rounded-lg border border-blue-100 mb-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 shrink-0 overflow-hidden">
                    {airlineLogo ? (
                      <img src={airlineLogo} alt={airlineName} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).outerHTML='<span class="text-sm">✈️</span>'; }} />
                    ) : (
                      <span className="text-sm">✈️</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{airlineName}</div>
                    <div className="text-[10px] text-slate-400">บริการอาหารบนเครื่อง</div>
                  </div>
                </div>
              )}

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">⭐ ไฮไลท์ทัวร์</h3>
                  <div className="grid grid-cols-1 gap-0.5">
                    {tour.highlights.slice(0, 5).map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <span className="w-3.5 h-3.5 bg-primary-500 text-white rounded-full flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">{i+1}</span>
                        <span className="leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Card — 25% */}
            <div className="lg:w-[25%] flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
                {/* Price header */}
                <div className="bg-gradient-to-r from-primary-600 to-orange-500 px-4 py-3 text-white">
                  <p className="text-[10px] text-white/70">จองทัวร์</p>
                  <p className="text-[10px] text-white/70">ราคาเริ่มต้น</p>
                  {tour.price.starting > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">{tour.price.starting.toLocaleString()}</span>
                      <span className="text-xs">บาท/ท่าน</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold">สอบถามราคา</p>
                  )}
                </div>
                {/* Details */}
                <div className="p-3 space-y-1.5 text-[11px]">
                  <InfoRow label="รหัสทัวร์" value={tour.code} />
                  <InfoRow label="ระยะเวลา" value={`${tour.duration.days}วัน ${tour.duration.nights}คืน`} />
                  <InfoRow label="ประเทศ" value={tour.country} />
                  <InfoRow label="Wholesale" value={tour.supplier.name} />
                  {airlineName && <InfoRow label="สายการบิน" value={airlineName} />}

                  {tour.pdfUrl && (
                    <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-dashed border-primary-200 text-primary-600 font-bold text-[11px] hover:bg-primary-50 transition-colors mt-2">
                      📥 ดาวน์โหลดโปรแกรมทัวร์
                    </a>
                  )}
                  <Link href={`/book/tour/${tour.slug}`} className="block w-full py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white text-center font-bold text-sm shadow hover:shadow-lg hover:scale-[1.01] transition-all mt-1">
                    จองเลย →
                  </Link>
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 transition-colors shadow-sm">
                    📱 สอบถามเพิ่มเติม
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Departures Section ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">📅 วันเดินทาง</h3>
          {tour.departures.length > 0 ? (
            <div className="space-y-2">
              {visibleDeps.map(dep => (
                <div key={dep.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">
                    {new Date(dep.startDate).toLocaleDateString('th-TH', {day:'numeric',month:'short',year:'numeric'})}
                    {' – '}
                    {new Date(dep.endDate).toLocaleDateString('th-TH', {day:'numeric',month:'short',year:'numeric'})}
                  </span>
                  {dep.remainingSeats > 0 ? (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-bold">เหลือ {dep.remainingSeats} ที่</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold">เต็ม</span>
                  )}
                </div>
              ))}
              {tour.departures.length > 4 && !showAllDeps && (
                <button
                  onClick={() => setShowAllDeps(true)}
                  className="text-xs text-primary-600 font-bold mt-2 flex items-center gap-1 hover:underline"
                >
                  📅 ดูวันอื่นเพิ่มเติม ({tour.departures.length - 4} รอบ)
                </button>
              )}
              {showAllDeps && tour.departures.length > 4 && (
                <button
                  onClick={() => setShowAllDeps(false)}
                  className="text-xs text-slate-400 font-bold mt-1 hover:underline"
                >
                  ▲ ย่อ
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">ยังไม่มีรอบเดินทาง — สอบถามทาง LINE</p>
          )}
        </div>
      </div>

      {/* ─── Conditions (if any) ─── */}
      {(tour.included.length > 0 || tour.excluded.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">ℹ️ เงื่อนไข</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tour.included.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 mb-1.5">✅ อัตราค่ารวม</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {tour.included.map((item, i) => <li key={i} className="flex gap-1.5"><span className="text-emerald-500">•</span> {item}</li>)}
                  </ul>
                </div>
              )}
              {tour.excluded.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-red-500 mb-1.5">❌ อัตราค่าไม่รวม</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {tour.excluded.map((item, i) => <li key={i} className="flex gap-1.5"><span className="text-red-500">•</span> {item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LINE CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 md:p-6 text-white flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-500" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
            </div>
            <div>
              <h3 className="text-base font-black">สอบถามเพิ่มเติมทาง LINE</h3>
              <p className="text-emerald-100 text-[11px]">ทีมงานพร้อมให้บริการ เช็คที่นั่ง โปรโมชั่น ขอใบเสนอราคา</p>
            </div>
          </div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-emerald-600 hover:bg-emerald-50 px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105 whitespace-nowrap">ติดต่อผ่าน LINE 💬</a>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center gap-3">
        <div>
          <p className="text-[10px] text-slate-500 font-medium">ราคาเริ่มต้น</p>
          {tour.price.starting > 0 ? (
            <p className="text-lg font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p>
          ) : (
            <p className="text-sm font-bold text-slate-400">สอบถามราคา</p>
          )}
        </div>
        <div className="flex gap-2">
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-bold text-sm shadow">💬</a>
          <Link href={`/book/tour/${tour.slug}`} className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg">จองเลย →</Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function Chev() {
  return <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
}
