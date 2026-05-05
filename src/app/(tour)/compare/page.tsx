'use client';
import React, { useState, useEffect } from 'react';
import { TourDetail } from '@/types/tour';

// ----------------------------------------------------------------------
// TODO: Replace this function with a real API fetcher via Prisma/Supabase
// Example: 
// const searchParams = useSearchParams();
// const ids = searchParams.get('ids')?.split(',') || [];
// const tours = await fetch('/api/tours/compare?ids=' + ids.join(',')).then(r => r.json());
// ----------------------------------------------------------------------
function getMockToursToCompare(): TourDetail[] {
  return [
    {
      id: 'T-001', slug: 'jp-osa-letgo', code: 'JP-OSA-5D3N', title: 'โอซาก้า เกียวโต ทาคายาม่า เที่ยวเต็มไม่มีวันอิสระ',
      supplier: { id: 'LETGO', name: 'LETGO Group' },
      country: 'ญี่ปุ่น', city: 'โอซาก้า', duration: { days: 5, nights: 3 },
      images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop'],
      price: { starting: 28900 }, status: 'AVAILABLE',
      summary: 'เที่ยวคุ้มจัดเต็ม ไม่มีวันอิสระ เหมาะสำหรับคนไม่อยากวางแผนเอง',
      highlights: ['หมู่บ้านชิราคาวาโกะ', 'ปราสาทโอซาก้า', 'ช้อปปิ้งชินไซบาชิ'],
      flight: { airline: 'AirAsia X (XJ)', details: 'บินตรง น้ำหนักกระเป๋า 20kg' },
      hotel: { name: 'ระดับ 3-4 ดาว', rating: 3.5, details: 'พักโอซาก้า 2 คืน, กิฟุออนเซ็น 1 คืน' },
      meals: '8 มื้อ (พิเศษ! ปิ้งย่าง ยากินิคุ)',
      included: ['ตั๋วเครื่องบิน', 'ที่พัก', 'อาหารตามระบุ'],
      excluded: ['ค่าทิปไกด์ 1,500 บาท'],
      policies: { payment: 'มัดจำ 10,000 บาท', cancellation: 'ยกเลิกก่อน 30 วัน' },
      itinerary: [], departures: [{ id: 'd1', startDate: '2026-11-20T00:00:00Z', endDate: '2026-11-24T00:00:00Z', priceAdult: 28900, priceChild: 26900, priceSingle: 7000, status: 'AVAILABLE', remainingSeats: 12 }],
      faqs: []
    },
    {
      id: 'T-002', slug: 'jp-tok-checkin', code: 'JP-TOK-6D4N', title: 'โตเกียว ฟูจิ ดิสนีย์แลนด์ พักออนเซ็น (ทัวร์ครอบครัว)',
      supplier: { id: 'CHECKIN', name: 'CHECKIN' },
      country: 'ญี่ปุ่น', city: 'โตเกียว', duration: { days: 6, nights: 4 },
      images: ['https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop'],
      price: { starting: 35900, original: 42900 }, status: 'AVAILABLE',
      summary: 'เน้นเที่ยวสบายๆ ไม่เหนื่อย รวมบัตรเข้าสวนสนุกดิสนีย์แลนด์ เหมาะกับครอบครัว',
      highlights: ['สวนสนุกดิสนีย์แลนด์', 'ภูเขาไฟฟูจิ', 'ล่องเรือทะเลสาบอาชิ'],
      flight: { airline: 'Thai Airways (TG)', details: 'บินตรง Full Service กระเป๋า 30kg' },
      hotel: { name: 'ระดับ 4 ดาว', rating: 4, details: 'พักโตเกียว 3 คืน, ฟูจิออนเซ็น 1 คืน' },
      meals: '10 มื้อ (พิเศษ! ขาปูยักษ์)',
      included: ['ตั๋วเครื่องบิน', 'ที่พัก', 'บัตรดิสนีย์แลนด์'],
      excluded: ['ค่าทิปไกด์ 1,500 บาท'],
      policies: { payment: 'มัดจำ 15,000 บาท', cancellation: 'ยกเลิกก่อน 30 วัน' },
      itinerary: [], departures: [{ id: 'd2', startDate: '2026-10-15T00:00:00Z', endDate: '2026-10-20T00:00:00Z', priceAdult: 35900, priceChild: 32900, priceSingle: 8500, status: 'FEW_SEATS', remainingSeats: 4 }],
      faqs: []
    },
    {
      id: 'T-003', slug: 'jp-hkk-tourfac', code: 'JP-HKK-5D3N', title: 'ฮอกไกโด เล่นสกี ซัปโปโร โอตารุ (ลดกระหน่ำ)',
      supplier: { id: 'TOURFACTORY', name: 'TOURFACTORY' },
      country: 'ญี่ปุ่น', city: 'ฮอกไกโด', duration: { days: 5, nights: 3 },
      images: ['https://images.unsplash.com/photo-1601002341257-25e408ec228c?q=80&w=600&auto=format&fit=crop'],
      price: { starting: 22900, original: 29900 }, status: 'FEW_SEATS',
      summary: 'โปรไฟไหม้ หลุดจอง ราคาถูกที่สุดสำหรับเส้นทางฮอกไกโด',
      highlights: ['คลองโอตารุ', 'ลานสกีชิกิไซ', 'โรงงานช็อกโกแลต'],
      flight: { airline: 'Thai Vietjet (VZ)', details: 'บินตรง น้ำหนักกระเป๋า 20kg' },
      hotel: { name: 'ระดับ 3 ดาว', rating: 3, details: 'พักซัปโปโร 3 คืน' },
      meals: '6 มื้อ (อิสระ 2 มื้อ)',
      included: ['ตั๋วเครื่องบิน', 'ที่พัก'],
      excluded: ['ค่าทิปไกด์ 1,500 บาท', 'ค่าอุปกรณ์สกี'],
      policies: { payment: 'ชำระเต็มจำนวนทันที', cancellation: 'ไม่สามารถยกเลิกและขอคืนเงินได้' },
      itinerary: [], departures: [{ id: 'd3', startDate: '2026-09-10T00:00:00Z', endDate: '2026-09-14T00:00:00Z', priceAdult: 22900, priceChild: 22900, priceSingle: 6000, status: 'FEW_SEATS', remainingSeats: 2 }],
      faqs: []
    }
  ];
}

