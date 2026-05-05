'use client';
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// Mock API: Agent Booking Detail
// ----------------------------------------------------------------------
async function getAgentBookingDetail(bookingNo: string) {
  await new Promise(r => setTimeout(r, 600)); // Simulate API delay
  
  const depDate = new Date();
  depDate.setDate(depDate.getDate() + 45); // 45 days from now

  return {
    bookingNo: bookingNo.toUpperCase(),
    status: 'CONFIRMED', // PENDING, CONFIRMED, COMPLETED, CANCELLED
    bookingDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    
    tour: {
      id: 'JP-OSA-5D3N',
      title: 'โอซาก้า เกียวโต ทาคายาม่า เที่ยวเต็มไม่มีวันอิสระ',
      dateStr: depDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) + ' - ' + new Date(depDate.getTime() + 4*24*60*60*1000).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
      supplier: 'Go365',
      airline: 'AirAsia X (XJ)',
    },

    customer: {
      name: 'คุณสมชาย รักไทย',
      phone: '081-234-5678',
      email: 'somchai@example.com',
      paxCount: 3,
      passengers: [
        { name: 'MR. SOMCHAI RAKTHAI', type: 'ผู้ใหญ่', docStatus: 'VERIFIED' },
        { name: 'MRS. SOMSRI RAKTHAI', type: 'ผู้ใหญ่', docStatus: 'VERIFIED' },
        { name: 'MSTR. SOMPONG RAKTHAI', type: 'เด็ก', docStatus: 'PENDING' }
      ]
    },

    financials: {
      sellingPriceTotal: 107700, // 35,900 x 3
      commissionRate: 10,
      commissionAmount: 10770,
      netPrice: 96930, // selling - commission
      amountPaid: 45000, // They paid deposit
      balanceDue: 51930,
      payoutStatus: 'PENDING_TRAVEL', // Commission payout status
    },

    documents: {
      voucherStatus: 'PREPARING', // PREPARING, READY
      invoiceId: `INV-${bookingNo.toUpperCase()}-02`,
      receiptId: `RE-${bookingNo.toUpperCase()}-01`
    },

    timeline: [
      { status: 'BOOKED', date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), desc: 'เอเจนต์สร้างรายการจอง' },
      { status: 'DEPOSIT_PAID', date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), desc: 'ชำระเงินมัดจำ (Net Price)' },
      { status: 'CONFIRMED', date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), desc: 'โฮลเซลล์ยืนยันที่นั่ง' },
      { status: 'BALANCE_DUE', date: null, desc: 'รอชำระยอดคงเหลือ' },
      { status: 'VOUCHER_READY', date: null, desc: 'เตรียมเอกสารเดินทาง' }
    ]
  };
}

