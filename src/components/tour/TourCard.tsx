import React from 'react';

export interface TourData {
  id: string;
  code: string;
  title: string;
  image: string;
  supplier: string;
  country: string;
  city: string;
  durationDays: number;
  durationNights: number;
  nextDeparture: string;
  price: number;
  originalPrice?: number;
  isFlashSale: boolean;
  isConfirmed: boolean;
  availableSeats: number;
  aiScore: number;
  airline: string;
}

interface TourCardProps {
  data: TourData;
  viewMode?: 'grid' | 'list';
}

export default function TourCard({ data, viewMode = 'grid' }: TourCardProps) {
  const isList = viewMode === 'list';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group flex ${isList ? 'flex-col sm:flex-row' : 'flex-col'}`}>
      
      {/* Image Section */}
      <div className={`relative bg-slate-200 overflow-hidden shrink-0 ${isList ? 'w-full sm:w-72 h-48 sm:h-auto' : 'h-52 w-full'}`}>
        
        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {data.isFlashSale && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-pulse">
              ทัวร์ไฟไหม้
            </span>
          )}
          {data.isConfirmed && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              การันตีออกเดินทาง
            </span>
          )}
        </div>

        {/* AI Score Badge Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700/50 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1 shadow-md">
          <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          ตรงสเปก {data.aiScore}%
        </div>

        {/* Duration Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
          {data.durationDays} วัน {data.durationNights} คืน
        </div>

        <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Content Section */}
      <div className={`p-4 flex flex-col flex-1 ${isList ? 'justify-between' : ''}`}>
        
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{data.country}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{data.city}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{data.code}</div>
        </div>

        <h3 className="font-bold text-slate-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {data.title}
        </h3>

        {/* Details Grid */}
        <div className={`grid ${isList ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} gap-2 mb-4 text-xs`}>
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span className="truncate">{data.supplier}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="truncate">{data.airline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="truncate">{data.nextDeparture}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className={`font-bold ${data.availableSeats <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
              ว่าง {data.availableSeats} ที่
            </span>
          </div>
        </div>

        <div className={`mt-auto pt-3 border-t border-slate-100 flex items-end justify-between ${isList ? 'border-t-0 pt-0' : ''}`}>
          
          {/* Price */}
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5 font-medium">ราคาเริ่มต้น / ท่าน</div>
            <div className="flex items-end gap-2">
              {data.originalPrice && (
                <span className="text-xs text-slate-400 line-through mb-1">฿{data.originalPrice.toLocaleString()}</span>
              )}
              <span className="text-xl font-black text-orange-600 tracking-tight">฿{data.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 p-2 rounded-lg border border-slate-200 transition-colors" title="เปรียบเทียบทัวร์นี้">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H4m12 4v-4m0 0V9a2 2 0 00-2-2h-3m-1 4l-4-4m4 4l4-4" /></svg>
            </button>
            <a href={`/tour/${data.id}`} className="bg-slate-900 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm">
              ดูรายละเอียด
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
