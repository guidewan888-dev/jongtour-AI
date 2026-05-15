import React from 'react';

interface FlashSaleCardProps {
  data: {
    id: string;
    title: string;
    image: string;
    supplier: string;
    country: string;
    city: string;
    nextDeparture: string;
    price: number;
    originalPrice?: number;
    availableSeats: number;
    aiScore: number;
  };
}

export default function FlashSaleCard({ data }: FlashSaleCardProps) {
  // Calculate discount
  const originalPrice = data.originalPrice || (data.price * 1.3); // mock original price if not present
  const discountPercent = Math.round(((originalPrice - data.price) / originalPrice) * 100);
  const discountAmount = originalPrice - data.price;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-orange-200 overflow-hidden hover:shadow-xl hover:border-orange-400 transition-all group flex flex-col relative">
      
      {/* Top Banner */}
      <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-r from-red-600 to-orange-500 z-20 flex items-center justify-center text-white text-xs font-bold tracking-widest shadow-sm">
        <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
        FLASH SALE
      </div>

      {/* Image Section */}
      <div className="relative bg-slate-200 overflow-hidden shrink-0 h-56 w-full pt-8">
        
        {/* Discount Badge */}
        <div className="absolute top-10 right-3 bg-red-600 text-white font-black px-3 py-1.5 rounded-lg shadow-lg z-10 rotate-3 scale-110">
          ลด {discountPercent}%
        </div>

        {/* AI Score Badge Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700/50 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1 shadow-md">
          <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          คุ้มค่าสุดๆ {data.aiScore}%
        </div>

        <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-red-50/30">
        
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{data.country}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{data.city}</span>
          </div>
          <div className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            เดินทาง {data.nextDeparture}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-[16px] leading-snug mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
          {data.title}
        </h3>

        {/* Supplier & Seats info */}
        <div className="flex justify-between items-center mb-4 text-xs font-medium border-b border-red-100 pb-4">
          <div className="flex items-center gap-1.5 text-slate-600">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            จัดโดย {data.supplier}
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${data.availableSeats <= 4 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            เหลือ {data.availableSeats} ที่สุดท้าย!
          </div>
        </div>

        {/* Price & Action Area */}
        <div className="mt-auto">
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-[11px] text-slate-500 font-medium mb-1">ประหยัด ฿{discountAmount.toLocaleString()}</div>
              <div className="text-sm text-slate-400 line-through">฿{originalPrice.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-red-500 mb-0.5">🔥 ราคาไฟไหม้</div>
              <div className="text-2xl font-black text-red-600 tracking-tight leading-none">฿{data.price.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-1.5">
              เช็คที่ว่าง
            </button>
            <a href={`/tour/${data.id}`} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md flex items-center justify-center gap-1.5">
              จองเลยด่วน!
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
