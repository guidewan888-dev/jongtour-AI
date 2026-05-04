"use client";

import { useState } from 'react';
import { Eye, FileText, Check, X, AlertCircle } from 'lucide-react';

export default function HumanReviewPage() {
  const [queue, setQueue] = useState([
    {
      id: "Q_1",
      title: "เวียดนาม ดานัง ฮอยอัน 4D3N",
      file: "VN_DANANG_PROMO.pdf",
      supplier: "siam_orchard",
      conf: 65,
      extracted: {
        priceAdult: 15900,
        priceChild: "1S900", // OCR typo
        departureDate: "2026-11-15",
        lowConfidenceFields: ["priceChild"]
      }
    },
    {
      id: "Q_2",
      title: "ทัวร์เกาหลี โซล 5D3N",
      file: "KR_SEOUL_WINTER.pdf",
      supplier: "checkin_group",
      conf: 45,
      extracted: {
        priceAdult: 25000,
        priceChild: 20000,
        departureDate: "2026-12-01",
        lowConfidenceFields: ["departureDate"]
      }
    }
  ]);

  const [activeItem, setActiveItem] = useState(queue[0]);

  const handleApprove = async () => {
    if (!activeItem) return;
    window.alert(`Approved data for ${activeItem.title} and saved to database.`);
    const nextQueue = queue.filter(q => q.id !== activeItem.id);
    setQueue(nextQueue);
    setActiveItem(nextQueue[0] || null);
  };

  const handleReject = async () => {
    if (!activeItem) return;
    window.alert(`Rejected OCR data for ${activeItem.title}. Moved to manual entry.`);
    const nextQueue = queue.filter(q => q.id !== activeItem.id);
    setQueue(nextQueue);
    setActiveItem(nextQueue[0] || null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 font-sans">Human Review Queue (OCR)</h1>
          <p className="text-slate-500 text-xs font-sans">รายการทัวร์ที่ AI (OCR) สกัดข้อมูลจาก PDF แต่ได้คะแนนความมั่นใจต่ำกว่า 80% กรุณาตรวจสอบก่อนบันทึก</p>
        </div>
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold font-mono">
          <AlertCircle size={14} /> {queue.length} Items Pending
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left: Queue List */}
        <div className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black">
            <span className="text-xs font-bold text-slate-400 font-mono">PENDING QUEUE</span>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No items in queue.</div>
            ) : (
              queue.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${activeItem?.id === item.id ? 'bg-slate-900 border-l-2 border-l-emerald-500' : 'hover:bg-slate-900/50'}`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300 font-sans line-clamp-1">{item.title}</span>
                    <span className={`text-[10px] font-mono font-bold ${item.conf >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>Conf: {item.conf}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">File: {item.file}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Supplier: {item.supplier}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Review Tool */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 font-mono">OCR EXTRACTION REVIEW</span>
            {activeItem && (
              <div className="flex gap-2">
                <button onClick={handleReject} className="text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono transition-colors">
                  <X size={12}/> REJECT
                </button>
                <button onClick={handleApprove} className="text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono transition-colors">
                  <Check size={12}/> APPROVE & SAVE
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex min-h-0">
            {activeItem ? (
              <>
                {/* Source PDF View (Mock) */}
                <div className="w-1/2 border-r border-slate-800 p-4 bg-slate-900 flex flex-col">
                  <span className="text-[10px] text-slate-500 mb-2 font-mono">SOURCE PDF PREVIEW</span>
                  <div className="flex-1 bg-slate-200 rounded p-4 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-slate-400">
                      <FileText size={48} className="mb-2 opacity-50" />
                      <span className="text-sm font-sans font-bold text-slate-500">{activeItem.file} Viewer</span>
                    </div>
                    {/* Mock highlight over text */}
                    <div className="absolute top-[30%] left-[20%] w-[40%] h-6 border-2 border-rose-500 bg-rose-500/20"></div>
                  </div>
                </div>

                {/* Extracted Data Form */}
                <div className="w-1/2 p-6 overflow-y-auto bg-slate-950 font-mono text-xs">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded mb-6 text-rose-400">
                    <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Low Confidence Detected</p>
                    <p className="text-[10px]">AI ไม่มั่นใจเรื่อง "{activeItem.extracted.lowConfidenceFields.join(', ')}" เนื่องจากอักษรซ้อนทับกัน</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-500 mb-1">Tour Name (TH)</label>
                      <input type="text" defaultValue={activeItem.title} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-500 mb-1">Price Adult (THB)</label>
                        <input type="text" defaultValue={activeItem.extracted.priceAdult} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" />
                      </div>
                      <div>
                        <label className={`block mb-1 font-bold ${activeItem.extracted.lowConfidenceFields.includes("priceChild") ? "text-rose-400" : "text-slate-500"}`}>Price Child (THB) {activeItem.extracted.lowConfidenceFields.includes("priceChild") && "⚠️"}</label>
                        <input type="text" defaultValue={activeItem.extracted.priceChild} className={`w-full rounded p-2 outline-none ${activeItem.extracted.lowConfidenceFields.includes("priceChild") ? "bg-rose-500/10 border border-rose-500/50 text-rose-400 focus:border-rose-400" : "bg-slate-900 border border-slate-700 text-emerald-400"}`} />
                      </div>
                    </div>
                    <div>
                      <label className={`block mb-1 font-bold ${activeItem.extracted.lowConfidenceFields.includes("departureDate") ? "text-rose-400" : "text-slate-500"}`}>Departure Date {activeItem.extracted.lowConfidenceFields.includes("departureDate") && "⚠️"}</label>
                      <input type="text" defaultValue={activeItem.extracted.departureDate} className={`w-full rounded p-2 outline-none ${activeItem.extracted.lowConfidenceFields.includes("departureDate") ? "bg-rose-500/10 border border-rose-500/50 text-rose-400 focus:border-rose-400" : "bg-slate-900 border border-slate-700 text-emerald-400"}`} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 flex-col">
                <Check size={48} className="mb-4 opacity-50" />
                <p>All queue items reviewed!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
