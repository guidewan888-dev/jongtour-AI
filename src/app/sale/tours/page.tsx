import { Search, Filter, Calendar, MapPin, Globe, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SaleToursPage() {
  const tours = [
    { id: '1', name: 'Japan Alpine Route 6D4N', destination: 'Japan', price: 45900, available: 12, dates: '15-20 Dec 2026' },
    { id: '2', name: 'Classic Europe 8D5N', destination: 'Europe', price: 89000, available: 4, dates: '22-29 Nov 2026' },
    { id: '3', name: 'Hokkaido Snow Festival', destination: 'Japan', price: 52000, available: 20, dates: '5-10 Feb 2027' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ค้นหาทัวร์ (Find Tours)</h1>
          <p className="text-sm text-slate-500">ค้นหาโปรแกรมทัวร์ เพื่อออกใบเสนอราคาหรือสร้างลิงก์จองให้ลูกค้า</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อโปรแกรม, รหัสทัวร์, หรือประเทศ..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white">
            <option>ทุกทวีป</option>
            <option>Asia</option>
            <option>Europe</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white">
            <option>ทุกช่วงเวลา</option>
            <option>พ.ย. 2026</option>
            <option>ธ.ค. 2026</option>
          </select>
        </div>

        {/* Tour List */}
        <div className="divide-y divide-slate-100">
          {tours.map((tour) => (
            <div key={tour.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {tour.destination}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Calendar size={12}/> {tour.dates}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800">{tour.name}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400"/> {tour.destination} • 
                  <span className={tour.available > 5 ? 'text-emerald-600 font-medium' : 'text-orange-600 font-medium'}>
                    เหลือที่นั่ง: {tour.available}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto border-t border-slate-100 md:border-none pt-4 md:pt-0 mt-4 md:mt-0">
                <div className="text-right flex-1 md:flex-none">
                  <p className="text-xs text-slate-500">ราคาขาย (Retail)</p>
                  <p className="font-black text-xl text-slate-900">฿{tour.price.toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full md:w-auto text-center">
                    สร้างใบเสนอราคา
                  </button>
                  <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full md:w-auto text-center">
                    ส่งลิงก์จอง (Booking Link)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
