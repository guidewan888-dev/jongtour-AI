"use client";
import React, { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";

const mockNotifs = [
  { id: "1", type: "BOOKING", title: "✅ การจองยืนยันแล้ว", message: "Tokyo Explorer 5D — BK-2569050001 ยืนยันเรียบร้อย", isRead: false, linkUrl: "/account/bookings", createdAt: "5 นาทีที่แล้ว" },
  { id: "2", type: "TALENT", title: "✅ ยืนยันไกด์แล้ว", message: "พี่ก้อย (Premium) พร้อมดูแลคุณในทริป Tokyo Explorer", isRead: false, linkUrl: "/account/talent-requests", createdAt: "1 ชม. ที่แล้ว" },
  { id: "3", type: "PAYMENT", title: "💳 ชำระเงินสำเร็จ", message: "฿45,900 ผ่าน Bank Transfer — BK-2569050001", isRead: true, createdAt: "3 ชม. ที่แล้ว" },
  { id: "4", type: "SYSTEM", title: "🔄 เสนอทางเลือกไกด์", message: "ไกด์ที่เลือกไม่ว่าง — ดูทางเลือก 3 ท่าน", isRead: true, linkUrl: "/talents/request/alternatives", createdAt: "1 วันที่แล้ว" },
  { id: "5", type: "SYSTEM", title: "🛂 วีซ่าญี่ปุ่น อนุมัติแล้ว", message: "Tourist Visa — Japan ผ่านเรียบร้อย", isRead: true, createdAt: "2 วันที่แล้ว" },
];

const iconMap: Record<string, string> = { BOOKING: "🎫", TALENT: "👥", PAYMENT: "💳", SYSTEM: "⚙️" };

export default function CustomerNotificationsPage() {
  const [notifs, setNotifs] = useState(mockNotifs);
  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="g-container py-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔔 การแจ้งเตือน</h1>
          <p className="text-sm text-slate-500 mt-1">{unread} ยังไม่ได้อ่าน</p>
        </div>
        <button onClick={() => setNotifs(p => p.map(n => ({ ...n, isRead: true })))} className="btn-outline text-xs">
          <Check className="w-3 h-3 mr-1" /> อ่านทั้งหมด
        </button>
      </div>
      <div className="space-y-2 stagger-children">
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, isRead: true } : x))}
            className={`g-card p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${!n.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""}`}>
            <span className="text-2xl">{iconMap[n.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{n.title}</div>
              <p className="text-xs text-slate-500 truncate">{n.message}</p>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">{n.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
