'use client';
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// Mock API: Agent Bookings
// ----------------------------------------------------------------------
async function getAgentBookings() {
  await new Promise(r => setTimeout(r, 600)); // Simulate API delay
  return [
    {
      id: 'JT-202605-008',
      date: '2026-05-04',
      tour: 'ไต้หวัน ไทเป จิ่วเฟิ่น ทะเลสาบสุริยันจันทรา (VZ)',
      customer: 'คุณสมศักดิ์ รักไทย',
      pax: 3,
      netPrice: 48000,
      commission: 8700,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'UNPAID', // UNPAID, PARTIAL, PAID
      voucherStatus: 'NOT_READY',
      docsStatus: 'PENDING'
    },
    {
      id: 'JT-202605-001',
      date: '2026-05-03',
      tour: 'ญี่ปุ่น โอซาก้า เกียวโต ทาคายาม่า (XJ)',
      customer: 'บริษัท เอบีซี จำกัด',
      pax: 4,
      netPrice: 129240,
      commission: 14360,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      voucherStatus: 'READY',
      docsStatus: 'COMPLETE'
    },
    {
      id: 'JT-202604-099',
      date: '2026-04-28',
      tour: 'ยุโรปตะวันออก เช็ก ออสเตรีย ฮังการี สโลวาเกีย (QR)',
      customer: 'คุณวิจิตร เดินทาง',
      pax: 6,
      netPrice: 396000,
      commission: 54000,
      status: 'PENDING_DOCS',
      paymentStatus: 'PARTIAL', // Paid deposit
      voucherStatus: 'PREPARING',
      docsStatus: 'ACTION_REQUIRED' // Needs visa docs
    },
    {
      id: 'JT-202604-055',
      date: '2026-04-15',
      tour: 'สิงคโปร์ ยูนิเวอร์แซล มารีน่าเบย์ (SQ)',
      customer: 'คุณสมหญิง สุขใจ',
      pax: 2,
      netPrice: 38000,
      commission: 3800,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      voucherStatus: 'READY',
      docsStatus: 'COMPLETE'
    },
    {
      id: 'JT-202604-012',
      date: '2026-04-02',
      tour: 'เวียดนาม ดานัง ฮอยอัน บานาฮิลล์ (FD)',
      customer: 'คุณนรินทร์ ทดสอบ',
      pax: 2,
      netPrice: 22000,
      commission: 2000,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      voucherStatus: 'NOT_READY',
      docsStatus: 'N/A'
    }
  ];
}

