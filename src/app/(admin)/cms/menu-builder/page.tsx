'use client';

export default function MenuBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Menu Builder</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการเมนูเว็บไซต์ — Mega Menu, Footer, Navigation</p>
      </div>

      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">Menu Builder อยู่ระหว่างพัฒนา</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          เครื่องมือสร้างเมนูแบบ Drag &amp; Drop สำหรับจัดการ Mega Menu และ Navigation ของเว็บไซต์
        </p>
        <p className="text-xs text-slate-400">เมนูปัจจุบันใช้ config file: <code className="bg-slate-100 px-2 py-0.5 rounded">src/config/megaMenu.ts</code></p>
      </div>
    </div>
  );
}
