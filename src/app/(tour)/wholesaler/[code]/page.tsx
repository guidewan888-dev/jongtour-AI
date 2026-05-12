'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TourCard from '@/components/tour/TourCard';
import { REGION_META, REGION_ORDER, resolveCountryMeta } from '@/lib/geo';

interface Tour {
  id: string; slug: string; code: string; title: string; supplier: string;
  country: string; city: string; durationDays: number; durationNights: number;
  nextDeparture: string; price: number; availableSeats: number; imageUrl?: string;
  airline?: string; sourceUrl?: string;
}

const SUPPLIER_CONFIG: Record<string, {
  name: string; displayName: string; logo: string;
  gradient: string; heroBg: string; accent: string; accentLight: string;
  accentBorder: string; tagline: string;
}> = {
  'letsgo': {
    name: "let'sgo", displayName: "Let's Go Group",
    logo: '/images/logos/download.png',
    gradient: 'from-green-800 via-green-700 to-emerald-600',
    heroBg: 'bg-green-800', accent: 'text-green-600', accentLight: 'bg-green-50',
    accentBorder: 'border-green-200',
    tagline: 'เนเธฎเธฅเน€เธเธฅเธฅเนเธเธฑเนเธเธเธณ เธเธธเธ“เธ เธฒเธเธกเธฒเธ•เธฃเธเธฒเธ เธฃเธฒเธเธฒเธเธธเนเธกเธเนเธฒ',
  },
  'checkin': {
    name: 'checkingroup', displayName: 'Checkin Group',
    logo: '/images/logos/checkingroup.jpg',
    gradient: 'from-emerald-700 via-emerald-600 to-teal-500',
    heroBg: 'bg-emerald-700', accent: 'text-emerald-600', accentLight: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    tagline: 'เน€เธ—เธตเนเธขเธงเธชเธเธธเธ เธเธฃเธเธเธเนเธเธ—เธตเนเน€เธ”เธตเธขเธง เธกเธฑเนเธเนเธเธ—เธธเธเน€เธชเนเธเธ—เธฒเธ',
  },
  'tour-factory': {
    name: 'tourfactory', displayName: 'Tour Factory',
    logo: '/images/logos/Tour-Factory.jpg',
    gradient: 'from-purple-800 via-purple-700 to-violet-600',
    heroBg: 'bg-purple-800', accent: 'text-purple-600', accentLight: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    tagline: 'เธชเธฃเนเธฒเธเธชเธฃเธฃเธเนเธ—เธฃเธดเธเธเธดเน€เธจเธฉ เนเธเธฃเนเธเธฃเธกเน€เธญเนเธเธเนเธเธฅเธนเธเธตเธ',
  },
  'worldconnection': {
    name: 'worldconnection', displayName: 'World Connection',
    logo: '/images/logos/worldconnection.png',
    gradient: 'from-amber-800 via-orange-700 to-red-600',
    heroBg: 'bg-amber-800', accent: 'text-orange-600', accentLight: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    tagline: 'เนเธฎเธฅเน€เธเธฅเธเธฃเธตเน€เธกเธตเนเธขเธก เธ—เธฑเธงเธฃเนเธขเธธเนเธฃเธ เธชเธงเธดเธ•เน€เธเธญเธฃเนเนเธฅเธเธ”เน เธญเธดเธ•เธฒเธฅเธต เนเธฅเธฐเน€เธญเน€เธเธตเธข',
  },
  'itravels': {
    name: 'itravels', displayName: 'iTravels Center',
    logo: '/images/logos/itravels_small.jpg',
    gradient: 'from-sky-800 via-sky-700 to-cyan-600',
    heroBg: 'bg-sky-800', accent: 'text-sky-600', accentLight: 'bg-sky-50',
    accentBorder: 'border-sky-200',
    tagline: 'เธจเธนเธเธขเนเธฃเธงเธกเธ—เธฑเธงเธฃเนเธ•เนเธฒเธเธเธฃเธฐเน€เธ—เธจ เธเธฃเธเธ—เธธเธเน€เธชเนเธเธ—เธฒเธ เธฃเธฒเธเธฒเธ”เธตเธ—เธตเนเธชเธธเธ”',
  },
  'bestinternational': {
    name: 'bestintl', displayName: 'Best International',
    logo: '/images/logos/bestintl.png',
    gradient: 'from-red-800 via-red-700 to-rose-600',
    heroBg: 'bg-red-800', accent: 'text-red-600', accentLight: 'bg-red-50',
    accentBorder: 'border-red-200',
    tagline: 'เนเธฎเธฅเน€เธเธฅเธฃเธฐเธ”เธฑเธเธเธฒเธเธฒเธเธฒเธ•เธด เธเธฃเธญเธเธเธฅเธธเธกเธ—เธธเธเธ—เธงเธตเธ เธเธฃเธดเธเธฒเธฃเน€เธเธฃเธ”เธเธฃเธตเน€เธกเธตเธขเธก',
  },
  'gs25': {
    name: 'gs25', displayName: 'GS25 Travel',
    logo: '/images/logos/gs25.png',
    gradient: 'from-emerald-800 via-emerald-700 to-green-600',
    heroBg: 'bg-emerald-800', accent: 'text-emerald-600', accentLight: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    tagline: 'เธ—เธฑเธงเธฃเนเธเธธเธ“เธ เธฒเธเธฃเธฒเธเธฒเธกเธดเธ•เธฃเธ เธฒเธ เน€เธชเนเธเธ—เธฒเธเธขเธญเธ”เธเธดเธขเธกเธเธฃเนเธญเธกเธ”เธนเนเธฅเธ—เธธเธเธเธฑเนเธเธ•เธญเธ',
  },
  'go365': {
    name: 'go365', displayName: 'Go365 Travel',
    logo: '/images/logos/download.jfif',
    gradient: 'from-green-800 via-green-700 to-emerald-600',
    heroBg: 'bg-green-800', accent: 'text-green-600', accentLight: 'bg-green-50',
    accentBorder: 'border-green-200',
    tagline: 'เนเธฎเธฅเน€เธเธฅเธ—เธฑเธงเธฃเนเธ•เนเธฒเธเธเธฃเธฐเน€เธ—เธจเธเธธเธ“เธ เธฒเธ เธเธฃเธเธ—เธธเธเน€เธชเนเธเธ—เธฒเธ เน€เธญเน€เธเธตเธข เธขเธธเนเธฃเธ',
  },
};