export default function AgentBookingDetailPage({ params }: { params: { booking_no: string } }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAgentBookingDetail(params.booking_no).then(setData);
  }, [params.booking_no]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center">
           <div className="text-xl font-black text-white tracking-tighter">JONGTOUR <span className="text-orange-500 font-normal">AGENT</span></div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">รอการยืนยัน</span>;
      case 'CONFIRMED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">ยืนยันที่นั่งแล้ว</span>;
      case 'CANCELLED': return <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>;
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
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Actions */}
        <div className="mb-6">
          <a href="/bookings" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            กลับหน้ารายการจอง
          </a>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {data.bookingNo}
                {getStatusBadge(data.status)}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">สร้างรายการเมื่อ: {new Date(data.bookingDate).toLocaleString('th-TH')}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/invoice/${data.bookingNo}`} target="_blank" rel="noreferrer" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl shadow-sm text-sm flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                ดูใบเสร็จ / Invoice
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Tour Info */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="font-bold text-slate-900">ข้อมูลแพ็กเกจทัวร์</h2>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-orange-600 mb-1">{data.tour.id}</div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{data.tour.title}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200">
                    โฮลเซลล์: {data.tour.supplier}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">วันเดินทาง</div>
                    <div className="font-bold text-slate-900">{data.tour.dateStr}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">สายการบิน</div>
                    <div className="font-bold text-slate-900">{data.tour.airline}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Customer & Passengers Info */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <h2 className="font-bold text-slate-900">ข้อมูลลูกค้าและผู้เดินทาง ({data.customer.paxCount} ท่าน)</h2>
                </div>
                <button className="text-sm font-bold text-orange-600 hover:text-orange-700">แก้ไขข้อมูล</button>
              </div>
              
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">ผู้ติดต่อหลัก (Lead Customer)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">ชื่อ-นามสกุล</div>
                    <div className="font-bold text-slate-900">{data.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">เบอร์โทรศัพท์</div>
                    <div className="font-bold text-slate-900">{data.customer.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">อีเมล</div>
                    <div className="font-bold text-slate-900">{data.customer.email}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">รายชื่อผู้เดินทาง (Passenger List)</h3>
                  <a href={`/document-upload/${data.bookingNo}`} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200">
                    จัดการเอกสารวีซ่า/พาสปอร์ต
                  </a>
                </div>
                <div className="space-y-3">
                  {data.customer.passengers.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">{idx + 1}</div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.type}</div>
                        </div>
                      </div>
                      <div>
                        {p.docStatus === 'VERIFIED' ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            เอกสารครบ
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-[10px] font-bold border border-amber-200">
                            รอเอกสาร
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Financials & Timeline */}
          <div className="space-y-6">
            
            {/* 3. B2B Commission & Financials */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden text-white">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="font-bold">ข้อมูลการเงิน (B2B Financials)</h2>
              </div>
              <div className="p-6">
                
                <div className="bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">ราคาขายลูกค้า (Selling Price)</span>
                    <span className="text-sm font-bold text-slate-300">฿{data.financials.sellingPriceTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                    <span className="text-xs text-emerald-400 font-bold">คอมมิชชัน ({data.financials.commissionRate}%)</span>
                    <span className="text-sm font-bold text-emerald-400">- ฿{data.financials.commissionAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-white">ราคาเอเจนต์ (Net Price)</span>
                    <span className="text-2xl font-black text-white">฿{data.financials.netPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">ชำระแล้ว (มัดจำ)</span>
                    <span className="text-sm font-bold text-white">฿{data.financials.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-400 font-bold">ยอดคงเหลือที่ต้องชำระ</span>
                    <span className="text-lg font-black text-orange-400">฿{data.financials.balanceDue.toLocaleString()}</span>
                  </div>
                </div>

                {data.financials.balanceDue > 0 && (
                  <a href={`/agent/payment/${data.bookingNo}`} className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                    ชำระยอดคงเหลือ (Net)
                  </a>
                )}
              </div>
            </div>

            {/* 4. Voucher Status */}
            <div className={`rounded-3xl p-6 border flex items-center justify-between gap-4 shadow-sm ${data.documents.voucherStatus === 'READY' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${data.documents.voucherStatus === 'READY' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Voucher ใบนัดหมาย</h3>
                  <p className="text-[10px] text-slate-500">{data.documents.voucherStatus === 'READY' ? 'เอกสารพร้อมส่งให้ลูกค้า' : 'กำลังเตรียมเอกสาร (3 วันก่อนเดินทาง)'}</p>
                </div>
              </div>
              <button 
                disabled={data.documents.voucherStatus !== 'READY'}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${data.documents.voucherStatus === 'READY' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                ดาวน์โหลด
              </button>
            </div>

            {/* 5. Booking Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-6">ความคืบหน้า (Timeline)</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                {data.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white ${step.date ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      {step.date && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="pt-0.5">
                      <h4 className={`text-sm font-bold ${step.date ? 'text-slate-900' : 'text-slate-400'}`}>{step.desc}</h4>
                      {step.date && <p className="text-[10px] text-slate-500">{new Date(step.date).toLocaleString('th-TH')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
