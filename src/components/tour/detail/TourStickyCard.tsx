'use client';
import React, { useState } from 'react';
import { TourDetail } from '@/types/tour';
import Link from 'next/link';

interface TourStickyCardProps {
  tour: TourDetail;
}

export default function TourStickyCard({ tour }: TourStickyCardProps) {
  const [pax, setPax] = useState(2);
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  // Calculate total price based on selected departure or base price
  const basePrice = selectedDeparture 
    ? tour.departures.find(d => d.id === selectedDeparture)?.priceAdult || tour.price.starting
    : tour.price.starting;
  const totalPrice = basePrice * pax;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 p-6 md:p-8 sticky top-24">
      
      {/* Price Header */}
      <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100">
        <div>
          <span className="text-slate-500 text-sm font-medium">ราคาเริ่มต้น / ท่าน</span>
          {tour.price.original && (
            <div className="text-sm text-slate-400 line-through mt-1">฿{tour.price.original.toLocaleString()}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            ฿{tour.price.starting.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">เลือกรอบเดินทาง (Departure)</label>
        <select 
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium appearance-none"
          value={selectedDeparture || ''}
          onChange={(e) => setSelectedDeparture(e.target.value)}
        >
          <option value="" disabled>เลือกวันเดินทาง...</option>
          {tour.departures.slice(0, 5).map(dep => {
            const dateStr = new Date(dep.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
            return (
              <option key={dep.id} value={dep.id}>
                {dateStr} (เหลือ {dep.remainingSeats} ที่) - ฿{dep.priceAdult.toLocaleString()}
              </option>
            );
          })}
        </select>
      </div>

      {/* Pax Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนผู้เดินทาง (ผู้ใหญ่)</label>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <button onClick={() => setPax(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none disabled:opacity-50" disabled={pax <= 1}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
          <span className="font-bold text-slate-900">{pax}</span>
          <button onClick={() => setPax(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mb-6 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
        <span className="font-bold text-slate-700">ราคารวม ({pax} ท่าน)</span>
        <span className="text-xl font-black text-orange-600">฿{totalPrice.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link 
          href={selectedDeparture ? `/checkout?tour_id=${tour.id}&departure_id=${selectedDeparture}&pax=${pax}` : '#'}
          className={`w-full font-bold py-4 rounded-xl shadow-md transition-all text-lg flex items-center justify-center gap-2 ${
            selectedDeparture 
              ? 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!selectedDeparture) {
              e.preventDefault();
              alert('กรุณาเลือกรอบเดินทางก่อนทำการจองครับ');
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
          จองเลย
        </Link>
        
        <div className="grid grid-cols-2 gap-3">
          <a href="https://line.me/R/ti/p/@jongtour" target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            ขอใบเสนอราคา
          </a>
          <a href={`/ai-search?q=${encodeURIComponent('ถามข้อมูลทัวร์ ' + tour.code)}`} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            ถาม AI
          </a>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-slate-400">ราคาอาจมีการเปลี่ยนแปลง ขึ้นอยู่กับที่นั่งว่างของสายการบิน</p>
      </div>

    </div>
  );
}
