'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';
const AL: Record<string,string> = {
  'TURKISH AIRLINES':'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Turkish_Airlines_logo_2019_compact.svg/120px-Turkish_Airlines_logo_2019_compact.svg.png',
  'THAI VIETJET AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'VIETJET AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
  'AIR ASIA':'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/120px-AirAsia_New_Logo.svg.png',
  'THAI AIRASIA':'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/120px-AirAsia_New_Logo.svg.png',
  'THAI AIRASIA X':'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/120px-AirAsia_New_Logo.svg.png',
  'INDIGO AIRLINES':'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IndiGo_Airlines_logo.svg/120px-IndiGo_Airlines_logo.svg.png',
  'KOREAN AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/KoreanAir_logo.svg/120px-KoreanAir_logo.svg.png',
  'EVA AIR':'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/EVA_Air_logo.svg/120px-EVA_Air_logo.svg.png',
  'EMIRATES':'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/120px-Emirates_logo.svg.png',
  'QATAR AIRWAYS':'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/120px-Qatar_Airways_Logo.svg.png',
  'SINGAPORE AIRLINES':'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/120px-Singapore_Airlines_Logo_2.svg.png',
  'SINGPORE AIRLINE':'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/120px-Singapore_Airlines_Logo_2.svg.png',
  'CATHAY PACIFIC':'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Cathay_Pacific_logo.svg/120px-Cathay_Pacific_logo.svg.png',
  'THAI AIRWAYS':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Thai_Airways_Logo.svg/120px-Thai_Airways_Logo.svg.png',
  'JAPAN AIRLINES':'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Japan_Airlines_logo_%282011%29.svg/120px-Japan_Airlines_logo_%282011%29.svg.png',
  'ALL NIPPON AIRWAYS':'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/All_Nippon_Airways_Logo.svg/120px-All_Nippon_Airways_Logo.svg.png',
  'THAI VIETJET':'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/VietJetAir_logo.svg/120px-VietJetAir_logo.svg.png',
};

