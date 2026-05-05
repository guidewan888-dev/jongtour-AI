import React from 'react';
import { TourDeparture } from '@/types/tour';

interface TourPriceTableProps {
  departures: TourDeparture[];
}

export default function TourPriceTable({ departures }: TourPriceTableProps) {
  if (!departures || departures.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
        <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4">วันเดินทาง</th>
            <th className="px-6 py-4">ผู้ใหญ่ (พักคู่)</th>
            <th className="px-6 py-4">เด็ก (ไม่มีเตียง)</th>
            <th className="px-6 py-4">พักเดี่ยวเพิ่ม</th>
            <th className="px-6 py-4">สถานะ</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {departures.map(dep => {
            const startDateStr = new Date(dep.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
            const endDateStr = new Date(dep.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
            
            const isFull = dep.status === 'SOLD_OUT';
            const isFew = dep.status === 'FEW_SEATS';

            return (
              <tr key={dep.id} className={`hover:bg-slate-50 transition-colors ${isFull ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {startDateStr} - {endDateStr}
                </td>
                <td className="px-6 py-4 font-bold text-orange-600">฿{dep.priceAdult.toLocaleString()}</td>
                <td className="px-6 py-4">฿{dep.priceChild.toLocaleString()}</td>
                <td className="px-6 py-4">฿{dep.priceSingle.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {isFull ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      เต็ม
                    </span>
                  ) : isFew ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      เหลือ {dep.remainingSeats} ที่
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      ว่าง ({dep.remainingSeats})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    disabled={isFull}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isFull ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    {isFull ? 'Sold Out' : 'เลือก'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
