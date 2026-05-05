'use client';
import React, { useState } from 'react';

const TABS = ['All Tours', 'Published', 'Need Review', 'Drafts', 'Sync Errors'];

export default function AdminToursClient({ initialData }: { initialData: any }) {
  const [data] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState('All Tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider">PUBLISHED</span>;
    if (status === 'NEED_REVIEW') return <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider animate-pulse">NEED REVIEW</span>;
    if (status === 'DRAFT') return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider">DRAFT</span>;
    if (status === 'SYNC_ERROR') return <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded tracking-wider">SYNC ERROR</span>;
    return null;
  };

  const filteredData = data.filter((t: any) => {
    if (activeTab !== 'All Tours') {
      if (activeTab === 'Published' && t.status !== 'PUBLISHED') return false;
      if (activeTab === 'Need Review' && t.status !== 'NEED_REVIEW') return false;
      if (activeTab === 'Drafts' && t.status !== 'DRAFT') return false;
      if (activeTab === 'Sync Errors' && t.status !== 'SYNC_ERROR') return false;
    }
    if (supplierFilter && t.supplier !== supplierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    }
    return true;
  });

  const suppliersList: string[] = Array.from(new Set((data as any[]).map((t: any) => String(t.supplier))));

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tour Management</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการโปรแกรมทัวร์ ตรวจสอบข้อมูลโฮลเซล และเผยแพร่โปรแกรม</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/wholesale/sync"
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Manual Sync
          </a>
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
          </button>
        ))}
      </div>

      {/* Action Bar (Search & Filters) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Code, Name, Destination..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex gap-2">
            <select 
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="">All Suppliers</option>
              {suppliersList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tour Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-5 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                </th>
                <th className="px-5 py-4 min-w-[300px]">Tour Information</th>
                <th className="px-5 py-4 text-center">Duration</th>
                <th className="px-5 py-4">Supplier</th>
                <th className="px-5 py-4 text-right">Base Price (THB)</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Last Sync</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <img src={t.image} alt={t.code} className="w-16 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{t.code}</span>
                          {!t.isAiReviewed && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1" title="Needs AI content review">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              AI Review
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 leading-tight max-w-sm line-clamp-2">{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-black text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">{t.duration}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-800">{t.supplier}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="font-black text-emerald-600 text-lg">{(t.price).toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs font-medium text-slate-500 whitespace-nowrap">{t.lastSync}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`/tours/${t.id}`} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Edit Tour">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p className="font-bold">No tours found for the selected filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
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
