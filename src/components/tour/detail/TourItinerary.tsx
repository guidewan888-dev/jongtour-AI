'use client';
import React from 'react';
import { TourDay } from '@/types/tour';

interface TourItineraryProps {
  itinerary: TourDay[];
}

export default function TourItinerary({ itinerary }: TourItineraryProps) {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="space-y-6">
      {itinerary.map((day, idx) => (
        <details key={idx} className="group bg-white rounded-2xl border border-slate-200 open:border-orange-300 open:ring-4 open:ring-orange-500/10 transition-all duration-300" open={idx === 0}>
          <summary className="flex items-start gap-4 p-5 md:p-6 cursor-pointer list-none">
            <div className="w-12 h-12 bg-slate-100 group-open:bg-orange-100 text-slate-500 group-open:text-orange-600 rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Day</span>
              <span className="text-xl font-black leading-none">{day.day}</span>
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug pr-8 relative">
                {day.title}
                <span className="absolute right-0 top-1 transition-transform duration-300 group-open:-rotate-180 text-slate-400 group-open:text-orange-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </h3>
            </div>
          </summary>

          <div className="px-5 pb-6 md:px-6 md:pb-8 pt-2 ml-[4.5rem] border-t border-slate-100">
            <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {day.description}
            </div>

            {/* Meals & Hotel Info */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-sm">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <span className="font-bold text-slate-700">อาหาร:</span>
                <span className="text-slate-600">
                  {day.meals.breakfast ? 'เช้า' : '-'} / {day.meals.lunch ? 'กลางวัน' : '-'} / {day.meals.dinner ? 'เย็น' : '-'}
                </span>
              </div>
              
              {day.hotel && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-sm">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className="font-bold text-slate-700">ที่พัก:</span>
                  <span className="text-slate-600">{day.hotel}</span>
                </div>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
