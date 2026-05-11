'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Search, Users, MapPin, Calendar, ChevronRight, Loader2 } from 'lucide-react';

interface FlashTour {
  id: string;
  code: string;
  title: string;
  country: string;
  image: string | null;
  supplier: string;
  type: 'api' | 'scraper';
  price: number;
  departureDate: string | null;
  availableSeats: number | null;
  totalDepartures: number;
  dealType?: 'fire' | 'discount';
  pdfUrl?: string;
  link: string;
}

const SUPPLIER_STYLES: Record<string, { gradient: string; ring: string }> = {
  "Let's Go": { gradient: 'from-green-600 to-emerald-700', ring: 'ring-green-400' },
  "Tour Factory": { gradient: 'from-purple-600 to-violet-700', ring: 'ring-purple-400' },
  "Check-in Group": { gradient: 'from-teal-600 to-cyan-700', ring: 'ring-teal-400' },
  "World Connection": { gradient: 'from-orange-600 to-red-600', ring: 'ring-orange-400' },
  "iTravels Center": { gradient: 'from-sky-600 to-blue-700', ring: 'ring-sky-400' },
  "Best International": { gradient: 'from-rose-600 to-pink-700', ring: 'ring-rose-400' },
  "GS25 Travel": { gradient: 'from-emerald-600 to-green-700', ring: 'ring-emerald-400' },
  "Go365 Travel": { gradient: 'from-blue-600 to-indigo-700', ring: 'ring-blue-400' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'เร็วๆ นี้';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function FlashSalePage() {
  const [grouped, setGrouped] = useState<Record<string, FlashTour[]>>({});
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDealType, setActiveDealType] = useState<'all' | 'fire' | 'discount'>('all');

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    // Set countdown to midnight
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real data
  useEffect(() => {
    setLoading(true);
    fetch('/api/tours/flash-sale')
      .then(r => r.json())
      .then(d => {
        setGrouped(d.grouped || {});
        setSuppliers(d.suppliers || []);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allTours = React.useMemo(() => Object.values(grouped).flat(), [grouped]);
  const fireCount = React.useMemo(
    () => allTours.filter((t) => (t.dealType || 'fire') === 'fire').length,
    [allTours],
  );
  const discountCount = React.useMemo(
    () => allTours.filter((t) => t.dealType === 'discount').length,
    [allTours],
  );

  const groupedByDealType = React.useMemo(() => {
    if (activeDealType === 'all') return grouped;
    const next: Record<string, FlashTour[]> = {};
    for (const supplier of suppliers) {
      const tours = (grouped[supplier] || []).filter((t) =>
        activeDealType === 'fire' ? (t.dealType || 'fire') === 'fire' : t.dealType === 'discount'
      );
      if (tours.length > 0) next[supplier] = tours;
    }
    return next;
  }, [activeDealType, grouped, suppliers]);

  const visibleTotal = React.useMemo(
    () => Object.values(groupedByDealType).flat().length,
    [groupedByDealType],
  );

  const filteredSuppliers = React.useMemo(() => {
    const base = activeFilter === 'all' ? suppliers : suppliers.filter(s => s === activeFilter);
    return base.filter((s) => (groupedByDealType[s]?.length || 0) > 0);
  }, [activeFilter, suppliers, groupedByDealType]);

  return (
    <div className="bg-slate-50 selection:bg-red-200 selection:text-red-900 min-h-screen">
      <main>
        {/* 1. Hero & Countdown */}
        <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-red-700">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,100 L100,0 Z" fill="white" />
              <path d="M0,100 L100,0 L0,0 Z" fill="black" />
            </svg>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm tracking-wider uppercase mb-6 shadow-sm border border-white/30">
              <Flame className="w-5 h-5 animate-pulse text-yellow-300" />
              Jongtour Flash Sale — ข้อมูลจริงจากโฮลเซล
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
              ทัวร์ไฟไหม้ <span className="text-yellow-300">ลดราคา!</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 font-medium">
              ดีลหลุดจอง เดินทางเร็ว จากโฮลเซล {suppliers.length} เจ้า รวม {total} โปรแกรม
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-4 mb-12">
              {[
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' },
              ].map((t, i) => (
                <React.Fragment key={t.label}>
                  {i > 0 && <div className="text-3xl font-black text-white/50 self-center -mt-4">:</div>}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl w-20 h-24 flex flex-col items-center justify-center shadow-lg">
                    <span className={`text-3xl font-black ${t.label === 'Secs' ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
                      {t.value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-white/70 uppercase tracking-widest mt-1">{t.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* AI Search */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2 relative z-20">
              <div className="flex-1 relative flex items-center">
                <Search className="w-6 h-6 text-red-500 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="หาโปรไฟไหม้ที่ไหน? เช่น 'ญี่ปุ่น วันเสาร์นี้'"
                />
              </div>
              <a
                href={`/ai-search?q=${encodeURIComponent(aiQuery)}&filter=flash-sale`}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all flex items-center justify-center whitespace-nowrap"
              >
                ให้ AI ค้นหาด่วน
              </a>
            </div>
          </div>
        </section>

        {/* 2. Supplier Filter */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar mb-3">
              <span className="text-sm font-bold text-slate-800 shrink-0 mr-2">ประเภทดีล:</span>
              <button
                onClick={() => setActiveDealType('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  activeDealType === 'all' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'
                }`}
              >
                ทั้งหมด ({total})
              </button>
              <button
                onClick={() => setActiveDealType('fire')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  activeDealType === 'fire' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'
                }`}
              >
                🔥 ไฟไหม้ ({fireCount})
              </button>
              <button
                onClick={() => setActiveDealType('discount')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  activeDealType === 'discount' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                }`}
              >
                🏷️ ลดราคา ({discountCount})
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
              <span className="text-sm font-bold text-slate-800 shrink-0 mr-2">ตัวกรอง:</span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  activeFilter === 'all' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'
                }`}
              >
                ทั้งหมด ({visibleTotal})
              </button>
              {suppliers.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                    activeFilter === s ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  {s} ({groupedByDealType[s]?.length || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Tour Listings by Supplier */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600">กำลังโหลดทัวร์ไฟไหม้...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-20">
              <Flame className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-500">ยังไม่มีทัวร์ไฟไหม้ในขณะนี้</p>
              <p className="text-sm text-slate-400 mt-2">กรุณากลับมาเช็คใหม่อีกครั้ง</p>
            </div>
          ) : (
            <section className="space-y-16">
              {filteredSuppliers.map(supplier => {
                const tours = groupedByDealType[supplier] || [];
                if (tours.length === 0) return null;
                const styles = SUPPLIER_STYLES[supplier] || { gradient: 'from-slate-600 to-slate-700', ring: 'ring-slate-400' };

                return (
                  <div key={supplier}>
                    {/* Supplier Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${styles.gradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                          <Flame className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            ดีลจาก {supplier}
                          </h3>
                          <p className="text-red-500 mt-1 font-bold text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tours.length} โปรแกรมลดราคา — ต้องตัดสินใจด่วน!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tour Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {tours.map(tour => {
                        const days = daysUntil(tour.departureDate);
                        return (
                          <Link
                            key={tour.id}
                            href={tour.link}
                            className="bg-white rounded-2xl shadow-md border border-orange-200 overflow-hidden hover:shadow-xl hover:border-orange-400 transition-all group flex flex-col relative"
                          >
                            {/* Flash Sale Banner */}
                              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-r from-red-600 to-orange-500 z-20 flex items-center justify-center text-white text-xs font-bold tracking-widest shadow-sm">
                                <Flame className="w-4 h-4 mr-1 animate-pulse" />
                                {tour.dealType === 'discount'
                                  ? 'DISCOUNT DEAL'
                                  : days !== null && days <= 7
                                    ? `บินใน ${days} วัน!`
                                    : 'FLASH SALE'}
                              </div>

                            {/* Image */}
                            <div className="relative bg-slate-200 overflow-hidden shrink-0 h-56 w-full pt-8">
                              {days !== null && (
                                <div className="absolute top-10 right-3 bg-red-600 text-white font-black px-3 py-1.5 rounded-lg shadow-lg z-10 rotate-3 text-sm">
                                  {days <= 3 ? '🔥 ด่วนมาก!' : days <= 7 ? `อีก ${days} วัน` : `${days} วัน`}
                                </div>
                              )}
                              {tour.image ? (
                                <img src={tour.image} alt={tour.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center text-4xl">✈️</div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-red-50/30">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <MapPin className="w-3 h-3" />
                                  <span>{tour.country || '-'}</span>
                                </div>
                                {tour.departureDate && (
                                  <div className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(tour.departureDate)}
                                  </div>
                                )}
                              </div>

                              <h4 className="font-bold text-slate-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                                {tour.title}
                              </h4>

                              {/* Supplier & Seats */}
                              <div className="flex justify-between items-center mb-4 text-xs font-medium border-b border-red-100 pb-4">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <span className="font-semibold">{tour.supplier}</span>
                                </div>
                                {tour.availableSeats !== null && (
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                                    tour.availableSeats <= 4 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  }`}>
                                    <Users className="w-3 h-3" />
                                    เหลือ {tour.availableSeats} ที่
                                  </div>
                                )}
                              </div>

                              {/* Price */}
                              <div className="mt-auto">
                                <div className="flex justify-between items-end mb-4">
                                  <div className="text-xs text-slate-400">{tour.code}</div>
                                  <div className="text-right">
                                    <div className="text-[10px] font-bold text-red-500 mb-0.5">
                                      {tour.dealType === 'discount' ? '🏷️ ราคาลดพิเศษ' : '🔥 ราคาไฟไหม้'}
                                    </div>
                                    <div className="text-2xl font-black text-red-600 tracking-tight leading-none">
                                      ฿{tour.price.toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md transition-colors">
                                  ดูรายละเอียด <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* FAQ */}
          <section className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">ข้อควรรู้ก่อนจองทัวร์ไฟไหม้</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  ทัวร์ไฟไหม้คืออะไร ทำไมถึงถูก?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  คือที่นั่งหลุดจอง หรือโฮลเซลล์ขายไม่หมดก่อนวันเดินทาง จึงนำมาลดราคาพิเศษเพื่อปิดกรุ๊ป คุณภาพและการบริการเหมือนจองราคาเต็มทุกประการ
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  เงื่อนไขการชำระเงิน?
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  เนื่องจากเป็นโปรแกรมที่ต้องเดินทางด่วน ลูกค้าต้องชำระเงินเต็มจำนวนทันทีหลังได้รับการคอนเฟิร์มที่นั่ง ไม่สามารถมัดจำได้
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <div className="inline-flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">กลัวพลาดดีลเด็ด?</h3>
              <p className="text-slate-600 mb-6">เข้าร่วมกลุ่ม LINE VIP อัปเดตโปรไฟไหม้ก่อนใครทุกวัน</p>
              <a href="https://lin.ee/jongtour" className="bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md flex items-center gap-2">
                เข้ากลุ่ม LINE แจ้งเตือนโปรไฟไหม้
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
