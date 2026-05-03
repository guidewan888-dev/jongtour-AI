"use client";

import { FileText, Link as LinkIcon, Search, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function LeadActions({ leadId }: { leadId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";
    // Usually Sale would select a tour, but here we generate a link they can send where the customer selects
    const link = `${domain}/search?agent_ref=SALE-${leadId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateQuotation = () => {
    alert("ระบบสร้าง Draft ใบเสนอราคาเรียบร้อยแล้ว (Mock)");
  };

  return (
    <div className="w-80 min-w-[320px] bg-white border-l border-slate-200 p-6 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">เครื่องมือการขาย (Sales Actions)</h2>
      
      {/* Create Quotation */}
      <button onClick={handleCreateQuotation} className="w-full flex items-center gap-3 p-4 bg-white border-2 border-indigo-100 hover:border-indigo-600 rounded-xl group transition-colors text-left">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">สร้างใบเสนอราคา</p>
          <p className="text-xs text-slate-500">ออกเอกสารส่งให้ลูกค้าดู</p>
        </div>
      </button>

      {/* Generate Booking Link */}
      <button onClick={handleCopyLink} className="w-full flex items-center gap-3 p-4 bg-white border-2 border-emerald-100 hover:border-emerald-600 rounded-xl group transition-colors text-left">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
          {copied ? <CheckCircle size={20} /> : <LinkIcon size={20} />}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{copied ? "คัดลอกลิงก์แล้ว!" : "สร้างลิงก์ชำระเงิน"}</p>
          <p className="text-xs text-slate-500">ส่งให้ลูกค้าจองด้วยตนเอง</p>
        </div>
      </button>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Links ที่เกี่ยวข้อง</h3>
        <a href="/sale/tours" className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
          <Search size={16} /> ไปหน้าค้นหาทัวร์ (เช็คที่นั่ง)
        </a>
      </div>
    </div>
  );
}
