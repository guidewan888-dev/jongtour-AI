"use client";
import React, { useState } from "react";
import { Mail, MessageSquare, Bell, Send, Eye } from "lucide-react";

type Template = { id: string; name: string; event: string; channels: string[]; subject: string; status: "active" | "draft"; lastEdited: string };

const templates: Template[] = [
  { id: "1", name: "Booking Confirmed", event: "booking.confirmed", channels: ["Email", "LINE", "In-App"], subject: "✅ การจองยืนยันแล้ว — {{bookingRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "2", name: "Payment Received", event: "payment.received", channels: ["Email", "LINE", "In-App"], subject: "💳 ชำระเงินสำเร็จ — {{bookingRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "3", name: "Talent Request Submitted", event: "talent.request.submitted", channels: ["Email", "LINE", "In-App"], subject: "📩 Request ไกด์ส่งแล้ว — {{requestRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "4", name: "Talent Confirmed", event: "talent.confirmed", channels: ["Email", "LINE", "In-App"], subject: "✅ ยืนยันไกด์แล้ว — {{talentName}}", status: "active", lastEdited: "05/05/69" },
  { id: "5", name: "Alternative Offered", event: "talent.alternative", channels: ["Email", "LINE", "In-App"], subject: "🔄 เสนอทางเลือกไกด์ — {{requestRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "6", name: "Talent New Request (Guide)", event: "talent.notify_guide", channels: ["Email", "LINE"], subject: "📩 มี Request ใหม่!", status: "active", lastEdited: "05/05/69" },
  { id: "7", name: "Talent Reminder (Guide)", event: "talent.reminder", channels: ["Email", "LINE"], subject: "⏰ Reminder — กรุณาตอบ", status: "active", lastEdited: "05/05/69" },
  { id: "8", name: "Trip Pre-briefing", event: "talent.prebriefing", channels: ["Email", "LINE"], subject: "📋 Pre-briefing — {{tourName}}", status: "active", lastEdited: "05/05/69" },
  { id: "9", name: "Visa Status Update", event: "visa.status", channels: ["Email", "LINE", "In-App"], subject: "{{statusEmoji}} วีซ่า {{country}}", status: "active", lastEdited: "05/05/69" },
  { id: "10", name: "Affiliate Commission", event: "affiliate.commission", channels: ["Email"], subject: "💰 Commission Earned — {{amount}}", status: "active", lastEdited: "05/05/69" },
  { id: "11", name: "Affiliate Payout", event: "affiliate.payout", channels: ["Email"], subject: "💸 Payout Processed — {{payoutRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "12", name: "Admin Alert", event: "admin.alert", channels: ["Email"], subject: "{{emoji}} [{{urgency}}] {{message}}", status: "active", lastEdited: "05/05/69" },
  { id: "13", name: "Admin Talent Request", event: "admin.talent_request", channels: ["Email"], subject: "📩 New Talent Request — {{requestRef}}", status: "active", lastEdited: "05/05/69" },
  { id: "14", name: "Emergency Replacement", event: "talent.emergency", channels: ["Email", "LINE", "SMS"], subject: "🚨 Emergency — ไกด์ป่วย", status: "draft", lastEdited: "—" },
  { id: "15", name: "Auto-assigned + Refund", event: "talent.auto_assigned", channels: ["Email", "LINE"], subject: "🔄 จัดไกด์ให้อัตโนมัติ + คืน premium", status: "draft", lastEdited: "—" },
];

const channelIcon: Record<string, React.ReactNode> = {
  Email: <Mail className="w-3 h-3" />,
  LINE: <MessageSquare className="w-3 h-3" />,
  "In-App": <Bell className="w-3 h-3" />,
  SMS: <Send className="w-3 h-3" />,
};

export default function NotificationTemplatesPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? templates : templates.filter(t => t.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📧 Notification Templates</h1>
          <p className="text-sm text-slate-500 mt-1">{templates.length} templates · 3 channels (Email, LINE, In-App)</p>
        </div>
        <button className="btn-primary text-sm">+ สร้าง Template</button>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["all", "active", "draft"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {f === "all" ? `ทั้งหมด (${templates.length})` : f === "active" ? `Active (${templates.filter(t => t.status === "active").length})` : `Draft (${templates.filter(t => t.status === "draft").length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2 stagger-children">
        {filtered.map(t => (
          <div key={t.id} className="g-card p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.status === "active" ? "bg-emerald-50" : "bg-slate-100"}`}>
              {t.event.startsWith("booking") ? "🎫" : t.event.startsWith("talent") ? "👥" : t.event.startsWith("visa") ? "🛂" : t.event.startsWith("affiliate") ? "🤝" : "⚙️"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{t.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{t.status}</span>
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">Subject: {t.subject}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {t.channels.map(c => (
                  <span key={c} className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {channelIcon[c]} {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right flex-shrink-0">
              <div>{t.lastEdited}</div>
              <code className="text-[10px] text-primary">{t.event}</code>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="btn-icon w-8 h-8"><Eye className="w-3.5 h-3.5 text-slate-400" /></button>
              <button className="text-xs text-primary font-bold px-2">แก้ไข</button>
            </div>
          </div>
        ))}
      </div>

      <div className="g-card p-5 bg-blue-50/50 border-blue-200">
        <h3 className="font-bold text-sm mb-2">💡 Architecture</h3>
        <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="bg-white p-3 rounded-xl"><span className="font-bold text-blue-600">Email</span><br />Resend API<br />HTML templates</div>
          <div className="bg-white p-3 rounded-xl"><span className="font-bold text-emerald-600">LINE</span><br />Messaging API<br />Flex Messages</div>
          <div className="bg-white p-3 rounded-xl"><span className="font-bold text-purple-600">In-App</span><br />DB Notification<br />Real-time bell</div>
        </div>
      </div>
    </div>
  );
}
