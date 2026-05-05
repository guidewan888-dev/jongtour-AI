'use client';
import React, { useState } from 'react';

const TABS = ['All Transactions', 'Pending', 'Verified', 'Rejected', 'Refunded'];

export default function AdminPaymentClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handleAction = async (action: 'VERIFY' | 'REJECT' | 'REFUND') => {
    setIsProcessing(true);
    try {
      // TODO: Call real API endpoint for payment action
      // await fetch(`/api/admin/payments/${selectedTxn.id}/action`, { method: 'POST', body: JSON.stringify({ action }) });
      
      // Optimistic update
      const updatedTxns = data.transactions.map((t:any) => {
        if (t.id === selectedTxn.id) {
          return { ...t, status: action === 'VERIFY' ? 'VERIFIED' : action === 'REJECT' ? 'REJECTED' : 'REFUNDED' };
        }
        return t;
      });
      setData({ ...data, transactions: updatedTxns });
      setSelectedTxn(null);
      setActionMessage(`✅ สถานะถูกเปลี่ยนเป็น ${action} เรียบร้อย`);
      setTimeout(() => setActionMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-black tracking-wider animate-pulse">PENDING VERIFY</span>;
      case 'VERIFIED': return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black tracking-wider">VERIFIED</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-black tracking-wider">REJECTED</span>;
      case 'REFUNDED': return <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-black tracking-wider">REFUNDED</span>;
      default: return null;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return <span className="text-blue-600 font-bold text-xs flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Bank Transfer</span>;
      case 'PROMPTPAY': return <span className="text-indigo-600 font-bold text-xs flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> PromptPay</span>;
      case 'CREDIT_CARD': return <span className="text-slate-600 font-bold text-xs flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Credit Card</span>;
      default: return null;
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="w-10 h-10 text-orange-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลการเงิน...</p>
      </div>
    );
  }

  const filteredData = data.transactions.filter((t:any) => {
    if (activeTab !== 'All Transactions' && t.status !== activeTab.toUpperCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.id.toLowerCase().includes(q) || t.bookingRef.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 relative">

      {/* Success Message Toast */}
      {actionMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm animate-fade-in-up">
          {actionMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Management</h1>
          <p className="text-sm text-slate-500 mt-1">ตรวจสอบและยืนยันการชำระเงิน จัดการคืนเงิน</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
          <svg className="absolute right-0 bottom-0 w-24 h-24 text-white opacity-20 transform translate-x-4 translate-y-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-[10px] font-black uppercase tracking-wider mb-1 relative z-10">Pending Verifications</div>
          <div className="flex items-baseline gap-2 relative z-10">
            <div className="text-3xl font-black">{data.metrics.pendingVerifications}</div>
            <div className="text-sm font-medium opacity-90">({(data.metrics.pendingAmount).toLocaleString()} THB)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Today</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-emerald-600">{data.metrics.verifiedToday}</div>
            <div className="text-sm font-bold text-slate-500">({(data.metrics.verifiedAmount).toLocaleString()} THB)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Refunds Pending</div>
          <div className="text-3xl font-black text-purple-600">{data.metrics.refundsPending}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Gateway Health</div>
          <div className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational
          </div>
        </div>
      </div>

          {/* Status Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar gap-2 border-b border-slate-200 pb-px">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-orange-600 text-orange-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab}
                {tab === 'Pending' && <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">{data.metrics.pendingVerifications}</span>}
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative max-w-md w-full">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Transaction ID, Booking Ref, or Customer..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {/* Payment Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-5 py-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                    </th>
                    <th className="px-5 py-4">Transaction / Booking</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4 text-right">Amount (THB)</th>
                    <th className="px-5 py-4">Method & Bank</th>
                    <th className="px-5 py-4">Date/Time</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-black text-slate-600">{t.id}</div>
                        <a href={`/bookings/${t.bookingRef}`} className="text-orange-600 hover:text-orange-700 font-bold text-xs mt-0.5 inline-block">{t.bookingRef}</a>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {t.customer}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-900 text-base">
                        {(t.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        {getMethodBadge(t.method)}
                        {t.bank !== '-' && <div className="text-[10px] text-slate-400 font-medium mt-1">via {t.bank}</div>}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">
                        {t.date}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {t.status === 'PENDING' ? (
                          <button 
                            onClick={() => setSelectedTxn(t)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            Review Slip
                          </button>
                        ) : t.status === 'VERIFIED' ? (
                          <button 
                            onClick={() => setSelectedTxn(t)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Initiate Refund
                          </button>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="font-bold">No transactions found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
      </div>

      {/* Slip Verification Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedTxn(null)}></div>
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
            
            {/* Left: Slip Image */}
            <div className="md:w-1/2 bg-slate-100 p-6 flex flex-col items-center justify-center border-r border-slate-200">
              {selectedTxn.slipUrl ? (
                <div className="w-full max-w-sm rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white">
                  <div className="bg-slate-800 text-white text-center py-2 text-xs font-bold tracking-wider">ATTACHED SLIP</div>
                  <img src={selectedTxn.slipUrl} alt="Transfer Slip" className="w-full h-auto object-contain max-h-[60vh]" />
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="font-bold">No slip attached for this transaction.</p>
                </div>
              )}
            </div>

            {/* Right: Verification Details & Actions */}
            <div className="md:w-1/2 p-8 bg-white flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedTxn.status === 'PENDING' ? 'Verify Payment' : 'Refund Payment'}
                  </h2>
                  <div className="text-sm font-medium text-slate-500 mt-1">Transaction: <span className="font-mono text-slate-800">{selectedTxn.id}</span></div>
                </div>
                <button onClick={() => !isProcessing && setSelectedTxn(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-5 flex-1">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Declared Amount</div>
                  <div className="text-3xl font-black text-slate-900">{(selectedTxn.amount).toLocaleString()} <span className="text-lg text-slate-500">THB</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking Ref</div>
                    <div className="text-sm font-bold text-orange-600">{selectedTxn.bookingRef}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTxn.customer}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Method</div>
                    <div>{getMethodBadge(selectedTxn.method)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reported Time</div>
                    <div className="text-sm font-bold text-slate-900">{selectedTxn.date}</div>
                  </div>
                </div>
                
                {selectedTxn.status === 'PENDING' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Remarks (Optional)</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none h-20" placeholder="E.g. Verified matched with KBANK statement..."></textarea>
                  </div>
                )}

                {selectedTxn.status === 'VERIFIED' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Refund Reason (Required)</label>
                    <textarea className="w-full bg-white border border-amber-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none h-20" placeholder="Enter reason for refunding this verified transaction..."></textarea>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                {selectedTxn.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handleAction('REJECT')}
                      disabled={isProcessing}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl border border-red-200 transition-colors disabled:opacity-50"
                    >
                      Reject Slip
                    </button>
                    <button 
                      onClick={() => handleAction('VERIFY')}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Approve Payment</>
                      )}
                    </button>
                  </>
                ) : selectedTxn.status === 'VERIFIED' ? (
                  <>
                    <button onClick={() => !isProcessing && setSelectedTxn(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors">Cancel</button>
                    <button 
                      onClick={() => handleAction('REFUND')}
                      disabled={isProcessing}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Refund'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
