'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TourCard from '@/components/tour/TourCard';
import { CONTINENTS } from '@/config/continents';

interface Tour {
  id: string; slug: string; code: string; title: string; supplier: string;
  country: string; city: string; durationDays: number; durationNights: number;
  nextDeparture: string; price: number; availableSeats: number; imageUrl?: string;
  airline?: string; sourceUrl?: string; pdfUrl?: string;
  duration?: string; deposit?: number; hotelRating?: number; highlights?: string[];
}

const SUPPLIERS = [
  { key: "let'sgo", name: "Let's Go", color: 'bg-green-600', logo: '/images/logos/download.png', priority: 1 },
  { key: "checkingroup", name: "Checkin Group", color: 'bg-teal-600', logo: '/images/logos/Check in group.jpg', priority: 2 },
  { key: "tourfactory", name: "Tour Factory", color: 'bg-purple-600', logo: '/images/logos/Tour-Factory.jpg', priority: 3 },
  { key: "go365", name: "Go365", color: 'bg-green-500', logo: '/images/logos/download.jfif', priority: 4 },
  { key: "oneworldtour", name: "One World Tour", color: 'bg-orange-600', logo: '/images/logos/oneworldtour.png', priority: 5 },
  { key: "itravels", name: "iTravels Center", color: 'bg-sky-600', logo: '/images/logos/itravels.png', priority: 6 },
  { key: "bestintl", name: "Best International", color: 'bg-red-600', logo: '/images/logos/bestintl.png', priority: 7 },
  { key: "gs25", name: "GS25 Travel", color: 'bg-emerald-600', logo: '/images/logos/gs25.png', priority: 8 },
];

// ── Helper: find continent for a country ────────────────────────────
function findContinentForCountry(countrySlug: string): string | null {
  for (const [cKey, continent] of Object.entries(CONTINENTS)) {
    if (continent.countries[countrySlug]) return cKey;
  }
  return null;
}

