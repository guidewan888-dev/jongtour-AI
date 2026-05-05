"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const events: Record<string, { title: string; time: string; type: string }[]> = {
  "2026-05-06": [{ title: "Follow-up คุณสมชาย", time: "10:00", type: "followup" }, { title: "นัดโทร บจก. ABC", time: "14:00", type: "call" }],
  "2026-05-07": [{ title: "ส่ง Quotation ทัวร์เกาหลี", time: "11:00", type: "task" }],
  "2026-05-08": [{ title: "Meeting ทีมขาย", time: "09:00", type: "meeting" }],
};

export default function SaleCalendarPage() {
  const [currentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const daysInMonth = 31;
  const startDay = 5; // Friday

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-bold text-slate-900">พฤษภาคม 2026</span>
          <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 bg-slate-50 border-b">
          {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map(d => <div key={d} className="py-3">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="h-24 border-b border-r border-slate-100" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `2026-05-${String(day).padStart(2, "0")}`;
            const dayEvents = events[dateKey] || [];
            const isToday = day === 6;
            return (
              <div key={day} className={`h-24 border-b border-r border-slate-100 p-1 ${isToday ? "bg-primary-50" : ""}`}>
                <div className={`text-xs font-bold mb-1 ${isToday ? "text-primary" : "text-slate-500"}`}>{day}</div>
                {dayEvents.map((e, ei) => (
                  <div key={ei} className={`text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate ${e.type === "followup" ? "bg-amber-100 text-amber-700" : e.type === "call" ? "bg-blue-100 text-blue-700" : e.type === "meeting" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {e.time} {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
