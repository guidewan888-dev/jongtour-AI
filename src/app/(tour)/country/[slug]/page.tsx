'use client';
import React, { useState, useEffect } from 'react';
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

// Country slug → Thai name mapping
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
  'bhutan': { name: 'ภูฏาน', emoji: '🇧🇹' },
  'nepal': { name: 'เนปาล', emoji: '🇳🇵' },
  'russia': { name: 'รัสเซีย', emoji: '🇷🇺' },
  'australia': { name: 'ออสเตรเลีย', emoji: '🇦🇺' },
  'newzealand': { name: 'นิวซีแลนด์', emoji: '🇳🇿' },
};

export default function CountryPage({ params }: { params: { slug: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommend');

  const countryInfo = COUNTRY_MAP[params.slug] || { name: params.slug, emoji: '🌍' };

  useEffect(() => {
    fetch(`/api/tours/list?country=${encodeURIComponent(countryInfo.name)}&limit=100`)
      .then(r => r.json())
      .then(data => {
        if (data.tours) setTours(data.tours);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [countryInfo.name]);

  const sortedTours = [...tours].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // recommend = default order
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBoMnYySDM2VjR6TTIgNGgydjJIMlY0em0wIDMwaDJ2Mkgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <nav className="text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white">หน้าหลัก</Link>
            <span className="mx-2">›</span>
            <Link href="/search" className="hover:text-white">ค้นหาทัวร์</Link>
            <span className="mx-2">›</span>
            <span className="text-white">ทัวร์{countryInfo.name}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{countryInfo.emoji}</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">ทัวร์{countryInfo.name}</h1>
              <p className="text-white/80 text-lg mt-2">
                {loading ? 'กำลังค้นหา...' : `พบ ${tours.length} โปรแกรมทัวร์`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? 'กำลังโหลด...' : `แสดง ${sortedTours.length} โปรแกรม`}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="g-input !w-auto !py-2 !text-sm"
          >
            <option value="recommend">แนะนำ</option>
            <option value="price-asc">ราคา: ต่ำ → สูง</option>
            <option value="price-desc">ราคา: สูง → ต่ำ</option>
          </select>
        </div>

        {/* Tour List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="g-card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sortedTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTours.map(tour => (
              <Link key={tour.id} href={`/tour/${tour.slug}`} className="g-card-interactive p-5 block group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{tour.code}</span>
                  <span className="text-xs text-primary-600 font-semibold">{tour.supplier}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {tour.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {tour.durationDays}วัน{tour.durationNights}คืน
                    {tour.nextDeparture !== 'N/A' && ` • ${tour.nextDeparture}`}
                  </div>
                  <div className="text-right">
                    {tour.price > 0 ? (
                      <div className="text-lg font-bold text-primary-600">฿{tour.price.toLocaleString()}</div>
                    ) : (
                      <div className="text-sm text-slate-400">สอบถามราคา</div>
                    )}
                  </div>
                </div>
                {tour.availableSeats > 0 && tour.availableSeats <= 10 && (
                  <div className="mt-2 text-xs text-red-600 font-semibold">🔥 เหลือ {tour.availableSeats} ที่</div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="g-card p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-bold text-slate-900 mb-2">ยังไม่มีทัวร์{countryInfo.name}</p>
            <p className="text-slate-500 mb-6">กรุณากลับมาตรวจสอบใหม่ หรือค้นหาทัวร์อื่น</p>
            <Link href="/search" className="btn-primary">ค้นหาทัวร์ทั้งหมด</Link>
          </div>
        )}
      </div>
    </div>
  );
}
