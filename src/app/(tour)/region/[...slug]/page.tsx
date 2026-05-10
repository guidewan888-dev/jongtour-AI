'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TourCard from '@/components/tour/TourCard';

interface Tour {
  id: string; slug: string; code: string; title: string; supplier: string;
  country: string; city: string; durationDays: number; durationNights: number;
  nextDeparture: string; price: number; availableSeats: number; imageUrl?: string;
  airline?: string;
}

const REGION_DATA: Record<string, { name: string; nameEn: string; desc: string; countries: { name: string; slug: string; flagCode: string; searchNames: string[] }[] }> = {
  asia: {
    name: 'เอเชีย', nameEn: 'Asia',
    desc: 'เปิดโลกแห่งเอเชีย ให้ทุกการเดินทางเป็นความทรงจำที่ยิ่งใหญ่',
    countries: [
      { name: 'ญี่ปุ่น', slug: 'japan', flagCode: 'jp', searchNames: ['ญี่ปุ่น', 'JAPAN'] },
      { name: 'เกาหลีใต้', slug: 'south-korea', flagCode: 'kr', searchNames: ['เกาหลี', 'KOREA', 'SOUTH KOREA'] },
      { name: 'จีน', slug: 'china', flagCode: 'cn', searchNames: ['จีน', 'CHINA'] },
      { name: 'ไต้หวัน', slug: 'taiwan', flagCode: 'tw', searchNames: ['ไต้หวัน', 'TAIWAN'] },
      { name: 'เวียดนาม', slug: 'vietnam', flagCode: 'vn', searchNames: ['เวียดนาม', 'VIETNAM'] },
      { name: 'ฮ่องกง', slug: 'hongkong', flagCode: 'hk', searchNames: ['ฮ่องกง', 'HONG KONG'] },
      { name: 'สิงคโปร์', slug: 'singapore', flagCode: 'sg', searchNames: ['สิงคโปร์', 'SINGAPORE'] },
      { name: 'มาเลเซีย', slug: 'malaysia', flagCode: 'my', searchNames: ['มาเลเซีย', 'MALAYSIA'] },
      { name: 'อินเดีย', slug: 'india', flagCode: 'in', searchNames: ['อินเดีย', 'INDIA'] },
      { name: 'กัมพูชา', slug: 'cambodia', flagCode: 'kh', searchNames: ['กัมพูชา', 'CAMBODIA'] },
      { name: 'พม่า', slug: 'myanmar', flagCode: 'mm', searchNames: ['พม่า', 'MYANMAR'] },
      { name: 'ลาว', slug: 'laos', flagCode: 'la', searchNames: ['ลาว', 'LAOS'] },
      { name: 'มาเก๊า', slug: 'macau', flagCode: 'mo', searchNames: ['มาเก๊า', 'MACAU'] },
    ],
  },
  europe: {
    name: 'ยุโรป', nameEn: 'Europe',
    desc: 'สัมผัสเสน่ห์ยุโรป วัฒนธรรมเก่าแก่ สถาปัตยกรรมอลังการ',
    countries: [
      { name: 'อังกฤษ', slug: 'uk', flagCode: 'gb', searchNames: ['อังกฤษ', 'ENGLAND', 'UK', 'UNITED KINGDOM'] },
      { name: 'ฝรั่งเศส', slug: 'france', flagCode: 'fr', searchNames: ['ฝรั่งเศส', 'FRANCE'] },
      { name: 'อิตาลี', slug: 'italy', flagCode: 'it', searchNames: ['อิตาลี', 'ITALY'] },
      { name: 'สวิตเซอร์แลนด์', slug: 'switzerland', flagCode: 'ch', searchNames: ['สวิตเซอร์แลนด์', 'SWITZERLAND'] },
      { name: 'เยอรมนี', slug: 'germany', flagCode: 'de', searchNames: ['เยอรมนี', 'เยอรมัน', 'GERMANY'] },
      { name: 'สเปน', slug: 'spain', flagCode: 'es', searchNames: ['สเปน', 'SPAIN'] },
      { name: 'เนเธอร์แลนด์', slug: 'netherlands', flagCode: 'nl', searchNames: ['เนเธอร์แลนด์', 'NETHERLANDS'] },
      { name: 'ออสเตรีย', slug: 'austria', flagCode: 'at', searchNames: ['ออสเตรีย', 'AUSTRIA'] },
      { name: 'สแกนดิเนเวีย', slug: 'scandinavia', flagCode: 'se', searchNames: ['สแกนดิเนเวีย', 'SCANDINAVIA'] },
      { name: 'บอลติก', slug: 'baltic', flagCode: 'lv', searchNames: ['บอลติก', 'BALTIC'] },
      { name: 'นอร์เวย์', slug: 'norway', flagCode: 'no', searchNames: ['นอร์เวย์', 'NORWAY'] },
      { name: 'ฟินแลนด์', slug: 'finland', flagCode: 'fi', searchNames: ['ฟินแลนด์', 'FINLAND'] },
      { name: 'เดนมาร์ก', slug: 'denmark', flagCode: 'dk', searchNames: ['เดนมาร์ก', 'DENMARK'] },
      { name: 'เบลเยียม', slug: 'belgium', flagCode: 'be', searchNames: ['เบลเยียม', 'BELGIUM'] },
      { name: 'เช็ก', slug: 'czech', flagCode: 'cz', searchNames: ['เช็ก', 'CZECH REPUBLIC', 'CZECH'] },
      { name: 'ฮังการี', slug: 'hungary', flagCode: 'hu', searchNames: ['ฮังการี', 'HUNGARY'] },
      { name: 'โปรตุเกส', slug: 'portugal', flagCode: 'pt', searchNames: ['โปรตุเกส', 'PORTUGAL'] },
      { name: 'ยุโรป (รวม)', slug: 'europe-multi', flagCode: 'eu', searchNames: ['ยุโรป', 'EUROPE'] },
    ],
  },
  'middle-east': {
    name: 'ตะวันออกกลาง', nameEn: 'Middle East',
    desc: 'สัมผัสอารยธรรมโบราณ จากมหาพีระมิดอียิปต์สู่นครดูไบสุดอลังการ',
    countries: [
      { name: 'ตุรกี', slug: 'turkey', flagCode: 'tr', searchNames: ['ตุรกี', 'TURKIYE', 'TURKEY'] },
      { name: 'อียิปต์', slug: 'egypt', flagCode: 'eg', searchNames: ['อียิปต์', 'EGYPT'] },
      { name: 'จอร์แดน', slug: 'jordan', flagCode: 'jo', searchNames: ['จอร์แดน', 'JORDAN'] },
      { name: 'ดูไบ', slug: 'dubai', flagCode: 'ae', searchNames: ['ดูไบ', 'สหรัฐอาหรับเอมิเรตส์', 'DUBAI', 'UAE'] },
    ],
  },
  americas: {
    name: 'อเมริกา', nameEn: 'Americas',
    desc: 'สำรวจทวีปอเมริกา จากมหานครนิวยอร์กถึงน้ำตกไนแองการ่า',
    countries: [
      { name: 'อเมริกา', slug: 'usa', flagCode: 'us', searchNames: ['อเมริกา', 'USA', 'UNITED STATES'] },
      { name: 'แคนาดา', slug: 'canada', flagCode: 'ca', searchNames: ['แคนาดา', 'CANADA'] },
    ],
  },
  oceania: {
    name: 'โอเชียเนีย', nameEn: 'Oceania',
    desc: 'ออสเตรเลีย นิวซีแลนด์ ดินแดนธรรมชาติอันงดงาม',
    countries: [
      { name: 'ออสเตรเลีย', slug: 'australia', flagCode: 'au', searchNames: ['ออสเตรเลีย', 'AUSTRALIA'] },
      { name: 'นิวซีแลนด์', slug: 'newzealand', flagCode: 'nz', searchNames: ['นิวซีแลนด์', 'NEW ZEALAND'] },
    ],
  },
  others: {
    name: 'ทวีป/ประเทศอื่นๆ', nameEn: 'Others',
    desc: 'สำรวจจุดหมายปลายทางใหม่ๆ ที่น่าค้นพบทั่วโลก',
    countries: [
      { name: 'จอร์เจีย', slug: 'georgia', flagCode: 'ge', searchNames: ['จอร์เจีย', 'GEORGIA'] },
      { name: 'รัสเซีย', slug: 'russia', flagCode: 'ru', searchNames: ['รัสเซีย', 'RUSSIA'] },
      { name: 'ภูฏาน', slug: 'bhutan', flagCode: 'bt', searchNames: ['ภูฏาน', 'ภูฎาน', 'BHUTAN'] },
      { name: 'ศรีลังกา', slug: 'srilanka', flagCode: 'lk', searchNames: ['ศรีลังกา', 'SRI LANKA'] },
      { name: 'มองโกเลีย', slug: 'mongolia', flagCode: 'mn', searchNames: ['มองโกเลีย', 'MONGOLIA'] },
      { name: 'เนปาล', slug: 'nepal', flagCode: 'np', searchNames: ['เนปาล', 'NEPAL'] },
      { name: 'มัลดีฟส์', slug: 'maldives', flagCode: 'mv', searchNames: ['มัลดีฟส์', 'MALDIVES'] },
      { name: 'แอฟริกาใต้', slug: 'south-africa', flagCode: 'za', searchNames: ['แอฟริกาใต้', 'SOUTH AFRICA'] },
    ],
  },
};

