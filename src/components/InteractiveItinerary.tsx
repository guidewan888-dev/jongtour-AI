"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Plane, Hotel, MapPin, Utensils, Bus, Camera } from "lucide-react";

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

  const getDayIcon = (title: string, detail: string) => {
    const text = (title + " " + detail).toLowerCase();
    if (text.includes("สนามบิน") || text.includes("บิน") || text.includes("airport") || text.includes("flight") || text.includes("สุวรรณภูมิ") || text.includes("ดอนเมือง")) {
      return <Plane className="w-5 h-5" />;
    }
    if (text.includes("โรงแรม") || text.includes("พัก") || text.includes("hotel") || text.includes("resort")) {
      return <Hotel className="w-5 h-5" />;
    }
    if (text.includes("รถ") || text.includes("เดินทาง") || text.includes("bus") || text.includes("transfer")) {
      return <Bus className="w-5 h-5" />;
    }
    if (text.includes("อาหาร") || text.includes("กิน") || text.includes("ทาน") || text.includes("ร้าน") || text.includes("ภัตตาคาร")) {
      return <Utensils className="w-5 h-5" />;
    }
    if (text.includes("เที่ยว") || text.includes("ถ่ายรูป") || text.includes("ชม")) {
      return <Camera className="w-5 h-5" />;
    }
    return <MapPin className="w-5 h-5" />;
  };

  const getIconColor = (title: string, detail: string) => {
    const text = (title + " " + detail).toLowerCase();
    if (text.includes("สนามบิน") || text.includes("บิน") || text.includes("airport") || text.includes("flight")) return "text-blue-500 bg-blue-50 border-blue-200";
    if (text.includes("โรงแรม") || text.includes("พัก") || text.includes("hotel")) return "text-indigo-500 bg-indigo-50 border-indigo-200";
    if (text.includes("อาหาร") || text.includes("กิน") || text.includes("ทาน")) return "text-rose-500 bg-rose-50 border-rose-200";
    return "text-orange-600 bg-orange-50 border-orange-200"; // default
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
      <div className="p-6 md:p-8 space-y-0 print-itinerary-body bg-gray-50 flex-1 relative">
        {/* Continuous Timeline Line behind the cards */}
        <div className="absolute left-[3.25rem] md:left-[3.75rem] top-8 bottom-8 w-1 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200 rounded-full z-0 hidden sm:block"></div>

        {days.map((d: any, index: number) => {
          const iconColors = getIconColor(d.title, d.detail);
          
          return (
          <div key={d.day} className="flex gap-4 md:gap-6 relative group bg-transparent py-4 z-10">
            {/* Timeline Node */}
            <div className="flex flex-col items-center w-12 md:w-16 shrink-0 pt-2">
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl shadow-sm border ${iconColors} transition-transform group-hover:scale-110 z-10`}>
                {getDayIcon(d.title, d.detail)}
              </div>
              <span className="text-xs font-bold text-gray-500 mt-2 bg-gray-100 px-2 py-0.5 rounded-full">วันที่ {d.day}</span>
              
              {/* Mobile Line connection */}
              <div className="w-0.5 bg-orange-200 flex-1 mt-2 mb-[-1rem] block sm:hidden group-last:hidden"></div>
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group-hover:border-orange-300 transition-colors relative">
              {/* Left Arrow for Desktop */}
              <div className="hidden sm:block absolute top-7 -left-2 w-4 h-4 bg-white border-l border-b border-gray-100 group-hover:border-orange-300 transform rotate-45 transition-colors"></div>
              
              <div className="pt-1">
                <h3 className="font-bold text-gray-800 text-lg md:text-xl mb-3 outline-none focus:ring-2 focus:ring-orange-200 rounded-lg px-2 -mx-2 transition-all cursor-text flex items-center gap-2" contentEditable suppressContentEditableWarning>
                  {d.title}
                </h3>
                <p className="text-gray-600 text-[15px] leading-relaxed outline-none focus:ring-2 focus:ring-orange-200 rounded-lg px-2 -mx-2 transition-all cursor-text whitespace-pre-line" contentEditable suppressContentEditableWarning>
                  {d.detail}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print absolute right-2 top-2">
                <button onClick={() => moveDay(index, 'up')} disabled={index === 0} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-30 transition-colors bg-white shadow-sm border border-gray-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                </button>
                <button onClick={() => moveDay(index, 'down')} disabled={index === days.length - 1} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-30 transition-colors bg-white shadow-sm border border-gray-100 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        )})}
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
