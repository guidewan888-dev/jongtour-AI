'use client';
import React from 'react';
import Link from 'next/link';

export interface TourCardProps {
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
  imageUrl?: string;
  airline?: string;
  flagCode?: string;
  sourceUrl?: string;
}

export default function TourCard({ tour }: { tour: TourCardProps }) {
  const hasImage = !!tour.imageUrl;
  const isUrgent = tour.availableSeats > 0 && tour.availableSeats <= 5;
  const isExternal = !!tour.sourceUrl;
  const href = isExternal ? tour.sourceUrl : `/tour/${tour.slug}`;

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group block bg-white rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {hasImage ? (
          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-orange-50">
            <span className="text-4xl opacity-30">✈️</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
          {tour.durationDays} วัน {tour.durationNights} คืน
        </div>
        {isUrgent && (
          <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
            🔥 เหลือ {tour.availableSeats} ที่!
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
          <div className="flex items-center gap-2 text-white text-[11px]">
            {tour.flagCode && <img src={`https://flagcdn.com/w20/${tour.flagCode}.png`} width="14" height="10" alt="" className="rounded-sm" />}
            <span className="font-medium">{tour.country}</span>
            {tour.city && <><span className="opacity-50">•</span><span>{tour.city}</span></>}
            {tour.nextDeparture !== 'N/A' && <><span className="opacity-50">•</span><span>📅 {tour.nextDeparture}</span></>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-snug mb-2">{tour.title}</h3>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">🏢 {tour.supplier}</span>
          {tour.airline && <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✈️ {tour.airline}</span>}
          <span className="text-[10px] text-slate-400 font-mono">{tour.code}</span>
        </div>
        <div className="flex items-end justify-between pt-2.5 border-t border-slate-100">
          <div>
            {tour.price > 0 ? (
              <>
                <p className="text-[10px] text-slate-400">เริ่มต้น</p>
                <p className="text-lg font-black text-primary-600 leading-tight">฿{tour.price.toLocaleString()}<span className="text-[10px] font-normal text-slate-400 ml-0.5">/ท่าน</span></p>
              </>
            ) : (
              <p className="text-sm text-slate-400">สอบถามราคา</p>
            )}
          </div>
          <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full group-hover:bg-primary-500 group-hover:text-white transition-all">ดูรายละเอียด</span>
        </div>
      </div>
    </Link>
  );
}
