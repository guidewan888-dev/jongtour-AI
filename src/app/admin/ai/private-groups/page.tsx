"use client";

import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle2, ChevronRight, Edit3 } from "lucide-react";

export default function PrivateGroupsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraft, setActiveDraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/admin/ai/private-group-drafts");
      const data = await res.json();
      if (data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleConvertToQuotation = async () => {
    if (!activeDraft) return;
    try {
      const res = await fetch(`/api/admin/ai/private-group-drafts/${activeDraft.id}/convert-quotation`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert("Converted successfully! Quotation URL: " + data.quotationUrl);
        fetchDrafts();
        setActiveDraft(null); // Close detail view
      }
    } catch (err) {
      console.error(err);
      alert("Failed to convert");
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Drafts...</div>;

  return (
    <div className="flex h-full">
      {/* List Area */}
      <div className={`w-full ${activeDraft ? 'hidden md:block md:w-1/3' : 'md:w-1/2 max-w-4xl mx-auto'} bg-white border-r border-gray-100 flex flex-col h-full transition-all`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              Private Group Drafts
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review AI-estimated custom tours</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {drafts.length === 0 ? (
             <div className="text-center p-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
               No pending private group drafts.
             </div>
          ) : (
            drafts.map(draft => (
              <div 
                key={draft.id} 
                onClick={() => setActiveDraft(draft)}
                className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all ${activeDraft?.id === draft.id ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900">{draft.destination} ({draft.durationDays} Days)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${draft.status === 'QUOTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {draft.status}
                  </span>
                </div>
                <div className="flex justify-between items-end text-sm">
                  <span className="text-gray-500">Pax: {draft.pax}</span>
                  <span className="font-bold text-orange-600">Est. ฿{draft.estimatedPrice.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Area */}
      {activeDraft && (
        <div className="flex-1 bg-gray-50 flex flex-col h-full border-l border-gray-200 shadow-2xl z-10 overflow-y-auto">
          <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0">
            <div>
              <h2 className="text-xl font-black text-gray-900">Draft Details</h2>
              <p className="text-xs text-gray-500">Customer ID: {activeDraft.customerId}</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setActiveDraft(null)} className="md:hidden px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600">Close</button>
               {activeDraft.status !== "QUOTED" && (
                 <button onClick={handleConvertToQuotation} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-500/30 transition-colors">
                   <CheckCircle2 className="w-4 h-4" /> Convert to Quotation
                 </button>
               )}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Cost Breakdown (AI Estimate)</h3>
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <span className="text-gray-600">Flight/Pax</span>
                   <span className="font-bold">฿{(activeDraft.costBreakdown?.flight || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <span className="text-gray-600">Hotel/Pax</span>
                   <span className="font-bold">฿{(activeDraft.costBreakdown?.hotel || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <span className="text-gray-600">Guide & Transport/Pax</span>
                   <span className="font-bold">฿{(activeDraft.costBreakdown?.guide || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <span className="text-gray-600">Margin ({activeDraft.costBreakdown?.marginPercent || 15}%)</span>
                   <span className="font-bold text-emerald-600">฿{(activeDraft.costBreakdown?.marginValue || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-lg pt-2">
                   <span className="font-black text-gray-900">Total Est. Price/Pax</span>
                   <span className="font-black text-orange-600">฿{activeDraft.estimatedPrice.toLocaleString()}</span>
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Proposed Itinerary</h3>
               <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-xl">
                 {JSON.stringify(activeDraft.aiItinerary, null, 2)}
               </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
               <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2"><Edit3 className="w-4 h-4"/> AI Assumptions</h3>
               <p className="text-sm text-orange-700">{activeDraft.assumptions || "None specified"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
