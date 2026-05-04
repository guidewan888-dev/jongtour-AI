import { UploadCloud, FileText, Settings, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function OCRImportPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 font-sans">AI-OCR PDF Import</h1>
          <p className="text-slate-500 text-xs font-sans">อัปโหลดไฟล์ PDF โปรแกรมทัวร์ เพื่อให้ AI สกัดข้อมูลและนำเข้าสู่ระบบอัตโนมัติ</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-slate-200 font-bold mb-2 font-sans">Drag & drop PDF files here</h3>
        <p className="text-slate-500 text-xs mb-6 font-mono">Support .pdf up to 10MB per file</p>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded transition-colors text-sm font-sans">
          Browse Files
        </button>
      </div>

      {/* Upload Settings & Status */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 font-mono text-xs text-slate-300">
        <h3 className="font-bold text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Settings size={14} /> EXTRACTION SETTINGS
        </h3>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Target Supplier</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none">
              <option>siam_orchard (SUP-1c5d8a22)</option>
              <option>Unknown / Auto-detect</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Processing Mode</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none">
              <option>Strict Mode (Require Human Review if confidence &lt; 80%)</option>
              <option>Auto-Approve (Not Recommended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* File Queue */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
          <span className="font-bold text-slate-400">UPLOAD QUEUE</span>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors">
            <Play size={10} /> START EXTRACTION
          </button>
        </div>
        <div className="divide-y divide-slate-800">
          <div className="p-3 bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-rose-400" />
              <span className="text-slate-300">VN_DANANG_PROMO.pdf</span>
              <span className="text-slate-500 text-[10px]">2.4 MB</span>
            </div>
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-bold">READY</span>
          </div>
          <div className="p-3 bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-rose-400" />
              <span className="text-slate-300">EU_SWISS_WINTER.pdf</span>
              <span className="text-slate-500 text-[10px]">5.1 MB</span>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/20">EXTRACTING (45%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