export default function ComparePage() {
  const [tours, setTours] = useState<TourDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Data
  useEffect(() => {
    // Simulating API Fetch
    const fetchData = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setTours(getMockToursToCompare());
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 2. Logic: Calculate "Best For" labels dynamically based on state
  const bestForLabels = (tour: TourDetail): string[] => {
    const labels: string[] = [];
    
    // ราคาดีสุด: Lowest starting price
    const minPrice = Math.min(...tours.map(t => t.price.starting));
    if (tour.price.starting === minPrice) labels.push('ราคาดีสุด');

    // เหมาะกับครอบครัว: Mention of family or disney/theme park
    if (tour.title.includes('ครอบครัว') || tour.summary.includes('ครอบครัว') || tour.highlights.includes('ดิสนีย์แลนด์')) {
      labels.push('เหมาะกับครอบครัว');
    }

    // คุ้มสุด: Highest discount % or best ratio of days to price (simulated)
    if (tour.price.original && (tour.price.original - tour.price.starting) > 5000) {
      labels.push('คุ้มค่าสุด');
    }

    // เดินทางเร็วสุด: Earliest departure date
    const earliestDate = tours.reduce((earliest, t) => {
      const tDate = new Date(t.departures[0].startDate).getTime();
      return tDate < earliest ? tDate : earliest;
    }, Infinity);
    if (new Date(tour.departures[0].startDate).getTime() === earliestDate) {
      labels.push('เดินทางเร็วสุด');
    }

    return labels;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <svg className="w-12 h-12 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-slate-500 font-bold text-lg">กำลังรวบรวมข้อมูลเพื่อเปรียบเทียบ...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-800">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            เปรียบเทียบโปรแกรมทัวร์
          </h1>
          <p className="text-slate-600 text-lg">เปรียบเทียบรายละเอียดทัวร์ {tours.length} รายการที่คุณเลือกไว้ เพื่อช่วยให้ตัดสินใจง่ายขึ้น</p>
        </div>

        {/* AI Summary Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-3xl p-6 md:p-8 mb-12 shadow-sm flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-orange-100">
            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">บทสรุปจาก Jongtour AI</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              หากคุณเน้นความประหยัด ทัวร์ <strong className="text-orange-700">"ฮอกไกโด เล่นสกี" (T-003)</strong> จะตอบโจทย์ที่สุดด้วยราคาเพียง 22,900 บาท แต่จะไม่มีอิสระในการช้อปปิ้งมากนัก หากเดินทางเป็นครอบครัว แนะนำทัวร์ <strong className="text-orange-700">"โตเกียว ฟูจิ ดิสนีย์แลนด์" (T-002)</strong> เนื่องจากรวมบัตรเข้าสวนสนุกและบิน Full Service (Thai Airways) จะทำให้เด็กและผู้สูงอายุเดินทางได้สะดวกกว่าครับ
            </p>
            <button className="bg-white border border-orange-200 hover:border-orange-500 text-orange-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm">
              ถาม AI เพิ่มเติมเกี่ยวกับการเปรียบเทียบนี้
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {/* On mobile, this needs horizontal scroll */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-x-auto hide-scrollbar relative">
          <table className="w-full text-left min-w-[900px] border-collapse">
            <thead>
              {/* Row 1: Tour Cards */}
              <tr className="border-b border-slate-100">
                <th className="w-48 bg-slate-50 p-6 font-bold text-slate-500 border-r border-slate-100 sticky left-0 z-20">
                  โปรแกรมทัวร์
                </th>
                {tours.map(tour => (
                  <th key={tour.id} className="p-6 min-w-[280px] w-1/3 align-top">
                    <div className="relative">
                      {/* Delete button */}
                      <button className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 rounded-full flex items-center justify-center shadow-sm z-10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      
                      <div className="aspect-video w-full rounded-xl overflow-hidden mb-4">
                        <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Dynamic Best For Labels */}
                      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                        {bestForLabels(tour).map(label => (
                          <span key={label} className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            label === 'ราคาดีสุด' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            label === 'เหมาะกับครอบครัว' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-orange-100 text-orange-700 border border-orange-200'
                          }`}>
                            ✓ {label}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-2 line-clamp-2">{tour.title}</h3>
                      <div className="text-2xl font-black text-orange-600 mb-4">฿{tour.price.starting.toLocaleString()}</div>
                      
                      <a href={`/tour/${tour.slug}`} className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                        ดูรายละเอียด
                      </a>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              
              {/* Row 2: Supplier */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">โฮลเซลล์</td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6">
                    <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                      {tour.supplier.name}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Duration */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">ระยะเวลา</td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6 font-medium text-slate-700">
                    {tour.duration.days} วัน {tour.duration.nights} คืน
                  </td>
                ))}
              </tr>

              {/* Row 4: Flight */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">สายการบิน</td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6">
                    <div className="font-bold text-slate-900">{tour.flight.airline}</div>
                    <div className="text-sm text-slate-500 mt-1">{tour.flight.details}</div>
                  </td>
                ))}
              </tr>

              {/* Row 5: Hotel */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">ที่พัก</td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6">
                    <div className="flex items-center gap-1 text-orange-400 mb-1">
                      {Array.from({length: Math.floor(tour.hotel.rating)}).map((_, i) => (
                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{tour.hotel.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{tour.hotel.details}</div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Meals */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">อาหาร</td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6 text-sm text-slate-700">
                    {tour.meals}
                  </td>
                ))}
              </tr>

              {/* Row 7: Departure */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-6 bg-slate-50 font-bold text-slate-700 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">วันเดินทางใกล้สุด</td>
                {tours.map(tour => {
                  const firstDep = tour.departures[0];
                  const dStr = new Date(firstDep.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
                  return (
                    <td key={tour.id} className="p-6">
                      <div className="font-bold text-slate-900">{dStr}</div>
                      <div className={`text-xs mt-1 font-bold ${firstDep.remainingSeats <= 4 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ว่าง {firstDep.remainingSeats} ที่
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Action Bottom */}
              <tr>
                <td className="p-6 bg-slate-50 border-r border-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]"></td>
                {tours.map(tour => (
                  <td key={tour.id} className="p-6 pt-8 pb-10">
                     <a href={`/tour/${tour.slug}`} className="block w-full text-center border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-3 rounded-xl transition-colors">
                        เลือกทัวร์นี้
                      </a>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
