import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ค้นหา (404)',
  description: 'ไม่พบหน้าที่คุณค้นหา กรุณาตรวจสอบ URL หรือกลับหน้าหลัก',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-black text-slate-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">ไม่พบหน้าที่ค้นหา</h1>
        <p className="text-slate-500 mb-8">
          ขออภัย ไม่พบหน้าที่คุณกำลังมองหา ลิงก์อาจไม่ถูกต้องหรือหน้านี้อาจถูกลบไปแล้ว
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="/" 
            className="px-6 py-3 bg-[#F97316] text-white font-medium rounded-xl hover:bg-[#EA580C] transition-colors inline-block shadow-sm"
          >
            🏠 กลับหน้าหลัก
          </a>
          <a 
            href="/search" 
            className="px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors inline-block"
          >
            🔍 ค้นหาทัวร์
          </a>
        </div>
      </div>
    </div>
  );
}
