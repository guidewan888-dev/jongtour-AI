import { Filter, ChevronDown } from 'lucide-react';

export default function SearchToursPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">ค้นหาทัวร์ (All Tours)</h1>
          <div className="text-sm text-slate-500">พบ 1,245 โปรแกรม</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <Filter size={18} className="text-slate-500" />
              <h2 className="font-bold text-slate-800">ตัวกรอง (Filters)</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-700 text-sm mb-3">ประเทศปลายทาง</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> ญี่ปุ่น (450)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> เกาหลีใต้ (320)</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> ยุโรป (180)</label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 text-sm mb-3">ช่วงราคา</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> ต่ำกว่า 20,000 บาท</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> 20,000 - 40,000 บาท</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> 40,000 บาทขึ้นไป</label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Listing */}
        <div className="flex-1 space-y-4">
          {/* Sorting Bar */}
          <div className="flex justify-end mb-6">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">
              เรียงตาม: ราคา (ต่ำไปสูง) <ChevronDown size={16} />
            </button>
          </div>

          {/* List items */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
              <div className="w-full sm:w-64 h-48 bg-slate-200 relative shrink-0">
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">6 วัน 4 คืน</div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">PROMO</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">JAPAN</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 hover:text-orange-600 cursor-pointer">แพ็กเกจทัวร์ฮอกไกโด ซัปโปโร โอตารุ ชมทุ่งดอกลาเวนเดอร์ (บินตรง)</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">เดินทางด้วยสายการบิน Thai Airways พักโรงแรม 4 ดาว 3 คืน พร้อมอาหาร 10 มื้อ ออนเซ็น 1 คืนเต็มอิ่ม</p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-slate-100 pt-4">
                  <div className="text-sm text-slate-600">
                    <span className="block font-medium">วันเดินทางที่ว่าง:</span>
                    <span className="text-emerald-600 font-semibold">12-17 ต.ค., 20-25 ต.ค.</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">เริ่มต้นท่านละ</p>
                    <p className="text-2xl font-black text-orange-600">฿45,900</p>
                    <a href="https://booking.jongtour.com" className="mt-2 inline-block px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg w-full sm:w-auto text-center">
                      จองเลย
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
