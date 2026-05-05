'use client';
import React, { useState } from 'react';

const TABS = ['All Bookings', 'Pending Review', 'Waiting Wholesale', 'Payment Pending', 'Confirmed', 'Cancelled'];

export default function AdminBookingsClient({ initialData }: { initialData: any }) {
  const [data] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState('All Bookings');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string, type: 'booking' | 'payment' | 'wholesale') => {
    let color = 'bg-slate-100 text-slate-600';
    
    if (type === 'booking') {
      if (status === 'CONFIRMED') color = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (status === 'WAITING_WHOLESALE') color = 'bg-purple-100 text-purple-700 border-purple-200';
      if (status === 'PAYMENT_PENDING') color = 'bg-orange-100 text-orange-700 border-orange-200';
      if (status === 'CANCELLED') color = 'bg-slate-100 text-slate-500 border-slate-200';
      if (status === 'AI_REVIEW') color = 'bg-red-100 text-red-700 border-red-200 font-black';
      if (status === 'PENDING_DOCS') color = 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (type === 'payment') {
      if (status === 'PAID') color = 'bg-emerald-50 text-emerald-600';
      if (status === 'PARTIAL') color = 'bg-blue-50 text-blue-600';
      if (status === 'UNPAID') color = 'bg-red-50 text-red-600';
      if (status === 'REFUNDED') color = 'bg-slate-50 text-slate-500 line-through';
    } else if (type === 'wholesale') {
      if (status === 'CONFIRMED') color = 'text-emerald-600 font-bold';
      if (status === 'PENDING') color = 'text-amber-500 font-bold';
      if (status === 'SYNC_ERROR') color = 'text-red-600 font-black animate-pulse';
      if (status === 'CANCELLED') color = 'text-slate-400';
    }

    if (type === 'wholesale') {
      return <span className={`text-[10px] ${color}`}>{status.replace('_', ' ')}</span>;
    }

    return (
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shadow-sm tracking-wider uppercase ${color}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredData = data.filter((b: any) => {
    if (activeTab !== 'All Bookings') {
      if (activeTab === 'Pending Review' && !['AI_REVIEW', 'PENDING_DOCS'].includes(b.bookingStatus)) return false;
      if (activeTab === 'Waiting Wholesale' && b.bookingStatus !== 'WAITING_WHOLESALE') return false;
      if (activeTab === 'Payment Pending' && b.bookingStatus !== 'PAYMENT_PENDING') return false;
      if (activeTab === 'Confirmed' && b.bookingStatus !== 'CONFIRMED') return false;
      if (activeTab === 'Cancelled' && b.bookingStatus !== 'CANCELLED') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.tour.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Center</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการรายการจอง ตรวจสอบสถานะ และประสานงานโฮลเซล</p>
        </div>
        <a 
          href="/manual-booking"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Booking
        </a>
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
          </button>
        ))}
      </div>

      {/* Action Bar (Search & Filters) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Booking ID, Customer, Tour..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Departure Date
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Supplier
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3 border-t xl:border-t-0 xl:border-l border-slate-200 pt-4 xl:pt-0 xl:pl-4">
          <button 
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
          <a 
            href="/wholesale/sync"
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Force Sync
          </a>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-5 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                </th>
                <th className="px-5 py-4">Booking No</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4 min-w-[180px]">Tour Package</th>
                <th className="px-5 py-4">Supplier / Dep.</th>
                <th className="px-5 py-4 text-center">Pax</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Financial</th>
                <th className="px-5 py-4 text-right">Amount (THB)</th>
                <th className="px-5 py-4 text-center">Staff</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                  </td>
                  <td className="px-5 py-4">
                    <a href={`/bookings/${b.id}`} className="font-bold text-slate-900 hover:text-blue-600 hover:underline">{b.id}</a>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 mb-1">{b.customer}</div>
                    {b.isAgent && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide">B2B AGENT</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-700 truncate max-w-[200px]" title={b.tour}>{b.tour}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs font-bold text-slate-800 mb-1">{b.supplier}</div>
                    <div className="text-[10px] text-slate-500">{b.departure}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded">{b.pax}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="mb-1">{getStatusBadge(b.bookingStatus, 'booking')}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      {getStatusBadge(b.wholesaleStatus, 'wholesale')}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(b.paymentStatus, 'payment')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="font-black text-slate-900">{(b.amount).toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[9px] font-black shadow-sm border border-slate-200 ${b.staff === 'AUTO' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`} title={b.staff === 'AUTO' ? 'AI Bot' : 'Staff'}>
                      {b.staff}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <a href={`/bookings/${b.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  </td>
                </tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-16 text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-bold">No bookings found for the selected filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
            <div>Showing 1 to {filteredData.length} of {data.length} entries</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white transition-colors disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
