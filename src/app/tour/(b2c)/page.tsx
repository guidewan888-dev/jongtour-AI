import { Search, MapPin, Calendar, Sparkles } from 'lucide-react';

export default function TourHomePage() {
  return (
    <div>
      {/* Hero Search Area (OTA Style) */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">ค้นหาทัวร์ต่างประเทศที่ใช่ สำหรับคุณ</h1>
            <p className="text-slate-300 text-lg">กว่า 5,000 โปรแกรม จากโฮลเซลล์ชั้นนำทั่วประเทศ อัปเดตที่นั่งเรียลไทม์</p>
          </div>

          {/* The Big Search Box */}
          <div className="bg-white p-2 md:p-4 rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row gap-2">
              
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="อยากไปเที่ยวที่ไหน? (เช่น ญี่ปุ่น, ยุโรป, โอซาก้า)" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              <div className="md:w-64 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <select className="w-full pl-12 pr-10 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl font-medium text-slate-900 appearance-none outline-none transition-all">
                  <option value="">เดือนเดินทางทั้งหมด</option>
                  <option value="10">ตุลาคม 2026</option>
                  <option value="11">พฤศจิกายน 2026</option>
                  <option value="12">ธันวาคม 2026</option>
                </select>
              </div>

              <a href="/tour/search" className="md:w-auto w-full px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/30">
                <Search size={20} /> ค้นหาทัวร์
              </a>

            </div>

            {/* AI Banner inside search box */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Sparkles size={16} className="text-indigo-600" />
                </div>
                <span>ขี้เกียจพิมพ์ค้นหาเองใช่ไหม? ให้ AI ช่วยหาทัวร์ให้คุณสิ</span>
              </div>
              <a href="/tour/ai" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-lg">
                ทดลองใช้ AI Search &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tours Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">ทัวร์ยอดฮิต (Popular Tours)</h2>
              <p className="text-slate-500 mt-1">โปรแกรมทัวร์ที่คนจองเยอะที่สุดในสัปดาห์นี้</p>
            </div>
            <a href="/tour/search" className="text-orange-600 font-bold hover:text-orange-800 text-sm hidden sm:block">ดูทัวร์ทั้งหมด &rarr;</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded shadow-sm z-10 uppercase tracking-wider">
                    ไฟไหม้
                  </div>
                  {/* Fallback image */}
                  <div className="w-full h-full bg-gradient-to-tr from-slate-300 to-slate-200 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">JAPAN</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">5D3N</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                    ทัวร์โตเกียว ฟูจิ คาวากุจิโกะ ช้อปปิ้งชินจูกุ (ลดพิเศษ)
                  </h3>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400 line-through">฿35,900</p>
                      <p className="text-xl font-black text-orange-600">฿29,900</p>
                    </div>
                    <a href="https://booking.jongtour.com" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                      จองเลย
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
