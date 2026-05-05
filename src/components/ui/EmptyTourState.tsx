import React from 'react';

interface EmptyTourStateProps {
  title?: string;
  message?: string;
}

export default function EmptyTourState({ 
  title = "ยังไม่พบโปรแกรมทัวร์จริงในหมวดนี้", 
  message = "ขณะนี้ระบบกำลังอัปเดตข้อมูลทัวร์จากระบบ Wholesale โปรดกลับมาตรวจสอบอีกครั้ง หรือให้ AI ของเราช่วยแนะนำทัวร์ที่เหมาะสม" 
}: EmptyTourStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-8">{message}</p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <a 
          href="/ai-search" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
          ให้ AI ช่วยหาโปรแกรมใกล้เคียง
        </a>
        
        <button 
          onClick={() => {
            // Trigger background sync or notify admin
            alert('กำลังส่งคำขอ Sync ข้อมูล Wholesale ล่าสุด...');
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Sync ข้อมูล
        </button>
        
        <a 
          href="/contact" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          ติดต่อเจ้าหน้าที่
        </a>
      </div>
    </div>
  );
}
