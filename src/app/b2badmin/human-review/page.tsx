import { Eye, FileText, Check, X, AlertCircle } from 'lucide-react';

export default function HumanReviewPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 font-sans">Human Review Queue (OCR)</h1>
          <p className="text-slate-500 text-xs font-sans">รายการทัวร์ที่ AI (OCR) สกัดข้อมูลจาก PDF แต่ได้คะแนนความมั่นใจต่ำกว่า 80% กรุณาตรวจสอบก่อนบันทึก</p>
        </div>
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold font-mono">
          <AlertCircle size={14} /> 5 Items Pending
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left: Queue List */}
        <div className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black">
            <span className="text-xs font-bold text-slate-400 font-mono">PENDING QUEUE</span>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {/* Item 1 */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 cursor-pointer border-l-2 border-l-emerald-500">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-white font-sans line-clamp-1">เวียดนาม ดานัง ฮอยอัน 4D3N</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">Conf: 65%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">File: VN_DANANG_PROMO.pdf</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">Supplier: siam_orchard</p>
            </div>
            {/* Item 2 */}
            <div className="p-4 border-b border-slate-800 hover:bg-slate-900/50 cursor-pointer">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-300 font-sans line-clamp-1">ทัวร์เกาหลี โซล 5D3N</span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">Conf: 45%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">File: KR_SEOUL_WINTER.pdf</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Supplier: checkin_group</p>
            </div>
          </div>
        </div>

        {/* Right: Review Tool */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 font-mono">OCR EXTRACTION REVIEW</span>
            <div className="flex gap-2">
              <button className="text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono">
                <X size={12}/> REJECT
              </button>
              <button className="text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono">
                <Check size={12}/> APPROVE & SAVE
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex min-h-0">
            {/* Source PDF View (Mock) */}
            <div className="w-1/2 border-r border-slate-800 p-4 bg-slate-900 flex flex-col">
              <span className="text-[10px] text-slate-500 mb-2 font-mono">SOURCE PDF PREVIEW</span>
              <div className="flex-1 bg-slate-200 rounded p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-slate-400">
                  <FileText size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-sans font-bold text-slate-500">PDF Viewer Component</span>
                </div>
                {/* Mock highlight over text */}
                <div className="absolute top-[30%] left-[20%] w-[40%] h-6 border-2 border-rose-500 bg-rose-500/20"></div>
              </div>
            </div>

            {/* Extracted Data Form */}
            <div className="w-1/2 p-6 overflow-y-auto bg-slate-950 font-mono text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded mb-6 text-rose-400">
                <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Low Confidence Detected</p>
                <p className="text-[10px]">AI ไม่มั่นใจเรื่อง "ราคาเด็ก (Child Price)" เนื่องจากตัวอักษรใน PDF ซ้อนทับกัน</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1">Tour Name (TH)</label>
                  <input type="text" defaultValue="เวียดนาม ดานัง ฮอยอัน 4D3N" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">Price Adult (THB)</label>
                    <input type="text" defaultValue="15900" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-rose-400 font-bold mb-1">Price Child (THB) ⚠️</label>
                    <input type="text" defaultValue="1S900" className="w-full bg-rose-500/10 border border-rose-500/50 rounded p-2 text-rose-400 outline-none focus:border-rose-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Departure Date</label>
                  <input type="text" defaultValue="2026-11-15" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
