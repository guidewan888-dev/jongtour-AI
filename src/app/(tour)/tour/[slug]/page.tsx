export const dynamic = 'force-dynamic';
import React from 'react';
import TourGallery from '@/components/tour/detail/TourGallery';
import TourStickyCard from '@/components/tour/detail/TourStickyCard';
import TourItinerary from '@/components/tour/detail/TourItinerary';
import TourPriceTable from '@/components/tour/detail/TourPriceTable';
import { TourDetail } from '@/types/tour';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getTourDetail(slug: string): Promise<TourDetail> {
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      supplier: true,
      destinations: true,
      images: { orderBy: { createdAt: 'asc' } },
      pdfs: true,
      itineraries: { orderBy: { dayNumber: 'asc' } },
      meals: true,
      included: true,
      excluded: true,
      policies: true,
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      }
    }
  });

  if (!tour) notFound();

  const startingPrice = tour.departures[0]?.prices[0]?.sellingPrice || 0;
  
  return {
    id: tour.id,
    slug: tour.slug,
    code: tour.tourCode,
    title: tour.tourName,
    supplier: {
      id: tour.supplier.canonicalName,
      name: tour.supplier.displayName
    },
    country: tour.destinations[0]?.country || 'เนเธกเนเธฃเธฐเธเธธ',
    city: tour.destinations[0]?.city || 'เนเธกเนเธฃเธฐเธเธธ',
    duration: { days: tour.durationDays, nights: tour.durationNights },
    images: tour.images.length > 0 ? tour.images.map(i => i.imageUrl) : ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200'],
    price: { starting: startingPrice },
    status: tour.status as any,
    summary: tour.supplierBookingNote || 'เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธ—เธฑเธงเธฃเน',
    highlights: [], 
    flight: { airline: 'เน€เธ—เธตเนเธขเธงเธเธดเธเธกเธฒเธ•เธฃเธเธฒเธ', details: 'เธญเนเธฒเธเธญเธดเธเธเธฒเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธ—เธฑเธงเธฃเน' },
    hotel: { name: 'เนเธฃเธเนเธฃเธกเธกเธฒเธ•เธฃเธเธฒเธ', rating: 3, details: 'เธ•เธฒเธกเนเธเธฃเนเธเธฃเธกเธ—เธฑเธงเธฃเน' },
    meals: 'เธ”เธนเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เนเธเนเธเธฃเนเธเธฃเธก',
    included: tour.included.map(i => i.description),
    excluded: tour.excluded.map(e => e.description),
    policies: {
      payment: tour.policies.find(p => p.policyType === 'PAYMENT')?.description || 'เน€เธเธทเนเธญเธเนเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธ',
      cancellation: tour.policies.find(p => p.policyType === 'CANCELLATION')?.description || 'เน€เธเธทเนเธญเธเนเธเธเธฒเธฃเธขเธเน€เธฅเธดเธเธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธ'
    },
    pdfUrl: tour.pdfs[0]?.pdfUrl,
    itinerary: tour.itineraries.map(it => ({
      day: it.dayNumber,
      title: it.title,
      description: it.description,
      meals: {
        breakfast: !!tour.meals.find(m => m.dayNumber === it.dayNumber && m.mealType === 'BREAKFAST'),
        lunch: !!tour.meals.find(m => m.dayNumber === it.dayNumber && m.mealType === 'LUNCH'),
        dinner: !!tour.meals.find(m => m.dayNumber === it.dayNumber && m.mealType === 'DINNER')
      }
    })),
    departures: tour.departures.map(d => ({
      id: d.id,
      startDate: d.startDate.toISOString(),
      endDate: d.endDate.toISOString(),
      priceAdult: d.prices.find(p => p.paxType === 'ADULT')?.sellingPrice || 0,
      priceChild: d.prices.find(p => p.paxType === 'CHILD')?.sellingPrice || 0,
      priceSingle: d.prices.find(p => p.paxType === 'SINGLE_SUPP')?.sellingPrice || 0,
      status: d.status as any,
      remainingSeats: d.remainingSeats
    })),
    faqs: []
  };
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  // 1. Fetch Data
  const tour = await getTourDetail(params.slug);

  return (
    <div className="bg-white text-slate-800 pb-32 md:pb-20">
        
        {/* Section 1: Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-xs font-medium text-slate-500">
            <ol className="flex items-center space-x-2">
              <li><a href="/" className="hover:text-orange-600 transition-colors">เธซเธเนเธฒเธซเธฅเธฑเธ</a></li>
              <li><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
              <li><a href={`/search?q=${encodeURIComponent(tour.country)}`} className="hover:text-orange-600 transition-colors">เธ—เธฑเธงเธฃเน{tour.country}</a></li>
              <li><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
              <li className="text-slate-900 truncate max-w-[200px]" aria-current="page">{tour.code}</li>
            </ol>
          </nav>
        </div>

        {/* Section 2: Hero Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <TourGallery images={tour.images} title={tour.title} />
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Left Column: Content */}
            <div className="w-full lg:w-[65%] space-y-12">
              
              {/* Header Info */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                    {tour.code}
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    เธเธฑเธ”เนเธ”เธข {tour.supplier.name}
                  </span>
                  {tour.status === 'AVAILABLE' && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      เธเธฒเธฃเธฑเธเธ•เธตเธญเธญเธเน€เธ”เธดเธเธ—เธฒเธ
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                  {tour.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium pb-8 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธฃเธฐเธขเธฐเน€เธงเธฅเธฒ: {tour.duration.days} เธงเธฑเธ {tour.duration.nights} เธเธทเธ
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธเธฃเธฐเน€เธ—เธจ: {tour.country}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธชเธฒเธขเธเธฒเธฃเธเธดเธ: {tour.flight.airline}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เนเธเธฃเนเธเธฃเธก</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{tour.summary}</p>
              </section>

              {/* Highlights */}
              <section className="bg-orange-50/50 rounded-3xl p-8 border border-orange-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  เนเธฎเนเธฅเธ—เนเธ—เธฑเธงเธฃเน (Highlights)
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Price Table (Desktop only, mobile will use sticky bar mostly, but we show it) */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">เธ•เธฒเธฃเธฒเธเธฃเธญเธเธเธดเธเนเธฅเธฐเธฃเธฒเธเธฒ</h2>
                  <a href={tour.pdfUrl || '#'} className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:underline">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    เนเธซเธฅเธ”เนเธเธฃเนเธเธฃเธก PDF
                  </a>
                </div>
                <TourPriceTable departures={tour.departures} />
              </section>

              {/* Itinerary */}
              <section id="itinerary">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">เนเธเธเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธ (Itinerary)</h2>
                <TourItinerary itinerary={tour.itinerary} />
              </section>

              {/* Included / Excluded & Policies */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธญเธฑเธ•เธฃเธฒเธเธตเนเธฃเธงเธก
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {tour.included.map((item, i) => (
                      <li key={i} className="flex gap-2"><span className="text-emerald-500">โ€ข</span> {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    เธญเธฑเธ•เธฃเธฒเธเธตเนเนเธกเนเธฃเธงเธก
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {tour.excluded.map((item, i) => (
                      <li key={i} className="flex gap-2"><span className="text-red-500">โ€ข</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </section>

            </div>

            {/* Right Column: Sticky Booking Card (Hidden on Mobile, shown as Bottom Bar) */}
            <div className="hidden lg:block lg:w-[35%] relative">
               <TourStickyCard tour={tour} />
            </div>

          </div>
        </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500 font-medium">ราคาเริ่มต้น</p>
          <p className="text-xl font-black text-orange-600">฿{tour.price.starting.toLocaleString()}</p>
        </div>
        <button className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-md">
          เลือกวันเดินทาง
        </button>
      </div>
    </div>
  );
}