interface Dep { id:string; startDate:string; endDate:string; priceAdult:number; priceChild:number; priceSingle:number; priceInfant:number; deposit:number; totalSeats:number; booked:number; remainingSeats:number; status:string; bus:string; }
interface Flight { route:string; flightNo:string; departure:string; arrival:string; airline:string; }
interface Tour { id:string; slug:string; code:string; title:string; supplier:{id:string;name:string}; country:string; city:string; duration:{days:number;nights:number}; images:string[]; price:{starting:number}; summary:string; highlights:string[]; pdfUrl?:string; flight?:{airline:string}; flights?:Flight[]; departures:Dep[]; included:string[]; excluded:string[]; }
interface RecTour { slug:string; title:string; code:string; imageUrl:string; price:number; days:number; nights:number; country:string; supplierName:string; }

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<Tour|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [recs, setRecs] = useState<RecTour[]>([]);

  useEffect(() => {
    fetch(`/api/tours/${params.slug}`).then(r=>r.json()).then(d=>{
      if(d.tour) { setTour(d.tour); fetchRecs(d.tour.country, d.tour.slug); }
      else setErr(d.error||'ไม่พบทัวร์');
    }).catch(()=>setErr('เกิดข้อผิดพลาด')).finally(()=>setLoading(false));
  }, [params.slug]);

  const mapTour = (t: any): RecTour => ({ slug: t.slug, title: t.title || t.tourName || '', code: t.code || t.tourCode || '', imageUrl: t.imageUrl || t.images?.[0] || '', price: t.price || t.startingPrice || 0, days: t.days || t.durationDays || 0, nights: t.nights || t.durationNights || 0, country: t.country || '', supplierName: t.supplierName || '' });

  const fetchRecs = async (country: string, currentSlug: string) => {
    try {
      // Try same country first
      let r = await fetch(`/api/tours/list?country=${encodeURIComponent(country)}&limit=20`);
      let d = await r.json();
      let filtered = (d.tours || []).filter((t: any) => t.slug !== currentSlug);
      // Fallback to all tours if country returns too few
      if (filtered.length < 4) {
        r = await fetch('/api/tours/list?limit=20');
        d = await r.json();
        filtered = (d.tours || []).filter((t: any) => t.slug !== currentSlug);
      }
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 4);
      setRecs(shuffled.map(mapTour));
    } catch {}
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12"><div className="animate-pulse space-y-4"><div className="h-5 bg-slate-200 rounded w-1/3"/><div className="h-48 bg-slate-100 rounded-xl"/></div></div>;
  if (err || !tour) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="text-5xl mb-4">🔍</div><h1 className="text-xl font-bold mb-2">ไม่พบโปรแกรมทัวร์</h1><p className="text-slate-500 mb-6 text-sm">{err}</p><Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link></div>;

  const rawAir = tour.flight?.airline;
  const airName = (rawAir && rawAir !== 'ตามโปรแกรมทัวร์') ? rawAir : null;
  const airLogo = airName ? AL[airName.toUpperCase()] || AL[airName.toUpperCase().replace(/ /g,' ')] || '' : '';
  const availableDeps = tour.departures.filter(d => d.remainingSeats > 0);
  const deps = showAll ? availableDeps : availableDeps.slice(0, 4);
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
            {/* IMAGE */}
            <div className="lg:w-[45%] rounded-xl overflow-hidden bg-white border border-slate-200 relative flex-shrink-0" style={{minHeight:280}}>
              <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-contain absolute inset-0"/>
              <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded">{tour.code}</div>
              <div className="absolute top-2.5 right-2.5 flex gap-1">
                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded">{tour.duration.days}วัน</span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">{tour.duration.nights}คืน</span>
              </div>
              {airName && <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                {airLogo ? <img src={airLogo} alt="" className="h-4 w-auto" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/> : <span>✈️</span>}
                <span className="text-slate-700">{airName}</span>
              </div>}
            </div>

            {/* INFO */}
            <div className="lg:w-[55%] flex flex-col min-w-0">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1.5"><span>🌍 {tour.country}</span><span>·</span><span>รหัสทัวร์ : {tour.code}</span></div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-3">{tour.title}</h1>
              <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
                <span>🗓️ <b>{tour.duration.days} วัน {tour.duration.nights} คืน</b></span>
                <span>👥 <b>เดินทางขั้นต่ำ 0 ท่าน</b></span>
              </div>

              {/* Airline */}
              {airName && <div className="flex items-center gap-3 p-2.5 bg-blue-50/80 rounded-lg border border-blue-100 mb-3">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-100 shrink-0 overflow-hidden">
                  {airLogo ? <img src={airLogo} alt="" className="w-6 h-6 object-contain" onError={e=>{(e.target as HTMLImageElement).outerHTML='<span class="text-base">✈️</span>'}}/> : <span className="text-base">✈️</span>}
                </div>
                <div><div className="font-bold text-slate-800 text-sm">{airName}</div><div className="text-xs text-slate-400">บริการอาหารบนเครื่อง</div></div>
              </div>}

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 mb-1.5">⭐ ไฮไลท์ทัวร์</h3>
                <div className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 rounded-lg p-3 border border-amber-100/50 space-y-1">
                  {tour.highlights.slice(0, 6).map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold shrink-0">●</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                {tour.pdfUrl && <a href={tour.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors shadow-sm">📥 ดาวน์โหลดโปรแกรมทัวร์</a>}
                <Link href={`/book/tour/${tour.slug}`} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">จองเลย →</Link>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm">📱 สอบถามเพิ่มเติม</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FLIGHTS ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">✈️ เที่ยวบิน</h3>
          {tour.flights && tour.flights.length > 0 ? <div className="flex flex-wrap gap-3">
            {tour.flights.map((f,i) => <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-4 py-2.5 text-sm">
              <span className={`font-bold text-lg ${i < tour.flights!.length/2 ? 'text-primary-600' : 'text-blue-600'}`}>{i < tour.flights!.length/2 ? '→' : '←'}</span>
              <span className="font-bold text-slate-800">{f.flightNo}</span>
              <span className="text-slate-400">{f.route}</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold text-xs">{f.departure}</span>
              <span className="text-slate-300">–</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold text-xs">{f.arrival}</span>
            </div>)}
          </div> : <p className="text-sm text-slate-400">สามารถดูได้จากในโปรแกรมทัวร์</p>}
        </div>
      </div>

      {/* ─── DEPARTURES TABLE ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 px-5 pt-4 pb-2 flex items-center gap-1.5">📅 วันเดินทาง</h3>
          {availableDeps.length > 0 ? <>
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
                    <td className="px-3 py-3 text-center"><span className={`inline-block min-w-[28px] py-0.5 rounded-full text-xs font-bold ${d.remainingSeats > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.remainingSeats}</span></td>
                    <td className="px-3 py-3 text-center"><Link href={`/book/tour/${tour.slug}?dep=${d.id}`} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-bold hover:bg-primary-700">จอง</Link></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="md:hidden px-4 pb-2 space-y-2">
              {deps.map(d => <div key={d.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1.5"><span className="text-sm font-medium text-slate-700">{fmt(d.startDate)} – {fmt(d.endDate)}</span><span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">เหลือ {d.remainingSeats}</span></div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-500"><span>ราคา: <b className="text-slate-800">{price(d.priceAdult)}</b></span><span>เด็ก: <b>{price(d.priceChild)}</b></span><span>พักเดี่ยว: <b>{price(d.priceSingle)}</b></span><span>มัดจำ: <b className="text-orange-600">{price(d.deposit)}</b></span></div>
              </div>)}
            </div>
            {availableDeps.length > 4 && <div className="px-5 pb-4"><button onClick={()=>setShowAll(!showAll)} className="text-xs text-primary-600 font-bold hover:underline">📅 {showAll ? '▲ ย่อ' : `ดูวันอื่นเพิ่มเติม (${availableDeps.length-4} รอบ)`}</button></div>}
          </> : <p className="text-sm text-slate-400 px-5 py-6 text-center">ยังไม่มีรอบเดินทาง — สอบถามทาง LINE</p>}
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

      {/* ─── RECOMMENDED TOURS ─── */}
      {recs.length > 0 && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h3 className="text-base font-bold text-slate-900 mb-4">🔥 โปรแกรมทัวร์แนะนำ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recs.map(r => (
            <Link key={r.slug} href={`/tour/${r.slug}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="relative h-36 bg-slate-100 overflow-hidden">
                {r.imageUrl ? <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <div className="w-full h-full flex items-center justify-center text-3xl">🌍</div>}
                <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{r.code}</div>
                {r.days > 0 && <div className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{r.days}D{r.nights}N</div>}
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-900 font-bold leading-tight line-clamp-2 mb-1.5">{r.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{r.supplierName}</span>
                  {r.price > 0 && <span className="text-xs font-black text-primary-600">฿{r.price.toLocaleString()}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>}

      {/* Mobile Bottom */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center">
        <div><p className="text-[10px] text-slate-500">ราคาเริ่มต้น</p>{tour.price.starting>0 ? <p className="text-lg font-black text-primary-600">฿{tour.price.starting.toLocaleString()}</p> : <p className="text-sm font-bold text-slate-400">สอบถาม</p>}</div>
        <div className="flex gap-2"><a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-bold text-sm shadow">💬</a><Link href={`/book/tour/${tour.slug}`} className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-sm shadow-lg">จองเลย →</Link></div>
      </div>
    </div>
  );
}

function Ch() { return <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>; }
