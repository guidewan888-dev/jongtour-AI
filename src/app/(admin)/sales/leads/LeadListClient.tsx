'use client';
import React, { useState } from 'react';

export default function LeadListClient({ initialLeads }: { initialLeads: any[] }) {
  const [leads] = useState<any[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const filteredLeads = leads.filter(lead => {
    const matchSearch = lead.name.includes(search) || lead.id.includes(search) || lead.phone.includes(search);
    const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-black border border-red-200 shadow-sm">🔥 {score} (HOT)</span>;
    if (score >= 50) return <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-[10px] font-bold border border-orange-200">⭐ {score} (WARM)</span>;
    return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold border border-blue-200">❄️ {score} (COLD)</span>;
  };

  const getSourceBadge = (source: string) => {
    switch(source) {
      case 'LINE OA': return <span className="bg-[#00B900]/10 text-[#00B900] px-2 py-1 rounded-md text-[10px] font-bold border border-[#00B900]/20 flex items-center gap-1 w-fit"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.938 8.91 9.479 9.613.376.082.883.257.994.596.103.313.067.8.031 1.134l-.16 1.011c-.04.24-.183 1.185 1.042.668 1.226-.517 6.621-3.9 9.06-6.666 2.378-2.695 3.554-4.836 3.554-6.356z"/></svg> LINE OA</span>;
      case 'Facebook': return <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold border border-blue-200 flex items-center gap-1 w-fit"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook</span>;
      case 'Website Chat': return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 w-fit">Website Chat</span>;
      default: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold w-fit">{source}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">New Lead</span>;
      case 'CONTACTED': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Contacted</span>;
      case 'QUOTED': return <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Quoted</span>;
      case 'WON': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Won</span>;
      case 'LOST': return <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Lost</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">รายการรายชื่อผู้ติดต่อ (Lead Pipeline)</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการรายชื่อลูกค้ามุ่งหวัง วิเคราะห์ความสนใจ และติดตามสถานะการขาย</p>
        </div>
        <a 
          href="/sales/leads/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          เพิ่ม Lead ใหม่
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 animate-fade-in-up">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, เบอร์โทร, รหัส Lead..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="w-full md:w-48">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="NEW">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUOTED">Quoted</option>
            <option value="WON">Won (ปิดการขายแล้ว)</option>
            <option value="LOST">Lost (ไม่สนใจ)</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="ALL">ช่องทางทั้งหมด</option>
            <option value="LINE OA">LINE OA</option>
            <option value="Facebook">Facebook</option>
            <option value="Website Chat">Website Chat</option>
            <option value="Walk-in">Walk-in</option>
          </select>
        </div>
      </div>

      {/* Lead Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Lead / Contact</th>
                <th className="px-6 py-4">ความสนใจ (Interest)</th>
                <th className="px-6 py-4">ช่องทาง (Source)</th>
                <th className="px-6 py-4">Lead Score</th>
                <th className="px-6 py-4">สถานะ (Status)</th>
                <th className="px-6 py-4">ผู้รับผิดชอบ (Assigned To)</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  
                  <td className="px-6 py-4 align-middle">
                    <div className="font-bold text-slate-900 mb-0.5">{lead.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{lead.phone}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">{lead.id}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={lead.interest}>{lead.interest}</div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    {getSourceBadge(lead.source)}
                  </td>

                  <td className="px-6 py-4 align-middle">
                    {getScoreBadge(lead.score)}
                    <div className="text-[10px] text-slate-400 mt-1">{lead.lastActive}</div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    {getStatusBadge(lead.status)}
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.assignedTo.color}`}>
                        {lead.assignedTo.initials}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{lead.assignedTo.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      <a 
                        href={`/sales/leads/${lead.id}`}
                        className="text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        ดูรายละเอียด
                      </a>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-20 text-slate-500">ไม่พบรายชื่อผู้ติดต่อที่ตรงกับเงื่อนไข</div>
          )}
        </div>
      </div>
    </div>
  );
}
