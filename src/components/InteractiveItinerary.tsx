"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Check, X } from "lucide-react";

export default function InteractiveItinerary({ itinerary }: { itinerary: any }) {
  const [days, setDays] = useState(itinerary?.days || []);

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index - 1];
      newDays[index - 1] = temp;
      newDays.forEach((d: any, i: number) => d.day = i + 1);
      setDays(newDays);
    } else if (direction === 'down' && index < days.length - 1) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index + 1];
      newDays[index + 1] = temp;
      newDays.forEach((d: any, i: number) => d.day = i + 1);
      setDays(newDays);
    }
  };

  if (!itinerary) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">✨ {itinerary.title}</h2>
        <div className="inline-block bg-white text-orange-600 font-bold rounded-md px-4 py-1 mt-2 shadow-sm">
          ราคาประเมินเบื้องต้น: {itinerary.estimatedPrice}
        </div>
      </div>

      {/* Itinerary Table */}
      <div className="p-0 print-itinerary-body overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="py-3 px-4 w-16 text-center font-bold text-sm">วันที่</th>
              <th className="py-3 px-4 font-bold text-sm">รายการทัวร์</th>
              <th className="py-3 px-2 w-32 text-center border-l border-white/20">
                <div className="text-sm font-bold mb-1">อาหาร</div>
                <div className="flex justify-between text-[10px] px-2 font-normal">
                  <span>เช้า</span>
                  <span>กลางวัน</span>
                  <span>ค่ำ</span>
                </div>
              </th>
              <th className="py-3 px-4 w-48 text-center font-bold text-sm border-l border-white/20">โรงแรม</th>
              <th className="w-12 border-l border-white/20 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {days.map((d: any, index: number) => (
              <tr key={d.day} className="border-b border-gray-200 hover:bg-gray-50 group">
                {/* Day Number */}
                <td className="py-4 px-4 text-center font-bold text-lg text-orange-500 align-top">
                  {d.day}
                </td>
                
                {/* Tour Program */}
                <td className="py-4 px-4 align-top">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1 -mx-1" contentEditable suppressContentEditableWarning>
                    {d.title}
                  </h3>
                  <p className="text-gray-600 text-[13px] leading-relaxed outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1 -mx-1 whitespace-pre-line" contentEditable suppressContentEditableWarning>
                    {d.detail}
                  </p>
                </td>

                {/* Meals */}
                <td className="py-4 px-2 align-middle border-l border-gray-100">
                  <div className="flex justify-between items-center px-4">
                    {/* Breakfast */}
                    <div>
                      {d.meals?.breakfast ? (
                        <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    {/* Lunch */}
                    <div>
                      {d.meals?.lunch ? (
                        <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    {/* Dinner */}
                    <div>
                      {d.meals?.dinner ? (
                        <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </td>

                {/* Hotel */}
                <td className="py-4 px-4 text-center align-middle border-l border-gray-100">
                  <p className="text-[13px] font-bold text-orange-600 outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1" contentEditable suppressContentEditableWarning>
                    {d.hotel || "-"}
                  </p>
                </td>

                {/* Action Controls */}
                <td className="py-4 px-2 align-middle border-l border-gray-100 no-print">
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveDay(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded disabled:opacity-30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button onClick={() => moveDay(index, 'down')} disabled={index === days.length - 1} className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded disabled:opacity-30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inclusions & Exclusions */}
      {(itinerary.inclusions || itinerary.exclusions) && (
        <div className="bg-gray-50 px-6 md:px-8 py-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
          {/* Inclusions */}
          {itinerary.inclusions && itinerary.inclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> สิ่งที่รวมในราคาทัวร์
              </h4>
              <ul className="space-y-2">
                {itinerary.inclusions.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {itinerary.exclusions && itinerary.exclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-red-500 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> รายการที่ราคาทัวร์มักไม่รวม
              </h4>
              <ul className="space-y-2">
                {itinerary.exclusions.map((item: string, idx: number) => {
                  const parts = item.split(':');
                  return (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
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
      <div className="p-4 bg-gray-100 border-t border-gray-200 no-print flex justify-between items-center px-6">
        <p className="text-gray-500 text-xs">Generated by Jongtour AI</p>
        <button onClick={() => window.print()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          Print PDF
        </button>
      </div>
    </div>
  );
}
