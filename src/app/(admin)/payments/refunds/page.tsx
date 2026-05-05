"use client";
import React, { useState } from "react";
import { Undo2, CheckCircle, Clock, Search, Filter } from "lucide-react";

const mockRefunds = [
  { id: "1", refundNo: "RF-MQ1A001", booking: "BK-2569050001", customer: "Somchai J.", amount: 35900, reason: "ยกเลิกทริป — เหตุสุดวิสัย", status: "PENDING", requestedAt: "2 ชม." },
  { id: "2", refundNo: "RF-NR2B002", booking: "BK-2569050003", customer: "John D.", amount: 64500, reason: "ลดจำนวนผู้เดินทาง 2 → 1", status: "APPROVED", requestedAt: "1 วัน" },
  { id: "3", refundNo: "RF-KS3C003", booking: "BK-2569050004", customer: "สมศักดิ์ ก.", amount: 18900, reason: "จ่ายซ้ำ — duplicate payment", status: "COMPLETED", requestedAt: "3 วัน" },
];

const statusBadge = (s: string) => {
  const map: Record<string, [string, string]> = {
    PENDING: ["bg-amber-100 text-amber-700", "⏳ รอพิจารณา"],
    APPROVED: ["bg-blue-100 text-blue-700", "✅ อนุมัติแล้ว"],
    COMPLETED: ["bg-emerald-100 text-emerald-700", "💸 คืนเงินแล้ว"],
    REJECTED: ["bg-red-100 text-red-700", "❌ ปฏิเสธ"],
  };
  return map[s] || ["bg-slate-100 text-slate-600", s];
};

export default function RefundsPage() {
  const [refunds] = useState(mockRefunds);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">💸 Refund Management</h1>
          <p className="text-sm text-slate-500 mt-1">{refunds.filter(r => r.status === "PENDING").length} คำขอรอพิจารณา</p>
        </div>
      </div>

      <div className="space-y-3 stagger-children">
        {refunds.map(r => {
          const [badgeClass, badgeLabel] = statusBadge(r.status);
          return (
            <div key={r.id} className="g-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                <Undo2 className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{r.refundNo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>{badgeLabel}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{r.customer} · {r.booking} · {r.requestedAt}ที่แล้ว</div>
                <div className="text-xs text-slate-500 mt-1">📝 {r.reason}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-red-500">-฿{r.amount.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
