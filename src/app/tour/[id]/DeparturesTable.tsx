"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function DeparturesTable({ departures, tourId }: { departures: any[], tourId: string }) {
  const [showAll, setShowAll] = useState(false);

  const displayedDepartures = showAll ? departures : departures.slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6" id="departures-table">
      <div className="bg-gray-100 p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" /> ตารางวันเดินทางและราคา
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">วันเดินทาง</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ราคาผู้ใหญ่</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ที่นั่งทั้งหมด</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">ที่นั่งว่าง</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap border-r border-gray-200">สถานะ</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap">ทำรายการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedDepartures && displayedDepartures.length > 0 ? (
              displayedDepartures.map((dep: any) => {
                const startDateStr = new Date(dep.startDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                const endDateStr = new Date(dep.endDate).toLocaleDateString('th-TH', {day: '2-digit', month: 'short', year: '2-digit'});
                
                let statusEl;
                if (dep.availableSeats <= 0) {
                  statusEl = <span className="text-red-600 bg-red-50 px-2 py-1 rounded font-bold">เต็ม</span>;
                } else if (dep.availableSeats <= 5) {
                  statusEl = <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold">ใกล้เต็ม</span>;
                } else {
                  statusEl = <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold">ว่าง</span>;
                }

                return (
                  <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">
                      {startDateStr} - {endDateStr}
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900 text-lg">฿{dep.price.toLocaleString()}</td>
                    <td className="px-4 py-4 text-gray-600">{dep.totalSeats || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{dep.availableSeats}</td>
                    <td className="px-4 py-4">{statusEl}</td>
                    <td className="px-4 py-4">
                      {dep.availableSeats > 0 ? (
                        <Link href={`/checkout/${tourId}?departureId=${dep.id}`} className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-4 rounded transition-colors text-xs">
                          จองเลย
                        </Link>
                      ) : (
                        <button className="bg-gray-300 text-gray-500 font-bold py-1.5 px-4 rounded text-xs cursor-not-allowed" disabled>
                          เต็ม
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  ยังไม่มีรอบเดินทางในขณะนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {departures && departures.length > 4 && !showAll && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <button 
            onClick={() => setShowAll(true)}
            className="text-orange-600 font-bold text-sm hover:text-orange-700 hover:underline px-4 py-2"
          >
            ดูเพิ่มเติมอีก {departures.length - 4} รอบเดินทาง ⬇
          </button>
        </div>
      )}
      {departures && departures.length > 4 && showAll && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <button 
            onClick={() => setShowAll(false)}
            className="text-gray-600 font-bold text-sm hover:text-gray-800 hover:underline px-4 py-2"
          >
            ซ่อนรอบเดินทาง ⬆
          </button>
        </div>
      )}
    </div>
  );
}
