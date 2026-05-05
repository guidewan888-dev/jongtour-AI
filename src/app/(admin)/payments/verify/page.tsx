"use client";
import React, { useState } from "react";
import { CheckCircle, XCircle, Eye, Clock, CreditCard, Search } from "lucide-react";

const mockSlips = [
  { id: "1", ref: "PAY-MQ1A-7821", booking: "BK-2569050001", customer: "Somchai J.", amount: 35900, method: "BANK_TRANSFER", slipUrl: "/slip1.jpg", uploadedAt: "5 นาที", status: "UPLOADED" },
  { id: "2", ref: "PAY-NR2B-3456", booking: "BK-2569050002", customer: "Wipawan S.", amount: 45900, method: "PROMPT_PAY", slipUrl: "/slip2.jpg", uploadedAt: "20 นาที", status: "UPLOADED" },
  { id: "3", ref: "PAY-KS3C-9012", booking: "BK-2569050003", customer: "John D.", amount: 129000, method: "BANK_TRANSFER", slipUrl: "/slip3.jpg", uploadedAt: "1 ชม.", status: "VERIFIED" },
  { id: "4", ref: "PAY-LP4D-5678", booking: "BK-2569050004", customer: "สมศักดิ์ ก.", amount: 18900, method: "PROMPT_PAY", slipUrl: "/slip4.jpg", uploadedAt: "2 ชม.", status: "REJECTED" },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = { UPLOADED: "bg-amber-100 text-amber-700", VERIFIED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };
  return map[s] || "bg-slate-100 text-slate-600";
};

export default function SlipVerifyPage() {
  const [slips, setSlips] = useState(mockSlips);
  const pending = slips.filter(s => s.status === "UPLOADED").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📋 Slip Verification</h1>
          <p className="text-sm text-slate-500 mt-1">{pending} สลิปรอตรวจสอบ</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="g-input pl-9 w-56" placeholder="ค้นหา Ref / ชื่อ..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-amber-700">{pending}</div>
          <div className="text-xs text-amber-600">รอตรวจสอบ</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-emerald-700">{slips.filter(s => s.status === "VERIFIED").length}</div>
          <div className="text-xs text-emerald-600">อนุมัติแล้ว</div>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-red-700">{slips.filter(s => s.status === "REJECTED").length}</div>
          <div className="text-xs text-red-600">ปฏิเสธ</div>
        </div>
      </div>

      <div className="space-y-3 stagger-children">
        {slips.map(slip => (
          <div key={slip.id} className="g-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {slip.method === "PROMPT_PAY" ? "📱" : "🏦"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{slip.ref}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(slip.status)}`}>
                  {slip.status === "UPLOADED" ? "⏳ รอตรวจ" : slip.status === "VERIFIED" ? "✅ อนุมัติ" : "❌ ปฏิเสธ"}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{slip.customer} · {slip.booking} · {slip.uploadedAt}ที่แล้ว</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-primary">฿{slip.amount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">{slip.method === "PROMPT_PAY" ? "PromptPay" : "โอนเงิน"}</div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="ดูสลิป">
                <Eye className="w-4 h-4 text-slate-500" />
              </button>
              {slip.status === "UPLOADED" && (
                <>
                  <button onClick={() => setSlips(p => p.map(s => s.id === slip.id ? { ...s, status: "VERIFIED" } : s))} className="p-2 rounded-lg hover:bg-emerald-100 transition-colors" title="อนุมัติ">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </button>
                  <button onClick={() => setSlips(p => p.map(s => s.id === slip.id ? { ...s, status: "REJECTED" } : s))} className="p-2 rounded-lg hover:bg-red-100 transition-colors" title="ปฏิเสธ">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
