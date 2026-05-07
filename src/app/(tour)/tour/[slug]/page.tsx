'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';
const AL: Record<string,string> = {
  'TURKISH AIRLINES':'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Turkish_Airlines_logo_2019_compact.svg/120px-Turkish_Airlines_logo_2019_compact.svg.png',
  'THAI VIETJET AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'VIETJET AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'AIR ASIA':'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/120px-AirAsia_New_Logo.svg.png',
  'INDIGO AIRLINES':'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/120px-IndiGo_Airlines_logo.svg.png',
  'KOREAN AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KoreanAir_logo.svg/120px-KoreanAir_logo.svg.png',
  'EVA AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/EVA_Air_logo.svg/120px-EVA_Air_logo.svg.png',
  'EMIRATES':'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/120px-Emirates_logo.svg.png',
  'QATAR AIRWAYS':'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/120px-Qatar_Airways_Logo.svg.png',
  'SINGAPORE AIRLINES':'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/120px-Singapore_Airlines_Logo_2.svg.png',
  'CATHAY PACIFIC':'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Cathay_Pacific_logo.svg/120px-Cathay_Pacific_logo.svg.png',
  'THAI AIRWAYS':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Thai_Airways_Logo.svg/120px-Thai_Airways_Logo.svg.png',
};

interface Dep { id:string; startDate:string; endDate:string; priceAdult:number; priceChild:number; priceSingle:number; priceInfant:number; deposit:number; totalSeats:number; booked:number; remainingSeats:number; status:string; bus:string; }
interface Flight { route:string; flightNo:string; departure:string; arrival:string; airline:string; }
interface Tour { id:string; slug:string; code:string; title:string; supplier:{id:string;name:string}; country:string; city:string; duration:{days:number;nights:number}; images:string[]; price:{starting:number}; summary:string; highlights:string[]; pdfUrl?:string; flight?:{airline:string}; flights?:Flight[]; departures:Dep[]; included:string[]; excluded:string[]; }

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<Tour|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`/api/tours/${params.slug}`).then(r=>r.json()).then(d=>{ if(d.tour) setTour(d.tour); else setErr(d.error||'ไม่พบทัวร์'); }).catch(()=>setErr('เกิดข้อผิดพลาด')).finally(()=>setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12"><div className="animate-pulse space-y-4"><div className="h-5 bg-slate-200 rounded w-1/3"/><div className="h-48 bg-slate-100 rounded-xl"/></div></div>;
  if (err || !tour) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="text-5xl mb-4">🔍</div><h1 className="text-xl font-bold mb-2">ไม่พบโปรแกรมทัวร์</h1><p className="text-slate-500 mb-6 text-sm">{err}</p><Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link></div>;

  const rawAir = tour.flight?.airline;
  const airName = (rawAir && rawAir !== 'ตามโปรแกรมทัวร์') ? rawAir : null;
  const airLogo = airName ? AL[airName.toUpperCase()] || '' : '';
  const deps = showAll ? tour.departures : tour.departures.slice(0, 4);
  const fmt = (s:string) => { try { return new Date(s).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}); } catch { return s; } };
  const price = (n:number) => n > 0 ? `฿${n.toLocaleString()}` : '-';

  return (
    <div className="bg-slate-50 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100"><div className="max-w-7xl mx-auto px-4 py-2.5 text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary-600">หน้าหลัก</Link><Ch/><Link href="/search" className="hover:text-primary-600">ค้นหาทัวร์</Link><Ch/><Link href={`/search?q=${encodeURIComponent(tour.country)}`} className="hover:text-primary-600">ทัวร์{tour.country}</Link><Ch/><span className="text-slate-700 font-semibold">{tour.code}</span>
      </div></div>

      {/* ─── HERO: 2 columns ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* IMAGE — 45% */}
            <div className="lg:w-[45%] rounded-xl overflow-hidden bg-slate-100 relative flex-shrink-0" style={{minHeight:280}}>
              <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover absolute inset-0"/>
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">{tour.code}</div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{tour.duration.days}วัน</span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{tour.duration.nights}คืน</span>
              </div>
              {airName && <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                {airLogo ? <img src={airLogo} alt="" className="h-3.5 w-auto" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/> : <span>✈️</span>}
                <span>{airName}</span>
              </div>}
            </div>

            {/* INFO — 55% */}
            <div className="lg:w-[55%] flex flex-col min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><span>🌍 {tour.country}</span><span>·</span><span>รหัสทัวร์ : {tour.code}</span></div>
              <h1 className="text-base md:text-lg font-black text-slate-900 leading-snug mb-2">{tour.title}</h1>
              <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                <span>🗓️ <b>{tour.duration.days} วัน {tour.duration.nights} คืน</b></span>
                <span>👥 <b>เดินทางขั้นต่ำ 0 ท่าน</b></span>
              </div>

              {/* Airline */}
              {airName && <div className="flex items-center gap-2.5 p-2 bg-blue-50/80 rounded-lg border border-blue-100 mb-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 shrink-0 overflow-hidden">
                  {airLogo ? <img src={airLogo} alt="" className="w-5 h-5 object-contain" onError={e=>{(e.target as HTMLImageElement).outerHTML='<span class="text-sm">✈️</span>'}}/> : <span className="text-sm">✈️</span>}
                </div>
                <div><div className="font-bold text-slate-800 text-xs">{airName}</div><div className="text-[10px] text-slate-400">บริการอาหารบนเครื่อง</div></div>
              </div>}

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && <div className="mb-3">
                <h3 className="text-xs font-bold text-slate-700 mb-1">⭐ ไฮไลท์ทัวร์</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/50 rounded-lg p-2 border border-amber-100/50">{tour.highlights.join(' • ')}</p>
              </div>}

              {/* Price + PDF + Booking */}
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                {tour.price.starting > 0 && <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white px-4 py-2 rounded-lg">
                  <span className="text-[10px] text-white/70 block">ราคาเริ่มต้น</span>
                  <span className="text-xl font-black">{tour.price.starting.toLocaleString()}</span> <span className="text-xs">บาท/ท่าน</span>
                </div>}
                {tour.pdfUrl && <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-primary-300 text-primary-600 rounded-lg font-bold text-xs hover:bg-primary-50 transition-colors">📥 ดาวน์โหลดโปรแกรมทัวร์</a>}
                <Link href={`/book/tour/${tour.slug}`} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow hover:shadow-lg transition-all">จองเลย →</Link>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm">📱 สอบถามเพิ่มเติม</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FLIGHTS ─── */}
      {tour.flights && tour.flights.length > 0 && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">✈️ เที่ยวบิน</h3>
          <div className="flex flex-wrap gap-4">
            {tour.flights.map((f,i) => <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 text-xs">
              <span className={`font-bold ${i < tour.flights!.length/2 ? 'text-primary-600' : 'text-blue-600'}`}>{i < tour.flights!.length/2 ? '→' : '←'}</span>
              <span className="font-bold text-slate-800">{f.flightNo}</span>
              <span className="text-slate-500">{f.route}</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{f.departure}</span>
              <span className="text-slate-300">-</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{f.arrival}</span>
            </div>)}
          </div>
        </div>
      </div>}

      {/* ─── DEPARTURES TABLE ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 px-5 pt-4 pb-2 flex items-center gap-1.5">📅 วันเดินทาง</h3>
          {tour.departures.length > 0 ? <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-emerald-600 text-white text-xs">
                  <th className="text-left px-4 py-2.5">เดินทาง</th>
                  <th className="text-right px-3 py-2.5">ราคา</th>
                  <th className="text-right px-3 py-2.5">เด็ก</th>
                  <th className="text-right px-3 py-2.5">พักเดี่ยว</th>
                  <th className="text-right px-3 py-2.5">มัดจำ</th>
                  <th className="text-center px-3 py-2.5">ที่นั่ง</th>
                  <th className="text-center px-3 py-2.5">จอง</th>
                  <th className="text-center px-3 py-2.5">รับได้</th>
                  <th className="text-center px-3 py-2.5">สถานะ</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {deps.map(d => <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{fmt(d.startDate)} – {fmt(d.endDate)}</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">{price(d.priceAdult)}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{price(d.priceChild)}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{price(d.priceSingle)}</td>
                    <td className="px-3 py-3 text-right text-orange-600 font-bold">{price(d.deposit)}</td>
                    <td className="px-3 py-3 text-center">{d.totalSeats || '-'}</td>
                    <td className="px-3 py-3 text-center">{d.booked || '-'}</td>
                    <td className="px-3 py-3 text-center"><span className={`inline-block min-w-[28px] py-0.5 rounded-full text-xs font-bold ${d.remainingSeats > 5 ? 'bg-emerald-100 text-emerald-700' : d.remainingSeats > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{d.remainingSeats}</span></td>
                    <td className="px-3 py-3 text-center">{d.remainingSeats > 0 ? <Link href={`/book/tour/${tour.slug}?dep=${d.id}`} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-bold hover:bg-primary-700">จอง</Link> : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">เต็ม</span>}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden px-4 pb-2 space-y-2">
              {deps.map(d => <div key={d.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1.5"><span className="text-sm font-medium text-slate-700">{fmt(d.startDate)} – {fmt(d.endDate)}</span>{d.remainingSeats>0 ? <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">เหลือ {d.remainingSeats}</span> : <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">เต็ม</span>}</div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500"><span>ราคา: <b className="text-slate-800">{price(d.priceAdult)}</b></span><span>เด็ก: <b>{price(d.priceChild)}</b></span><span>พักเดี่ยว: <b>{price(d.priceSingle)}</b></span><span>มัดจำ: <b className="text-orange-600">{price(d.deposit)}</b></span></div>
              </div>)}
            </div>
            {tour.departures.length > 4 && <div className="px-5 pb-4"><button onClick={()=>setShowAll(!showAll)} className="text-xs text-primary-600 font-bold hover:underline">📅 {showAll ? '▲ ย่อ' : `ดูวันอื่นเพิ่มเติม (${tour.departures.length-4} รอบ)`}</button></div>}
          </> : <p className="text-sm text-slate-400 px-5 py-6 text-center">ยังไม่มีรอบเดินทาง — สอบถามทาง LINE</p>}
        </div>
      </div>

      {/* LINE CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0"><svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-500" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg></div><div><h3 className="text-base font-black">สอบถามเพิ่มเติมทาง LINE</h3><p className="text-emerald-100 text-[11px]">เช็คที่นั่ง โปรโมชั่น ขอใบเสนอราคา</p></div></div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-emerald-600 hover:bg-emerald-50 px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105">ติดต่อผ่าน LINE 💬</a>
        </div>
      </div>

      {/* Mobile Bottom */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center">
        <div><p className="text-[10px] text-slate-500">ราคาเริ่มต้น</p>{tour.price.starting>0 ? <p className="text-lg font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p> : <p className="text-sm font-bold text-slate-400">สอบถาม</p>}</div>
        <div className="flex gap-2"><a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-bold text-sm shadow">💬</a><Link href={`/book/tour/${tour.slug}`} className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg">จองเลย →</Link></div>
      </div>
    </div>
  );
}

function Ch() { return <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>; }
