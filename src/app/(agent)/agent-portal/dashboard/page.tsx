'use client';
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// Mock API: Agent Dashboard Data
// ----------------------------------------------------------------------
async function getAgentDashboardData() {
  await new Promise(r => setTimeout(r, 800)); // Simulate loading
  return {
    agent: {
      name: 'บริษัท ทราเวลเอ็กซ์เพิร์ท จำกัด',
      code: 'AG-88990',
      tier: 'Gold Partner',
      commissionRate: '10%'
    },
    stats: {
      totalBookings: 142,
      activePax: 425,
      commissionYTD: 245000,
      creditLimit: 500000,
      creditUsed: 120000
    },
    announcements: [
      { id: 1, type: 'urgent', title: 'อัปเดต: เปลี่ยนแปลงนโยบายขอวีซ่าเชงเก้น (เริ่ม 1 มิ.ย.)', date: '2026-05-04' },
      { id: 2, type: 'promo', title: 'แคมเปญพิเศษ! รับค่าคอมมิชชันเพิ่ม 2% สำหรับรูทญี่ปุ่นตลอดเดือนพฤษภาคม', date: '2026-05-01' }
    ],
    recentBookings: [
      { id: 'JT-202605-001', tour: 'ญี่ปุ่น โอซาก้า (JP-OSA-5D3N)', pax: 4, amount: 120000, commission: 12000, status: 'CONFIRMED', date: '2026-05-03' },
      { id: 'JT-202605-002', tour: 'เกาหลี โซล (KR-SEL-4D2N)', pax: 2, amount: 35000, commission: 3500, status: 'COMPLETED', date: '2026-05-01' },
      { id: 'JT-202604-099', tour: 'ยุโรปตะวันออก (EU-EAST-8D6N)', pax: 6, amount: 450000, commission: 45000, status: 'PENDING_DOCS', date: '2026-04-28' },
    ],
    pendingPayments: [
      { id: 'JT-202605-008', tour: 'ไต้หวัน ไทเป (TW-TPE-4D3N)', pax: 3, type: 'DEPOSIT', amountDue: 15000, dueDate: '2026-05-06' },
      { id: 'JT-202604-055', tour: 'สิงคโปร์ (SG-SIN-3D2N)', pax: 2, type: 'FULL_BALANCE', amountDue: 24000, dueDate: '2026-05-07' },
    ]
  };
}

export default function AgentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAgentDashboardData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center">
           <div className="text-xl font-black text-white tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal">AGENT</span></div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-slate-500 font-medium">กำลังโหลดแดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  const creditAvailable = data.stats.creditLimit - data.stats.creditUsed;
  const creditPercent = (data.stats.creditUsed / data.stats.creditLimit) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <a href="/dashboard" className="text-2xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></a>
              <nav className="hidden md:flex gap-6 text-sm font-bold">
                <a href="/dashboard" className="text-white">หน้าหลัก</a>
                <a href="/bookings" className="text-slate-400 hover:text-white transition-colors">การจองทั้งหมด</a>
                <a href="/payments" className="text-slate-400 hover:text-white transition-colors">การเงิน & คอมมิชชัน</a>
                <a href="/search" className="text-slate-400 hover:text-white transition-colors">ค้นหาทัวร์</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-tight">{data.agent.name}</div>
                <div className="text-xs text-orange-400 font-bold">{data.agent.tier} (คอมมิชชัน {data.agent.commissionRate})</div>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold text-slate-300">
                AG
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Row 1: Announcements & Quick Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">ประกาศสำคัญจากระบบ (Announcements)</h2>
            <div className="space-y-3">
              {data.announcements.map((ann: any) => (
                <div key={ann.id} className={`p-4 rounded-2xl border flex items-start gap-4 ${ann.type === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className={`mt-0.5 ${ann.type === 'urgent' ? 'text-red-500' : 'text-blue-500'}`}>
                    {ann.type === 'urgent' ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{ann.title}</div>
                    <div className="text-xs text-slate-500 mt-1">ประกาศเมื่อ: {new Date(ann.date).toLocaleDateString('th-TH')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-900 mb-4">ค้นหาทัวร์ด่วน (Quick Search)</h2>
            <div className="relative mb-3">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="รหัสทัวร์, ประเทศ, เมือง..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
              ค้นหาทัวร์ / เช็กที่นั่ง
            </button>
          </div>

        </div>

        {/* Row 2: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">+12%</span>
            </div>
            <div className="text-sm text-slate-500 font-medium">ยอดจองทั้งหมด (Bookings)</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{data.stats.totalBookings}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
            </div>
            <div className="text-sm text-slate-500 font-medium">จำนวนลูกทัวร์ (Pax)</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{data.stats.activePax}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="text-sm text-slate-500 font-medium">คอมมิชชันสะสมปีนี้ (THB)</div>
            <div className="text-3xl font-black text-slate-900 mt-1">฿{data.stats.commissionYTD.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="text-sm text-slate-500 font-medium mb-1">วงเงินเครดิต (Credit Limit)</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-black text-slate-900">฿{creditAvailable.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mb-1">/ ฿{data.stats.creditLimit.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={creditPercent > 80 ? 'text-red-500' : 'text-slate-600'}>ใช้ไปแล้ว {Math.round(creditPercent)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${creditPercent > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${creditPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Pending Payments */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                รอชำระเงิน (Pending Payments)
              </h3>
              <a href="/payments" className="text-sm font-bold text-orange-600 hover:text-orange-700">ดูทั้งหมด</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Booking No.</th>
                    <th className="px-6 py-4">ประเภท/วันกำหนด</th>
                    <th className="px-6 py-4 text-right">ยอดชำระสุทธิ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.pendingPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.id}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{p.tour}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-xs font-bold px-2 py-1 rounded-md inline-block mb-1 ${p.type === 'DEPOSIT' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {p.type === 'DEPOSIT' ? 'จ่ายมัดจำ' : 'จ่ายยอดเต็ม'}
                        </div>
                        <div className="text-xs text-red-500 font-bold">Due: {new Date(p.dueDate).toLocaleDateString('th-TH')}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-slate-900">฿{p.amountDue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a href={`/payment/${p.id}`} className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                          ชำระเงิน
                        </a>
                      </td>
                    </tr>
                  ))}
                  {data.pendingPayments.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-500">ไม่มีรายการรอชำระ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">รายการจองล่าสุด (Recent Bookings)</h3>
              <a href="/bookings" className="text-sm font-bold text-orange-600 hover:text-orange-700">ดูทั้งหมด</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Booking / สถานะ</th>
                    <th className="px-6 py-4">แพ็กเกจ / ผู้เดินทาง</th>
                    <th className="px-6 py-4 text-right">คอมมิชชัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentBookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 mb-1">{b.id}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'PENDING_DOCS' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{b.tour}</div>
                        <div className="text-xs text-slate-500 mt-1">{b.pax} ท่าน • ทำรายการ: {new Date(b.date).toLocaleDateString('th-TH')}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-emerald-600">฿{b.commission.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
