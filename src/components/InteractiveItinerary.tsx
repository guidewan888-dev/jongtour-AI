"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function InteractiveItinerary({ itinerary }: { itinerary: any }) {
  const [days, setDays] = useState(itinerary?.days || []);

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index - 1];
      newDays[index - 1] = temp;
      newDays.forEach((d, i) => d.day = i + 1);
      setDays(newDays);
    } else if (direction === 'down' && index < days.length - 1) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index + 1];
      newDays[index + 1] = temp;
      newDays.forEach((d, i) => d.day = i + 1);
      setDays(newDays);
    }
  };

  if (!itinerary) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto mt-4 bg-white border border-orange-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <h2 className="text-2xl font-bold mb-3 relative z-10">✨ {itinerary.title}</h2>
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/30 relative z-10">
          <p className="text-orange-50 font-medium text-sm">ประเมินราคาเบื้องต้น: <span className="font-bold text-white text-lg">{itinerary.estimatedPrice}</span></p>
        </div>
      </div>

      {/* Itinerary Body */}
      <div className="p-6 md:p-8 space-y-6 print-itinerary-body bg-gray-50 flex-1">
        {days.map((d: any, index: number) => (
          <div key={d.day} className="flex gap-4 relative group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
            <div className="flex flex-col items-center gap-2 w-14 shrink-0">
              <span className="text-sm font-bold text-orange-600 bg-orange-100 w-12 h-12 flex items-center justify-center rounded-full border border-orange-200 shadow-inner">D{d.day}</span>
              <div className="flex-1 w-0.5 bg-orange-100 my-1 group-last:hidden"></div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-bold text-gray-800 text-lg mb-3 outline-none focus:ring-2 focus:ring-orange-200 rounded-lg px-2 -mx-2 transition-all cursor-text" contentEditable suppressContentEditableWarning>
                {d.title}
              </h3>
              <p className="text-gray-600 text-[15px] leading-relaxed outline-none focus:ring-2 focus:ring-orange-200 rounded-lg px-2 -mx-2 transition-all cursor-text whitespace-pre-line" contentEditable suppressContentEditableWarning>
                {d.detail}
              </p>
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print absolute right-2 top-2">
              <button onClick={() => moveDay(index, 'up')} disabled={index === 0} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-30 transition-colors bg-white shadow-sm border border-gray-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <button onClick={() => moveDay(index, 'down')} disabled={index === days.length - 1} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-30 transition-colors bg-white shadow-sm border border-gray-100 mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inclusions & Exclusions */}
      {(itinerary.inclusions || itinerary.exclusions) && (
        <div className="bg-white px-6 md:px-8 py-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inclusions */}
          {itinerary.inclusions && itinerary.inclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> สิ่งที่รวมในราคาทัวร์
              </h4>
              <ul className="space-y-3">
                {itinerary.inclusions.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-[14px] text-gray-700 leading-relaxed">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {itinerary.exclusions && itinerary.exclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <XCircle className="w-5 h-5 text-red-500" /> รายการที่ราคาทัวร์มักไม่รวม
              </h4>
              <ul className="space-y-3">
                {itinerary.exclusions.map((item: string, idx: number) => {
                  const parts = item.split(':');
                  return (
                    <li key={idx} className="flex items-start gap-2 text-[14px] text-gray-600 leading-relaxed">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>
                        {parts.length > 1 ? (
                          <>
                            <strong className="text-gray-800">{parts[0]}:</strong> {parts.slice(1).join(':')}
                          </>
                        ) : (
                          item
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer / Export */}
      <div className="p-4 bg-gray-900 no-print flex justify-between items-center px-6">
        <p className="text-gray-400 text-xs">Jongtour AI Planner</p>
        <button onClick={() => window.print()} className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          Export เป็น PDF
        </button>
      </div>
    </div>
  );
}