export default function WholesalePage({ params }: { params: { code: string } }) {
  const config = SUPPLIER_CONFIG[params.code] || SUPPLIER_CONFIG['letsgo'];
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeCountryLabel, setActiveCountryLabel] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scraper-sourced sites use a different API
  const isScraperSite = ['worldconnection', 'itravels', 'bestinternational', 'gs25', 'go365'].includes(params.code);

  useEffect(() => {
    setLoading(true);

    const url = isScraperSite
      ? `/api/tours/scraper-list?site=${config.name}&limit=500`
      : `/api/tours/list?limit=2000`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.tours) {
          if (isScraperSite) {
            // Scraper API already filters by site
            setTours(d.tours as Tour[]);
          } else {
            const filtered = (d.tours as Tour[]).filter(t =>
              t.supplier.toLowerCase().replace(/['\s\-]/g, '').includes(config.name.replace(/['\s\-]/g, ''))
            );
            setTours(filtered);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [config.name, isScraperSite]);
  // Build taxonomy from shared geo resolver
  const taxonomy = useMemo(() => {
    const result: Record<string, { countries: Record<string, { name: string; flagCode: string; cities: Set<string>; count: number }> }> = {};
    tours.forEach((tour) => {
      const geo = resolveCountryMeta(tour.country, tour.title);
      const regionKey = geo.regionKey || 'others';
      const countryKey = geo.slug || geo.name;
      const city = tour.city || '';

      if (!result[regionKey]) result[regionKey] = { countries: {} };
      if (!result[regionKey].countries[countryKey]) {
        result[regionKey].countries[countryKey] = {
          name: geo.name || tour.country || 'อื่นๆ',
          flagCode: geo.flagCode || '',
          cities: new Set<string>(),
          count: 0,
        };
      }

      result[regionKey].countries[countryKey].count++;
      if (city) result[regionKey].countries[countryKey].cities.add(city);
    });
    return result;
  }, [tours]);

  const filteredTours = useMemo(() => {
    let filtered = tours;
    if (activeCountry) {
      filtered = filtered.filter((tour) => resolveCountryMeta(tour.country, tour.title).slug === activeCountry);
    } else if (activeContinent) {
      filtered = filtered.filter((tour) => resolveCountryMeta(tour.country, tour.title).regionKey === activeContinent);
    }
    if (activeCity) filtered = filtered.filter((tour) => tour.city === activeCity);
    return filtered;
  }, [tours, activeContinent, activeCountry, activeCity]);

  const handleContinentClick = (key: string) => {
    setActiveContinent(activeContinent === key ? null : key);
    setActiveCountry(null);
    setActiveCountryLabel(null);
    setActiveCity(null);
  };
  const handleCountryClick = (country: string, countryLabel: string) => {
    setActiveCountry(activeCountry === country ? null : country);
    setActiveCountryLabel(activeCountry === country ? null : countryLabel);
    setActiveCity(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${config.gradient} text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-10"><div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}} /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-2xl p-3">
              <img src={config.logo} alt={config.displayName} className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML=`<span class="font-black text-2xl text-slate-800">${config.displayName}</span>`; }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 font-bold px-3 py-1 rounded-full text-xs mb-3 border border-white/20">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Official Wholesale Partner
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">เธ—เธฑเธงเธฃเนเธเธธเธ“เธ เธฒเธเธเธฒเธ {config.displayName}</h1>
              <p className="text-white/70 text-base md:text-lg max-w-xl mb-1">{config.tagline}</p>
              {!loading && <p className="text-white/50 text-sm">เธเธ {tours.length} เนเธเธฃเนเธเธฃเธกเธ—เธฑเธงเธฃเน</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500 overflow-x-auto">
          <Link href="/" className="hover:text-primary-600">เธซเธเนเธฒเธซเธฅเธฑเธ</Link><span>โ€บ</span>
          <Link href="/search" className="hover:text-primary-600">เธ—เธฑเธงเธฃเน</Link><span>โ€บ</span>
          <span className={config.accent + ' font-semibold'}>{config.displayName}</span>
          {activeContinent && REGION_META[activeContinent as keyof typeof REGION_META] && <><span>โ€บ</span><span>{REGION_META[activeContinent as keyof typeof REGION_META].name}</span></>}
          {activeCountryLabel && <><span>โ€บ</span><span className="font-semibold">{activeCountryLabel}</span></>}
          {activeCity && <><span>โ€บ</span><span>{activeCity}</span></>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`shrink-0 transition-all ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} hidden lg:block`}>
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`p-4 ${config.accentLight} border-b ${config.accentBorder}`}>
                <h3 className={`font-bold text-sm ${config.accent}`}>๐“ เธซเธกเธงเธ”เธซเธกเธนเนเธ—เธฑเธงเธฃเน</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{tours.length} เนเธเธฃเนเธเธฃเธกเธ—เธฑเนเธเธซเธกเธ”</p>
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {/* All */}
                <button onClick={() => { setActiveContinent(null); setActiveCountry(null); setActiveCountryLabel(null); setActiveCity(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${!activeContinent && !activeCountry ? config.accentLight + ' ' + config.accent : 'text-slate-700 hover:bg-slate-50'}`}>
                  ๐ เธ—เธฑเนเธเธซเธกเธ” ({tours.length})
                </button>
                {Object.entries(taxonomy).sort((a,b) => {
                  const leftIndex = REGION_ORDER.indexOf(a[0] as any);
                  const rightIndex = REGION_ORDER.indexOf(b[0] as any);
                  return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
                }).map(([continent, data]) => {
                  const continentName = REGION_META[continent as keyof typeof REGION_META]?.name || 'เธญเธทเนเธเน';
                  const totalInContinent = Object.values(data.countries).reduce((s, c) => s + c.count, 0);
                  const isOpen = activeContinent === continent;
                  return (
                    <div key={continent}>
                      <button onClick={() => handleContinentClick(continent)} className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors ${isOpen ? config.accentLight + ' ' + config.accent : 'text-slate-700 hover:bg-slate-50'}`}>
                        <span>{continentName}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">{totalInContinent}</span>
                          <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="bg-slate-50/50">
                          {Object.entries(data.countries).sort((a,b) => b[1].count - a[1].count).map(([country, cData]) => {
                            const isCountryActive = activeCountry === country;
                            const flagCode = cData.flagCode || '';
                            return (
                              <div key={country}>
                                <button onClick={() => handleCountryClick(country, cData.name)} className={`w-full text-left pl-8 pr-4 py-2 text-sm flex items-center gap-2 transition-colors ${isCountryActive ? config.accent + ' font-bold ' + config.accentLight : 'text-slate-600 hover:bg-slate-50'}`}>
                                  {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} width="14" height="10" alt="" className="rounded-sm" />}
                                  <span className="flex-1">{cData.name}</span>
                                  <span className="text-[10px] text-slate-400">{cData.count}</span>
                                </button>
                                {isCountryActive && cData.cities.size > 0 && (
                                  <div>{[...cData.cities].sort().map(city => (
                                    <button key={city} onClick={() => setActiveCity(activeCity === city ? null : city)} className={`w-full text-left pl-14 pr-4 py-1.5 text-xs transition-colors ${activeCity === city ? config.accent + ' font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
                                      ๐“ {city}
                                    </button>
                                  ))}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                ๐“ {sidebarOpen ? 'เธเนเธญเธ' : 'เนเธชเธ”เธ'}เธซเธกเธงเธ”เธซเธกเธนเน
              </button>
            </div>

            {/* Active filter pills */}
            {(activeContinent || activeCountry || activeCity) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-slate-400">เธเธฃเธญเธเนเธ”เธข:</span>
                {activeContinent && REGION_META[activeContinent as keyof typeof REGION_META] && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${config.accentLight} ${config.accent} px-2.5 py-1 rounded-full`}>
                    {REGION_META[activeContinent as keyof typeof REGION_META].name}
                    <button onClick={() => { setActiveContinent(null); setActiveCountry(null); setActiveCountryLabel(null); setActiveCity(null); }} className="ml-1 hover:opacity-70">โ•</button>
                  </span>
                )}
                {activeCountry && activeCountryLabel && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${config.accentLight} ${config.accent} px-2.5 py-1 rounded-full`}>
                    {resolveCountryMeta(activeCountryLabel).flagCode && <img src={`https://flagcdn.com/w20/${resolveCountryMeta(activeCountryLabel).flagCode}.png`} width="12" height="9" alt="" className="rounded-sm" />}
                    {activeCountryLabel}
                    <button onClick={() => { setActiveCountry(null); setActiveCountryLabel(null); setActiveCity(null); }} className="ml-1 hover:opacity-70">โ•</button>
                  </span>
                )}
                {activeCity && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${config.accentLight} ${config.accent} px-2.5 py-1 rounded-full`}>
                    ๐“ {activeCity}
                    <button onClick={() => setActiveCity(null)} className="ml-1 hover:opacity-70">โ•</button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 font-medium">
                {loading ? 'เธเธณเธฅเธฑเธเนเธซเธฅเธ”...' : `เนเธชเธ”เธ ${filteredTours.length} เนเธเธฃเนเธเธฃเธก`}
              </p>
            </div>

            {/* Tour Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="h-44 bg-slate-200" />
                    <div className="p-4 space-y-3"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-100 rounded w-1/2" /><div className="h-6 bg-slate-200 rounded w-1/3" /></div>
                  </div>
                ))}
              </div>
            ) : filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTours.map(tour => (
                  <TourCard key={tour.id} tour={{ ...tour, flagCode: resolveCountryMeta(tour.country, tour.title).flagCode || '', sourceUrl: tour.sourceUrl }} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
                <div className="text-5xl mb-4">๐”</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">เนเธกเนเธเธเธ—เธฑเธงเธฃเน{activeCountryLabel || ''}</h2>
                <p className="text-slate-500 mb-6">เธฅเธญเธเน€เธฅเธทเธญเธเธซเธกเธงเธ”เธญเธทเนเธ เธซเธฃเธทเธญเธ”เธนเธ—เธฑเธงเธฃเนเธ—เธฑเนเธเธซเธกเธ”เธเธญเธ {config.displayName}</p>
                <button onClick={() => { setActiveContinent(null); setActiveCountry(null); setActiveCountryLabel(null); setActiveCity(null); }} className="btn-primary">เธ”เธนเธ—เธฑเธงเธฃเนเธ—เธฑเนเธเธซเธกเธ”</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