export default function AgentBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    getAgentBookings().then(data => {
      setBookings(data);
      setIsLoading(false);
    });
  }, []);

  const tabs = [
    { id: 'ALL', label: 'ทั้งหมด' },
    { id: 'PENDING_PAYMENT', label: 'รอชำระเงิน' },
    { id: 'PENDING_DOCS', label: 'รอเอกสาร/วีซ่า' },
    { id: 'CONFIRMED', label: 'ยืนยันแล้ว (รอเดินทาง)' },
    { id: 'COMPLETED', label: 'เดินทางแล้ว' },
    { id: 'CANCELLED', label: 'ยกเลิก' }
  ];

  const filteredBookings = activeTab === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING_PAYMENT': return <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-red-200">รอชำระเงิน</span>;
      case 'PENDING_DOCS': return <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-amber-200">รอเอกสาร/วีซ่า</span>;
      case 'CONFIRMED': return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-200">ยืนยันแล้ว</span>;
      case 'COMPLETED': return <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200">เดินทางแล้ว</span>;
      case 'CANCELLED': return <span className="bg-slate-800 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">ยกเลิก</span>;
      default: return null;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch(status) {
      case 'UNPAID': return <span className="text-red-500 font-bold text-xs">ยังไม่ชำระ</span>;
      case 'PARTIAL': return <span className="text-amber-500 font-bold text-xs">มัดจำแล้ว</span>;
      case 'PAID': return <span className="text-emerald-500 font-bold text-xs">ชำระครบแล้ว</span>;
      case 'REFUNDED': return <span className="text-slate-500 font-bold text-xs">คืนเงินแล้ว</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <a href="/dashboard" className="text-2xl font-black tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal text-lg">AGENT</span></a>
              <nav className="hidden md:flex gap-6 text-sm font-bold">
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">หน้าหลัก</a>
                <a href="/bookings" className="text-white">การจองทั้งหมด</a>
                <a href="/payments" className="text-slate-400 hover:text-white transition-colors">การเงิน & คอมมิชชัน</a>
                <a href="/search" className="text-slate-400 hover:text-white transition-colors">ค้นหาทัวร์</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-tight">บริษัท ทราเวลเอ็กซ์เพิร์ท จำกัด</div>
                <div className="text-xs text-orange-400 font-bold">Gold Partner</div>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold text-slate-300">
                AG
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">การจองของฉัน (My Bookings)</h1>
            <p className="text-slate-500 mt-1">จัดการการจอง, ติดตามสถานะการชำระเงิน, โหลดใบเสร็จ และ Voucher</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหา Booking No..."
                className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 w-64 shadow-sm"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 hide-scrollbar pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.id === 'ALL' && <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">{bookings.length}</span>}
              {tab.id === 'PENDING_PAYMENT' && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px]">{bookings.filter(b=>b.status==='PENDING_PAYMENT').length}</span>}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-slate-500 font-bold">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">ไม่พบข้อมูลการจอง</h3>
              <p className="text-slate-500">คุณยังไม่มีการจองในสถานะนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">ข้อมูลการจอง</th>
                    <th className="px-6 py-4">แพ็กเกจทัวร์ & ลูกค้า</th>
                    <th className="px-6 py-4">สถานะ & การเงิน</th>
                    <th className="px-6 py-4 text-right">ยอด Net / คอมมิชชัน</th>
                    <th className="px-6 py-4 text-center">เอกสาร (Documents)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      
                      {/* Booking Info */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-black text-slate-900 mb-1">{b.id}</div>
                        <div className="text-xs text-slate-500">จองเมื่อ: {new Date(b.date).toLocaleDateString('th-TH')}</div>
                        <div className="mt-2">{getStatusBadge(b.status)}</div>
                      </td>
                      
                      {/* Tour & Customer */}
                      <td className="px-6 py-5 align-top max-w-[280px]">
                        <div className="font-bold text-slate-900 truncate mb-1" title={b.tour}>{b.tour}</div>
                        <div className="text-xs text-slate-600 mb-2">ลูกค้า: {b.customer} ({b.pax} ท่าน)</div>
                        {b.docsStatus === 'ACTION_REQUIRED' && (
                          <a href={`/document-upload/${b.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-200 hover:bg-red-100 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ต้องอัปโหลดวีซ่า/พาสปอร์ต
                          </a>
                        )}
                        {b.docsStatus === 'PENDING' && (
                          <a href={`/document-upload/${b.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors">
                            ส่งเอกสารลูกค้า
                          </a>
                        )}
                      </td>

                      {/* Status & Payment */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">ชำระเงิน:</span>
                          {getPaymentBadge(b.paymentStatus)}
                        </div>
                        {b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED' && (
                          <a href={`/payment/${b.id}`} className="inline-block text-[10px] font-bold text-orange-600 hover:text-orange-700 underline mt-1">
                            {b.paymentStatus === 'PARTIAL' ? 'ชำระยอดคงเหลือ' : 'แจ้งชำระเงิน'}
                          </a>
                        )}
                      </td>

                      {/* Financials */}
                      <td className="px-6 py-5 align-top text-right">
                        <div className="text-sm font-black text-slate-900 mb-1">฿{b.netPrice.toLocaleString()}</div>
                        <div className="text-xs font-bold text-emerald-600">คอมฯ: +฿{b.commission.toLocaleString()}</div>
                      </td>

                      {/* Documents / Actions */}
                      <td className="px-6 py-5 align-top text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <a href={`/invoice/${b.id}`} target="_blank" rel="noreferrer" className="w-full text-center text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Invoice / ใบเสร็จ
                          </a>
                          
                          {b.voucherStatus === 'READY' ? (
                            <button className="w-full text-center text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              โหลด Voucher
                            </button>
                          ) : b.status !== 'CANCELLED' ? (
                            <span className="text-[10px] text-slate-400 mt-1">Voucher กำลังเตรียม</span>
                          ) : null}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
