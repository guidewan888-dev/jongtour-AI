"use client";

import { useState, useEffect } from 'react';
import { Eye, FileText, Check, X, AlertCircle, RefreshCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
);

export default function HumanReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tours')
        .select('id, tourName, tourCode, supplierId, createdAt')
        .eq('status', 'DRAFT')
        .order('createdAt', { ascending: false });

      if (data) {
        const mappedQueue = data.map(t => ({
          id: t.id,
          title: t.tourName,
          file: t.tourCode,
          supplier: t.supplierId,
          conf: 100,
          extracted: {
            priceAdult: 0,
            priceChild: 0,
            departureDate: "-",
            lowConfidenceFields: []
          }
        }));
        setQueue(mappedQueue);
        if (mappedQueue.length > 0) setActiveItem(mappedQueue[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!activeItem) return;
    try {
      await supabase.from('tours').update({ status: 'PUBLISHED' }).eq('id', activeItem.id);
      window.alert(`Approved data for ${activeItem.title} and saved to database.`);
      fetchDrafts();
    } catch (e) {
      window.alert("Error approving.");
    }
  };

  const handleReject = async () => {
    if (!activeItem) return;
    try {
      await supabase.from('tours').update({ status: 'ARCHIVED' }).eq('id', activeItem.id);
      window.alert(`Rejected data for ${activeItem.title}.`);
      fetchDrafts();
    } catch (e) {
      window.alert("Error rejecting.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 font-sans">Human Review Queue (Drafts)</h1>
          <p className="text-slate-500 text-xs font-sans">รายการทัวร์ที่มีสถานะ DRAFT รอการตรวจสอบก่อนนำขึ้นเว็บจริง</p>
        </div>
        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold font-mono">
          <AlertCircle size={14} /> {queue.length} Items Pending
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left: Queue List */}
        <div className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 font-mono">PENDING QUEUE</span>
            <button onClick={fetchDrafts} className="text-slate-400 hover:text-white"><RefreshCcw size={12} className={loading ? "animate-spin" : ""}/></button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
            ) : queue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No items in queue.</div>
            ) : (
              queue.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${activeItem?.id === item.id ? 'bg-slate-900 border-l-2 border-l-emerald-500' : 'hover:bg-slate-900/50'}`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300 font-sans line-clamp-1">{item.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Code: {item.file} | Supplier: {item.supplier}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Review Tool */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-black flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 font-mono">DATA REVIEW</span>
            {activeItem && (
              <div className="flex gap-2">
                <button onClick={handleReject} className="text-rose-400 hover:bg-rose-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono transition-colors">
                  <X size={12}/> REJECT
                </button>
                <button onClick={handleApprove} className="text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 font-mono transition-colors">
                  <Check size={12}/> APPROVE & PUBLISH
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex min-h-0">
            {activeItem ? (
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 mb-1">Tour Name (TH)</label>
                    <input type="text" defaultValue={activeItem.title} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" disabled />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Tour Code</label>
                    <input type="text" defaultValue={activeItem.file} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" disabled />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Supplier</label>
                    <input type="text" defaultValue={activeItem.supplier} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-emerald-400 outline-none" disabled />
                  </div>
                  <div className="bg-slate-900 p-4 rounded border border-slate-800 text-slate-400 mt-6">
                    This tour was synced from API but flagged as DRAFT. Please verify its details on the main dashboard before publishing.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 flex-col">
                <Check size={48} className="mb-4 opacity-50" />
                <p>All queue items reviewed!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
