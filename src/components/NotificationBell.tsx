"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import Link from "next/link";

type Notif = { id: string; type: string; title: string; message: string; isRead: boolean; linkUrl?: string; createdAt: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([
    { id: "1", type: "BOOKING", title: "การจองยืนยันแล้ว", message: "Tokyo Explorer — BK-2569050001", isRead: false, linkUrl: "/account/bookings", createdAt: "5 นาทีที่แล้ว" },
    { id: "2", type: "TALENT", title: "ยืนยันไกด์แล้ว", message: "พี่ก้อย พร้อมดูแลคุณ", isRead: false, linkUrl: "/account/talent-requests", createdAt: "1 ชม. ที่แล้ว" },
    { id: "3", type: "PAYMENT", title: "ชำระเงินสำเร็จ", message: "฿45,900 — Bank Transfer", isRead: true, createdAt: "3 ชม. ที่แล้ว" },
  ]);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.isRead).length;
  const iconMap: Record<string, string> = { BOOKING: "🎫", TALENT: "👥", PAYMENT: "💳", SYSTEM: "⚙️" };

  const markRead = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, isRead: true })));

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="g-dropdown absolute right-0 top-12 w-80 sm:w-96 animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-sm">🔔 การแจ้งเตือน</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> อ่านทั้งหมด
                </button>
              )}
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifs.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`g-dropdown-item ${!n.isRead ? "bg-primary/5" : ""}`}>
                <span className="text-lg flex-shrink-0">{iconMap[n.type] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-medium truncate ${!n.isRead ? "text-slate-900" : "text-slate-500"}`}>{n.title}</span>
                    {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-300 flex-shrink-0">{n.createdAt}</span>
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 text-center">
            <Link href="/account/notifications" className="text-xs text-primary font-bold" onClick={() => setOpen(false)}>
              ดูทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
