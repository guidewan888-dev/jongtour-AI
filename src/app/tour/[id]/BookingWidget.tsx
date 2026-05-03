"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function BookingWidget({ lowestPrice, tourId, departures }: { lowestPrice: number, tourId: string, departures: any[] }) {
  const [selectedDeparture, setSelectedDeparture] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
      
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h3 className="font-bold text-lg text-center">ทำรายการจอง / สอบถาม</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6 pb-6 border-b border-gray-100 text-center">
          <span className="text-gray-500 text-sm block mb-1">ราคาเริ่มต้นต่อท่าน</span>
          <span className="text-3xl font-black text-orange-600">
            ฿ {lowestPrice.toLocaleString()}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">เลือกรอบเดินทาง</label>
            <select 
              value={selectedDeparture} 
              onChange={e => setSelectedDeparture(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">-- กรุณาเลือกรอบเดินทาง --</option>
              {departures && departures.map((dep: any) => (
                <option key={dep.id} value={dep.id} disabled={dep.availableSeats <= 0}>
                  {new Date(dep.startDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short'})} - {new Date(dep.endDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short'})} 
                  (฿{dep.price.toLocaleString()}) {dep.availableSeats <= 0 ? '[เต็ม]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ผู้ใหญ่</label>
              <select 
                value={adults}
                onChange={e => setAdults(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {Array.from({length: 30}, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} ท่าน</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">เด็ก <span className="text-gray-400 font-normal text-xs">(2-11 ปี)</span></label>
              <select 
                value={children}
                onChange={e => setChildren(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {Array.from({length: 21}, (_, i) => i).map(n => (
                  <option key={n} value={n}>{n} ท่าน</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href={`/checkout/${tourId}?departureId=${selectedDeparture}&adults=${adults}&children=${children}`} 
              className={`block w-full text-center py-3 rounded-md font-bold transition-colors ${
                selectedDeparture ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-500 pointer-events-none'
              }`}
            >
              ไปหน้าจองทัวร์
            </Link>
          </div>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">หรือ</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <a 
              href="https://line.me/ti/p/~@jongtour" 
              target="_blank" 
              rel="noreferrer" 
              onClick={() => {
                fetch('/api/leads/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ source: 'TOUR_WIDGET', tourId })
                }).catch(e => console.error(e));
              }}
              className="flex items-center justify-center gap-2 w-full bg-[#00B900] text-white py-3 rounded-md font-bold hover:bg-[#009900] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              สอบถามทาง LINE
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