const SUPPLIERS = [
  { key: "let'sgo", name: "Let's Go", color: 'bg-green-600', logo: '/images/logos/download.png', priority: 1 },
  { key: "checkingroup", name: "Checkin Group", color: 'bg-teal-600', logo: '/images/logos/Check in group.jpg', priority: 2 },
  { key: "tourfactory", name: "Tour Factory", color: 'bg-purple-600', logo: '/images/logos/Tour-Factory.jpg', priority: 3 },
  { key: "go365", name: "Go365", color: 'bg-green-500', logo: '/images/logos/download.jfif', priority: 4 },
  { key: "worldconnection", name: "World Connection", color: 'bg-orange-600', logo: '/images/logos/worldconnection.png', priority: 5 },
  { key: "itravels", name: "iTravels Center", color: 'bg-sky-600', logo: '/images/logos/itravels.png', priority: 6 },
  { key: "bestintl", name: "Best International", color: 'bg-red-600', logo: '/images/logos/bestintl.png', priority: 7 },
  { key: "gs25", name: "GS25 Travel", color: 'bg-emerald-600', logo: '/images/logos/gs25.png', priority: 8 },
];

// Hero banners removed — clean gradient for all regions

const LINE_URL = 'https://line.me/R/ti/p/@jongtour';

export default function RegionPage({ params }: { params: { slug: string[] } }) {
  const regionKey = params.slug?.[0] || 'asia';
  const region = REGION_DATA[regionKey] || REGION_DATA.asia;
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  // Fetch tours — optimized: single batch API call instead of per-country
  useEffect(() => {
    setLoading(true);
    setTours([]);

    // Build a single search query that covers the region
    const allSearchNames = region.countries.flatMap(c => c.searchNames);
    const uniqueNames = [...new Set([region.name, ...allSearchNames])];
    
    // Batch into max 3 API calls to avoid overloading
    const batchSize = Math.ceil(uniqueNames.length / 3);
    const batches: string[][] = [];
    for (let i = 0; i < uniqueNames.length; i += batchSize) {
      batches.push(uniqueNames.slice(i, i + batchSize));
    }

    const promises = batches.map(batch =>
      Promise.all(batch.map(name =>
        fetch(`/api/tours/list?country=${encodeURIComponent(name)}&limit=200`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[])
      )).then(results => results.flat())
    );

    Promise.all(promises).then(results => {
      const allTours = results.flat();
      const seen = new Set<string>();
      const unique = allTours.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
      setTours(unique);
      setLoading(false);
    });
  }, [region]);

  const supplierGroups = useMemo(() => {
    const filtered = activeCountry
      ? tours.filter(t => {
          const countryConfig = region.countries.find(c => c.name === activeCountry);
          if (!countryConfig) return t.country === activeCountry;
          const tc = (t.country || '').toUpperCase();
          // Match by raw DB name OR normalized Thai name OR tour title containing country name
          return countryConfig.searchNames.some(sn => 
            sn.toUpperCase() === tc || (t.title && t.title.includes(sn))
          );
        })
      : tours;
    const groups: Record<string, { tours: Tour[]; countries: Set<string> }> = {};
    filtered.forEach(t => {
      const key = (t.supplier || 'other').toLowerCase();
      if (!groups[key]) groups[key] = { tours: [], countries: new Set() };
      groups[key].tours.push(t);
      groups[key].countries.add(t.country);
    });
    return Object.entries(groups).sort((a, b) => {
      const infoA = SUPPLIERS.find(s => a[0].includes(s.key));
      const infoB = SUPPLIERS.find(s => b[0].includes(s.key));
      return (infoA?.priority || 99) - (infoB?.priority || 99);
    });
  }, [tours, activeCountry]);

  const getSupplierInfo = (key: string) => SUPPLIERS.find(s => key.includes(s.key)) || { name: key, color: 'bg-slate-500', logo: '', priority: 99 };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero — Clean gradient */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-2">ทัวร์{region.name}</h1>
          <p className="text-white/70 text-sm mb-1">พบ {tours.length} โปรแกรม • {region.desc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/search" className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all">🔍 ค้นหาแพ็กเกจทัวร์</Link>
            <Link href="/search?type=wholesale" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold text-sm backdrop-blur-sm border border-white/30 transition-all">🏢 ทัวร์ค้าส่ง (Wholesale)</Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
          {['💰 ราคาคุ้มค่า', '🛡️ บริการครบวงจร', '✈️ มั่นใจทุกเส้นทาง', '📋 จองง่าย ได้เร็ว', '⭐ รีวิวจากลูกค้าจริง'].map(t => (
            <span key={t} className="flex items-center gap-1">{t}</span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Country Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">🌏 เลือกประเทศใน{region.name}</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveCountry(null)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${!activeCountry ? 'bg-primary-500 text-white border-primary-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>ทั้งหมด</button>
            {region.countries.map(c => (
              <button key={c.slug} onClick={() => setActiveCountry(c.name)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${activeCountry === c.name ? 'bg-primary-500 text-white border-primary-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>
                <img src={`https://flagcdn.com/w20/${c.flagCode}.png`} width="16" height="12" alt={c.name} className="rounded-sm" />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Wholesale Partners */}
        <div className="g-card p-6 mb-8 bg-gradient-to-r from-slate-50 to-white border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">🏢 พันธมิตรโฮลเซลล์ (Wholesale Partners)</h3>
              <p className="text-sm text-slate-500">รวมทัวร์จากโฮลเซลล์ชั้นนำ เปรียบเทียบราคาได้ง่าย</p>
            </div>
            <div className="flex items-center gap-6">
              {SUPPLIERS.map(s => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                    <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tour Groups */}
        {loading ? (
          <div className="space-y-6">{[1, 2].map(i => (
            <div key={i} className="g-card p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-slate-200 rounded-xl" /><div><div className="h-5 bg-slate-200 rounded w-40 mb-2" /><div className="h-3 bg-slate-100 rounded w-24" /></div></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(j => <div key={j} className="h-48 bg-slate-100 rounded-xl" />)}</div>
            </div>
          ))}</div>
        ) : supplierGroups.length > 0 ? (
          <div className="space-y-8">
            {supplierGroups.map(([supplier, data]) => {
              const info = getSupplierInfo(supplier);
              const countriesInGroup = [...data.countries];
              return (
                <section key={supplier} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 bg-slate-50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                        {info.logo ? (
                          <img src={info.logo} alt={info.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className={`w-full h-full ${info.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>{info.name.slice(0, 2)}</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ดีลจาก {info.name}</h3>
                        <p className="text-xs text-slate-500">{data.tours.length} โปรแกรม • {countriesInGroup.join(', ')}</p>
                      </div>
                    </div>
                    <Link href={`/search?supplier=${encodeURIComponent(info.name)}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">ดูทัวร์ทั้งหมดจาก {info.name} →</Link>
                  </div>

                  <div className="p-5 space-y-6">
                    {countriesInGroup.map(country => {
                      const countryTours = data.tours.filter(t => t.country === country).slice(0, 4);
                      const countryMeta = region.countries.find(c => c.name === country);
                      return (
                        <div key={country}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              {countryMeta?.flagCode && <img src={`https://flagcdn.com/w20/${countryMeta.flagCode}.png`} width="16" height="12" alt={country} className="rounded-sm" />}
                              {country}
                              <span className="text-xs text-slate-400 font-normal">({data.tours.filter(t => t.country === country).length})</span>
                            </h4>
                            <Link href={`/country/${countryMeta?.slug || country}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700">ดูทั้งหมด →</Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {countryTours.map(tour => (
                              <TourCard key={tour.id} tour={{ ...tour, flagCode: countryMeta?.flagCode }} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="g-card p-16 text-center">
            <div className="text-5xl mb-4">🌏</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีทัวร์{activeCountry || region.name}</h2>
            <p className="text-slate-500 mb-6">กรุณาลองค้นหาใหม่ หรือติดต่อเจ้าหน้าที่</p>
            <Link href="/search" className="btn-primary">ค้นหาทัวร์ทั้งหมด</Link>
          </div>
        )}

        {/* LINE CTA */}
        <section className="mt-12 g-card p-8 md:p-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center rounded-3xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} /></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-500" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-2">รับโปรโมชั่นและข่าวสารก่อนใคร</h3>
            <p className="text-emerald-100 mb-6 max-w-md mx-auto">ไม่พลาดทุกดีลเด็ด แค่แอดไลน์ แชทบอท AI พร้อมตอบทุกคำถาม 24 ชม.</p>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold text-base shadow-lg transition-all hover:scale-105">
              แอดไลน์ @jongtour
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