// ── Main Component ──────────────────────────────────────────────────
export default function ToursPage({ params }: { params: { slug: string[] } }) {
  const segments = params.slug || [];
  const router = useRouter();

  // Parse URL segments
  const continentSlug = segments[0] || null;
  const countrySlug = segments[1] || null;
  const citySlug = segments[2] || null;
  const tourSlug = segments[3] || null;

  // If 4th segment = tour detail → redirect to /tour/[slug]
  useEffect(() => {
    if (tourSlug) {
      router.replace(`/tour/${tourSlug}`);
    }
  }, [tourSlug, router]);

  // Resolve metadata
  const continent = continentSlug ? CONTINENTS[continentSlug] : null;
  const country = (continentSlug && countrySlug) ? continent?.countries[countrySlug] : null;
  const cityName = (countrySlug && citySlug && country) ? (country.cities[citySlug] || citySlug) : null;

  // Determine page level
  const level: 'continent' | 'country' | 'city' = citySlug ? 'city' : countrySlug ? 'country' : 'continent';

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tours — optimized: use continent name as single search key
  // European tours in DB are stored with country="EUROPE" (not per-country)
  // So we fetch once with the continent/region name and filter client-side
  useEffect(() => {
    if (tourSlug) return;
    setLoading(true);

    // Helper: fetch unique tours from multiple queries (max 2-3 calls)
    const fetchAndDedupe = (promises: Promise<Tour[]>[]) =>
      Promise.all(promises).then(results => {
        const all = results.flat();
        const seen = new Set<string>();
        return all.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
      });

    if (level === 'continent' && continent) {
      // Fetch by continent name (covers Europe-style: all tours stored as "EUROPE")
      // AND by each country name (covers Asia/Middle East: tours stored per-country as "JAPAN", "TURKEY" etc.)
      const promises: Promise<Tour[]>[] = [
        fetch(`/api/tours/list?country=${encodeURIComponent(continent.name)}&limit=500`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[]),
      ];
      // Add a fetch for each country's primary search name
      Object.values(continent.countries).forEach(c => {
        const primaryName = c.searchNames?.[0] || c.name;
        if (primaryName !== continent.name) { // skip if same as continent name (avoid duplicate)
          promises.push(
            fetch(`/api/tours/list?country=${encodeURIComponent(primaryName)}&limit=200`)
              .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[])
          );
        }
      });
      fetchAndDedupe(promises).then(tours => {
        setTours(tours);
        setLoading(false);
      });

    } else if (level === 'country' && country) {
      // Fetch by country searchNames + keyword in title
      const mainSearchName = country.searchNames?.[0] || country.name;
      const promises: Promise<Tour[]>[] = [
        fetch(`/api/tours/list?country=${encodeURIComponent(mainSearchName)}&limit=500`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[]),
        fetch(`/api/tours/list?q=${encodeURIComponent(country.name)}&limit=200`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[]),
      ];
      // If there are English searchNames, also search by those
      if (country.searchNames && country.searchNames.length > 1) {
        const englishName = country.searchNames.find(n => /^[A-Z]/.test(n));
        if (englishName) {
          promises.push(
            fetch(`/api/tours/list?q=${encodeURIComponent(englishName)}&limit=200`)
              .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[])
          );
        }
      }
      fetchAndDedupe(promises).then(tours => {
        setTours(tours);
        setLoading(false);
      });

    } else if (level === 'city' && country && cityName) {
      const mainSearchName = country.searchNames?.[0] || country.name;
      const promises: Promise<Tour[]>[] = [
        fetch(`/api/tours/list?country=${encodeURIComponent(mainSearchName)}&limit=500`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[]),
        fetch(`/api/tours/list?q=${encodeURIComponent(cityName)}&limit=200`)
          .then(r => r.json()).then(d => (d.tours || []) as Tour[]).catch(() => [] as Tour[]),
      ];
      fetchAndDedupe(promises).then(tours => {
        setTours(tours.filter(t => t.city === cityName || t.title.includes(cityName)));
        setLoading(false);
      });

    } else {
      setLoading(false);
    }
  }, [level, continent, country, cityName, tourSlug]);

  // Build page title & breadcrumb
  const pageTitle = level === 'city' ? `ทัวร์${cityName}` : level === 'country' ? `ทัวร์${country?.name}` : `ทัวร์${continent?.name}`;
  const pageDesc = level === 'city'
    ? `รวมทัวร์${cityName} ${country?.name} จากโฮลเซลชั้นนำ`
    : level === 'country' ? `รวมทัวร์${country?.name} จากโฮลเซลชั้นนำ`
    : continent?.desc || '';

  // Group by supplier (country & city level) or by country (continent level)
  const supplierGroups = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    tours.forEach(t => {
      const key = (t.supplier || 'other').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).sort((a, b) => {
      const infoA = SUPPLIERS.find(s => a[0].includes(s.key));
      const infoB = SUPPLIERS.find(s => b[0].includes(s.key));
      return (infoA?.priority || 99) - (infoB?.priority || 99);
    });
  }, [tours]);

  const getSupplierInfo = (key: string) => SUPPLIERS.find(s => key.includes(s.key)) || { name: key, color: 'bg-slate-500', logo: '', priority: 99 };

  // If redirecting to tour detail, show nothing
  if (tourSlug) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'24px 24px'}}/></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/70 mb-4 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white">หน้าหลัก</Link><span>›</span>
            {continentSlug && continent && (
              <>{level === 'continent'
                ? <span className="text-white font-medium">ทัวร์{continent.name}</span>
                : <><Link href={`/tours/${continentSlug}`} className="hover:text-white">ทัวร์{continent.name}</Link><span>›</span></>
              }</>
            )}
            {countrySlug && country && (
              <>{level === 'country'
                ? <span className="text-white font-medium">ทัวร์{country.name}</span>
                : <><Link href={`/tours/${continentSlug}/${countrySlug}`} className="hover:text-white">ทัวร์{country.name}</Link><span>›</span></>
              }</>
            )}
            {citySlug && cityName && <span className="text-white font-medium">ทัวร์{cityName}</span>}
          </nav>

          <div className="flex items-center gap-4">
            {country?.flagCode && <img src={`https://flagcdn.com/w80/${country.flagCode}.png`} width="56" height="42" alt="" className="rounded shadow-lg" />}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{pageTitle}</h1>
              <p className="text-white/80 text-base mt-1">
                {loading ? 'กำลังค้นหา...' : `พบ ${tours.length} โปรแกรม • ${pageDesc}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white border-b border-slate-200 py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-[11px] text-slate-500 font-medium">
          {['💰 ราคาคุ้มค่า','🛡️ บริการครบวงจร','✈️ มั่นใจทุกเส้นทาง','📋 จองง่าย ได้เร็ว','⭐ รีวิวจากลูกค้าจริง'].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub-navigation: countries (continent level) or cities (country level) */}
        {level === 'continent' && continent && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">🌏 เลือกประเทศใน{continent.name}</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(continent.countries).map(([slug, c]) => (
                <Link key={slug} href={`/tours/${continentSlug}/${slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-all">
                  <img src={`https://flagcdn.com/w20/${c.flagCode}.png`} width="16" height="12" alt="" className="rounded-sm" />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {level === 'country' && country && Object.keys(country.cities).length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">📍 เลือกเมืองใน{country.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/tours/${continentSlug}/${countrySlug}`}
                className="px-4 py-2 rounded-full text-sm font-bold bg-primary-500 text-white border border-primary-500">
                ทั้งหมด ({tours.length})
              </Link>
              {Object.entries(country.cities).map(([cityS, cityN]) => (
                <Link key={cityS} href={`/tours/${continentSlug}/${countrySlug}/${cityS}`}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-all">
                  {cityN}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tour listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 animate-pulse overflow-hidden">
                <div className="h-44 bg-slate-200" /><div className="p-4 space-y-3"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-100 rounded w-1/2" /><div className="h-6 bg-slate-200 rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="space-y-8">
            {supplierGroups.map(([supplier, sTours]) => {
              const info = getSupplierInfo(supplier);
              return (
                <section key={supplier} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 bg-slate-50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1">
                        {info.logo ? (
                          <img src={info.logo} alt={info.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className={`w-full h-full ${info.color} rounded-lg flex items-center justify-center text-white text-xs font-black`}>{info.name.slice(0,2)}</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ดีลจาก {info.name}</h3>
                        <p className="text-xs text-slate-500">{sTours.length} โปรแกรม</p>
                      </div>
                    </div>
                    <Link href={`/search?supplier=${encodeURIComponent(info.name)}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">ดูทัวร์ทั้งหมดจาก {info.name} →</Link>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sTours.slice(0, 8).map(tour => (
                        <TourCard key={tour.id} tour={{ ...tour, flagCode: findFlagCode(tour.country), sourceUrl: tour.sourceUrl, pdfUrl: tour.pdfUrl, duration: tour.duration, deposit: tour.deposit, hotelRating: tour.hotelRating, highlights: tour.highlights }} />
                      ))}
                    </div>
                    {sTours.length > 8 && (
                      <div className="text-center mt-4">
                        <Link href={`/wholesaler/${supplier.replace(/['\s]/g,'-')}`} className="text-sm font-bold text-primary-600 hover:text-primary-700">ดูอีก {sTours.length - 8} โปรแกรม →</Link>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Empty state — NOT 404 */
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="text-5xl mb-4">🌏</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มี{pageTitle}</h2>
            <p className="text-slate-500 mb-2">กำลังมาเร็วๆนี้! ทีมงานกำลังเพิ่มโปรแกรมทัวร์ใหม่อยู่</p>
            <p className="text-sm text-slate-400 mb-6">หรือติดต่อเจ้าหน้าที่เพื่อสอบถามเส้นทางที่สนใจ</p>
            <div className="flex justify-center gap-3">
              <Link href="/search" className="btn-primary">ค้นหาทัวร์ทั้งหมด</Link>
              <a href="https://line.me/R/ti/p/@jongtour" target="_blank" rel="noopener noreferrer" className="btn-secondary">💬 แชทไลน์</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to find flag code for a country name
function findFlagCode(countryName: string): string {
  for (const continent of Object.values(CONTINENTS)) {
    for (const country of Object.values(continent.countries)) {
      if (country.name === countryName) return country.flagCode;
    }
  }
  return '';
}
