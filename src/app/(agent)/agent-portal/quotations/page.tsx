'use client';
import React, { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// Mock APIs
// ----------------------------------------------------------------------
async function getAgentQuotations() {
  await new Promise(r => setTimeout(r, 600)); 
  return [
    {
      id: 'QT-202605-012',
      date: '2026-05-04',
      customer: 'บริษัท เจริญผล กรุ๊ป',
      tour: 'ไต้หวัน ไทเป จิ่วเฟิ่น ทะเลสาบสุริยันจันทรา (VZ)',
      pax: 15, // Group quote
      quotedAmount: 283500, // 18900 * 15
      status: 'ACCEPTED',
      validUntil: '2026-05-10',
    },
    {
      id: 'QT-202605-011',
      date: '2026-05-02',
      customer: 'ครอบครัว รักธรรม',
      tour: 'ญี่ปุ่น โตเกียว ฟูจิ (TG)',
      pax: 5,
      quotedAmount: 225000, 
      status: 'SENT',
      validUntil: '2026-05-09',
    },
    {
      id: 'QT-202604-088',
      date: '2026-04-20',
      customer: 'คุณวิมล สุขใจ',
      tour: 'เกาหลี โซล นามิ (XJ)',
      pax: 2,
      quotedAmount: 33800, 
      status: 'EXPIRED',
      validUntil: '2026-04-27',
    },
    {
      id: 'QT-202604-050',
      date: '2026-04-10',
      customer: 'คุณสมเกียรติ',
      tour: 'ยุโรปตะวันออก เช็ก ออสเตรีย ฮังการี',
      pax: 4,
      quotedAmount: 320000, 
      status: 'BOOKED', // Converted
      validUntil: '2026-04-17',
    }
  ];
}

async function getAvailableTours() {
  return [
    { id: 'JP-OSA-5D3N', title: 'โอซาก้า เกียวโต ทาคายาม่า (XJ)', basePrice: 35900, netPrice: 32310 },
    { id: 'EU-EAST-8D6N', title: 'ยุโรปตะวันออก เช็ก ออสเตรีย (QR)', basePrice: 75000, netPrice: 66000 },
    { id: 'TW-TPE-4D3N', title: 'ไต้หวัน ไทเป จิ่วเฟิ่น (VZ)', basePrice: 18900, netPrice: 17010 },
  ];
}

export default function AgentQuotationsPage() {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Form State
  const [selectedTour, setSelectedTour] = useState('');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [pax, setPax] = useState(1);
  const [markupPerPax, setMarkupPerPax] = useState(0); // Agent can add extra margin

  useEffect(() => {
    Promise.all([getAgentQuotations(), getAvailableTours()]).then(([quotes, trs]) => {
      setQuotations(quotes);
      setTours(trs);
      setIsLoading(false);
    });
  }, []);

  const handleConvert = (id: string) => {
    alert(`ระบบกำลังเปลี่ยนใบเสนอราคา ${id} เป็นรายการจอง (Booking)...`);
    // In real app, redirect to checkout or call API
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'BOOKED' } : q));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour || !custName) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    
    setIsLoading(true);
    setTimeout(() => {
      const tourObj = tours.find(t => t.id === selectedTour);
      const newQuote = {
        id: `QT-202605-0${Math.floor(Math.random() * 100) + 20}`,
        date: new Date().toISOString(),
        customer: custName,
        tour: tourObj.title,
        pax: pax,
        quotedAmount: (tourObj.basePrice + markupPerPax) * pax,
        status: 'SENT',
        validUntil: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      };
      setQuotations([newQuote, ...quotations]);
      setView('LIST');
      setIsLoading(false);
      
      // Reset form
      setSelectedTour('');
      setCustName('');
      setPax(1);
      setMarkupPerPax(0);
      alert('สร้างและส่งใบเสนอราคาเรียบร้อยแล้ว');
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SENT': return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-200">ส่งแล้ว รอตัดสินใจ</span>;
      case 'ACCEPTED': return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-200">ลูกค้ายืนยันแล้ว</span>;
      case 'BOOKED': return <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">ทำรายการจองแล้ว</span>;
      case 'EXPIRED': return <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200">หมดอายุ</span>;
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
                <a href="/bookings" className="text-slate-400 hover:text-white transition-colors">การจองทั้งหมด</a>
                <a href="/quotations" className="text-white">ใบเสนอราคา</a>
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">ใบเสนอราคา (Quotations)</h1>
            <p className="text-slate-500 mt-1">สร้างเอกสารเสนอราคาลูกค้า พร้อมปรับบวกราคา/ส่วนลดด้วยตัวเอง</p>
          </div>
          <div className="flex gap-2">
            {view === 'LIST' ? (
              <button 
                onClick={() => setView('CREATE')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                สร้างใบเสนอราคาใหม่
              </button>
            ) : (
              <button 
                onClick={() => setView('LIST')}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
           <div className="flex flex-col items-center justify-center py-20">
             <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <p className="text-slate-500 font-bold">กำลังโหลดข้อมูล...</p>
           </div>
        )}

        {/* VIEW: CREATE FORM */}
        {!isLoading && view === 'CREATE' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-in-up max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">รายละเอียดใบเสนอราคา</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">เลือกแพ็กเกจทัวร์ <span className="text-red-500">*</span></label>
                  <select 
                    value={selectedTour}
                    onChange={(e) => setSelectedTour(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  >
                    <option value="">-- กรุณาเลือกทัวร์ --</option>
                    {tours.map(t => <option key={t.id} value={t.id}>{t.title} (ราคาขาย ฿{t.basePrice.toLocaleString()})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="เช่น คุณสมชาย รักไทย"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">อีเมลสำหรับส่งเอกสาร</label>
                  <input 
                    type="email" 
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนผู้เดินทาง (Pax)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={pax}
                    onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ปรับราคา / บวกเพิ่ม (ต่อท่าน)</label>
                  <input 
                    type="number" 
                    value={markupPerPax}
                    onChange={(e) => setMarkupPerPax(parseInt(e.target.value) || 0)}
                    placeholder="เช่น 500 (ใส่ค่าลบเพื่อลดราคา)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">ใช้ปรับราคาขายให้ลูกค้าจากราคามาตรฐานระบบ</p>
                </div>
              </div>

              {/* Price Calculation Preview */}
              {selectedTour && (
                <div className="bg-slate-900 rounded-2xl p-6 mt-8 text-white">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    สรุปยอดในใบเสนอราคา
                  </h3>
                  {(() => {
                    const tour = tours.find(t => t.id === selectedTour);
                    const finalPricePerPax = tour.basePrice + markupPerPax;
                    const totalFinal = finalPricePerPax * pax;
                    const totalNet = tour.netPrice * pax;
                    const estimatedProfit = totalFinal - totalNet;
                    
                    return (
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-400">
                          <span>ราคามาตรฐาน (Selling Price):</span>
                          <span>฿{tour.basePrice.toLocaleString()} x {pax}</span>
                        </div>
                        {markupPerPax !== 0 && (
                          <div className="flex justify-between text-amber-400">
                            <span>บวกเพิ่ม / ส่วนลด:</span>
                            <span>{markupPerPax > 0 ? '+' : ''}฿{markupPerPax.toLocaleString()} x {pax}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700 text-lg">
                          <span>ยอดรวมเสนอราคา (Quotation Total):</span>
                          <span>฿{totalFinal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 mt-2 bg-emerald-900/30 p-2 rounded-lg border border-emerald-800">
                          <span>✅ กำไรโดยประมาณของคุณ (Net Profit):</span>
                          <span className="font-bold">฿{estimatedProfit.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setView('LIST')} className="font-bold text-slate-500 hover:text-slate-800 px-6 py-3">ยกเลิก</button>
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  สร้างใบเสนอราคา
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW: LIST */}
        {!isLoading && view === 'LIST' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Quotation No. / Date</th>
                    <th className="px-6 py-4">ลูกค้า / แพ็กเกจ</th>
                    <th className="px-6 py-4 text-right">ยอดเงินรวม</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                      
                      <td className="px-6 py-5 align-top">
                        <div className="font-black text-slate-900">{q.id}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(q.date).toLocaleDateString('th-TH')}</div>
                      </td>
                      
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-slate-900 mb-1">{q.customer} <span className="text-slate-500 font-normal">({q.pax} ท่าน)</span></div>
                        <div className="text-xs text-slate-600 truncate max-w-[250px]">{q.tour}</div>
                      </td>

                      <td className="px-6 py-5 align-top text-right">
                        <div className="font-black text-slate-900">฿{q.quotedAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-1">หมดอายุ: {new Date(q.validUntil).toLocaleDateString('th-TH')}</div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        {getStatusBadge(q.status)}
                      </td>

                      <td className="px-6 py-5 align-top text-center">
                        <div className="flex flex-col gap-2 items-center">
                          {q.status !== 'BOOKED' && q.status !== 'EXPIRED' && (
                            <button 
                              onClick={() => handleConvert(q.id)}
                              className="w-full text-center text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              เปลี่ยนเป็นการจอง
                            </button>
                          )}
                          <button className="w-full text-center text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm1-4c-1.1 0-2-.9-2-2V7h2v4c0 .55.45 1 1 1s1-.45 1-1V7h2v4c0 2.21-1.79 4-4 4z"/></svg>
                            โหลด PDF
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {quotations.length === 0 && (
                <div className="text-center py-20 text-slate-500">ไม่พบข้อมูลใบเสนอราคา</div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
