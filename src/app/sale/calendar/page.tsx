import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generating a simple 5-week grid mock
  const calendarGrid = Array.from({ length: 35 }, (_, i) => {
    const day = i - 2; // starting from previous month's 29th
    const isCurrentMonth = day > 0 && day <= 31;
    return {
      day: isCurrentMonth ? day : (day <= 0 ? 31 + day : day - 31),
      isCurrentMonth,
      hasEvent: [15, 20, 22].includes(day) && isCurrentMonth,
      hasMeeting: [5, 12, 18].includes(day) && isCurrentMonth
    };
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ปฏิทินงาน (Calendar)</h1>
          <p className="text-sm text-slate-500">ตารางนัดหมายลูกค้า และวันเดินทางของกรุ๊ปที่คุณดูแล</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
            วันนี้ (Today)
          </button>
          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
            <button className="px-3 py-2 hover:bg-slate-50 text-slate-600"><ChevronLeft size={18} /></button>
            <span className="px-4 py-2 text-sm font-bold border-l border-r border-slate-300">ตุลาคม 2026</span>
            <button className="px-3 py-2 hover:bg-slate-50 text-slate-600"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {days.map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {calendarGrid.map((date, i) => (
              <div key={i} className={`min-h-[100px] border-b border-r border-slate-100 p-2 ${date.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${i % 7 === 6 ? 'border-r-0' : ''}`}>
                <span className={`text-sm font-medium ${date.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'} ${date.day === 15 && date.isCurrentMonth ? 'w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center' : ''}`}>
                  {date.day}
                </span>
                
                <div className="mt-2 space-y-1">
                  {date.hasEvent && (
                    <div className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded truncate cursor-pointer hover:bg-emerald-200">
                      ✈️ ทัวร์ญี่ปุ่นออกเดินทาง
                    </div>
                  )}
                  {date.hasMeeting && (
                    <div className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded truncate cursor-pointer hover:bg-amber-200">
                      📞 นัดโทรคุณสมชาย
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">นัดหมายเร็วๆ นี้</h3>
              <button className="text-slate-400 hover:text-indigo-600"><Filter size={16} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex flex-col items-center justify-center shrink-0 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Oct</span>
                  <span className="text-sm font-black text-amber-700 leading-none">18</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">โทรเจรจาใบเสนอราคา</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> 14:30 น. • บจก. เอบีซี</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex flex-col items-center justify-center shrink-0 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Oct</span>
                  <span className="text-sm font-black text-emerald-700 leading-none">20</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">กรุ๊ปทัวร์ยุโรปออกเดินทาง</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> สุวรรณภูมิ • คุณสมชายและครอบครัว</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
