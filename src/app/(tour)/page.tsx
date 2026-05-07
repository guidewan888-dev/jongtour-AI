"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Paperclip, Sparkles, ChevronDown, Headphones } from "lucide-react";

/* ── Data ─────────────────────────── */
const wholesalePartners = [
  { name: "Let's Go", code: "letsgo", logo: "/images/logos/download.png", color: "#22c55e" },
  { name: "Go365", code: "go365", logo: "/images/logos/download.jfif", color: "#3b82f6" },
  { name: "Checkin Group", code: "checkin", logo: "/images/logos/CH7.jpg", color: "#ef4444" },
  { name: "Tour Factory", code: "tour-factory", logo: "/images/logos/Tour-Factory.jpg", color: "#8b5cf6" },
];

const quickActions = [
  { icon: "📋", label: "จัดทริปแนะนำ" },
  { icon: "💰", label: "ขอใบเสนอราคา" },
  { icon: "⚖️", label: "เปรียบเทียบโปรแกรม" },
];

type Tour = { id: string; title: string; price: number; durationDays: number; slug?: string; code?: string; imageUrl?: string; supplierName?: string; destination?: string };
type Msg = { role: "user" | "ai"; text: string; time: string; tours?: Tour[] };

export default function TourHomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePartner, setActivePartner] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "ai",
        text: "ได้เลย! ฉันช่วยค้นหา เปรียบเทียบ\nและแนะนำโปรแกรมทัวร์ที่ดีที่สุดให้คุณได้",
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const now = () => new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    setMessages((p) => [...p, { role: "user", text: text.trim(), time: now() }]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          chatHistory: messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        }),
      });
      const raw = await res.text();
      let tours: Tour[] = [];
      const dataMatch = raw.match(/__DATA__([\s\S]*?)__DATA__/);
      if (dataMatch) {
        try {
          const parsed = JSON.parse(dataMatch[1]);
          tours = (parsed.tours || []).map((t: any) => ({
            id: t.id || String(Math.random()),
            title: t.title || t.tourName || "",
            price: t.price || t.startingPrice || 0,
            durationDays: t.durationDays || 0,
            slug: t.slug || t.code || t.id || "",
            code: t.code || "",
            imageUrl: t.imageUrl || null,
            supplierName: t.supplierName || t.supplier_name || "",
            destination: t.destination || "",
          }));
        } catch {}
      }
      const replyText = raw.replace(/__DATA__[\s\S]*?__DATA__/g, "").replace(/__CHIPS__[\s\S]*$/g, "").trim();
      setMessages((p) => [...p, { role: "ai", text: replyText || "พบข้อมูลทัวร์แล้วครับ", time: now(), tours }]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่", time: now() }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center px-4 pt-10 pb-16 min-h-[calc(100vh-64px)] overflow-hidden" style={{ background: "linear-gradient(180deg,#fdf8f3 0%,#fff 40%,#fff 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute w-[800px] h-[800px] -top-60 -right-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)" }} />
        <div className="absolute w-[600px] h-[600px] -bottom-32 -left-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)" }} />

        {/* Title — Hi-tech design */}
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white mb-4" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 6px 24px rgba(249,115,22,0.4)" }}>
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="text-[0.7rem] font-bold tracking-[0.25em] uppercase text-orange-500 mb-3">
            ✦ AI-POWERED SEARCH ENGINE
          </p>
          <h1 className="leading-none" style={{ margin: 0 }}>
            <span className="block text-sm font-semibold tracking-[0.15em] uppercase text-slate-400 mb-1">
              Smart
            </span>
            <span className="block text-5xl md:text-7xl font-black tracking-tight" style={{ background: "linear-gradient(135deg,#f97316 0%,#ea580c 40%,#dc2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Tour Search
            </span>
          </h1>
          <p className="text-base text-slate-400 mt-3 font-medium">
            ค้นหาทัวร์ที่ใช่จาก 50+ โฮลเซล — ด้วย AI ที่เข้าใจคุณ
          </p>
        </div>

        {/* Chat Card */}
        <div className="relative z-10 w-full max-w-[880px] bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden mb-8" style={{ border: "1px solid rgba(249,115,22,0.12)", boxShadow: "0 8px 40px rgba(0,0,0,0.05),0 16px 64px rgba(249,115,22,0.07)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white/80 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-800 block leading-tight">Jongtour AI Assistant</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">Online</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="Support"><Headphones className="w-5 h-5" /></button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="Toggle"><ChevronDown className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar relative z-10">
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => send(a.label)} className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-colors whitespace-nowrap">
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="min-h-[320px] max-h-[600px] overflow-y-auto px-5 py-4 flex flex-col gap-3 relative z-10 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex gap-2 items-end ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "ai" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${m.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm bg-slate-100 text-slate-700"}`} style={m.role === "user" ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : undefined}>
                    <p className="text-[0.95rem] leading-relaxed whitespace-pre-line m-0">{m.text}</p>
                    <span className="block text-[0.7rem] mt-1 opacity-50">{m.time}{m.role === "user" && <span className="ml-1 text-[0.65rem]">✓✓</span>}</span>
                  </div>
                </div>
                {m.tours && m.tours.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 ml-10">
                    {m.tours.slice(0, 5).map((t) => (
                      <Link key={t.id} href={`/tour/${t.slug || t.code || t.id}`} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl no-underline hover:border-orange-300 hover:shadow-md transition-all group">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          {t.imageUrl ? (
                            <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-orange-50 to-amber-50">🏝️</div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 m-0 truncate group-hover:text-orange-600 transition-colors">{t.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {t.durationDays ? <span className="text-[0.7rem] text-slate-400">⏱ {t.durationDays} วัน</span> : null}
                            {t.destination ? <span className="text-[0.7rem] text-slate-400">📍 {t.destination}</span> : null}
                          </div>
                          {t.supplierName && <p className="text-[0.65rem] text-slate-400 m-0 mt-0.5">🏢 {t.supplierName}</p>}
                        </div>
                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          {t.price ? (
                            <>
                              <span className="text-base font-bold text-orange-600">฿{Number(t.price).toLocaleString()}</span>
                              <span className="block text-[0.6rem] text-slate-400">เริ่มต้น/ท่าน</span>
                            </>
                          ) : <span className="text-xs text-slate-400">สอบถามราคา</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80 relative z-10">
            <button className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors flex-shrink-0" aria-label="Attach"><Paperclip className="w-5 h-5" /></button>
            <input
              type="text"
              className="flex-1 h-12 px-5 text-base text-slate-700 bg-white border border-slate-200 rounded-full outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
              placeholder="พิมพ์ข้อความหรือสอบถามได้เลย..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || isLoading} className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }} aria-label="Send">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ WHOLESALE PARTNERS ═══ */}
      <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(180deg,#fff 0%,#f8fafc 100%)" }}>
        <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-slate-400 mb-2">OFFICIAL WHOLESALE PARTNERS</p>
        <h2 className="text-2xl font-extrabold text-teal-700 mb-8">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[880px] mx-auto">
          {wholesalePartners.map((p, idx) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl no-underline transition-all duration-300 cursor-pointer border ${activePartner === idx ? "border-current shadow-lg -translate-y-1.5 bg-white" : "border-slate-200/60 bg-white/70 hover:shadow-lg hover:-translate-y-1.5 hover:bg-white"}`}
              onMouseEnter={() => setActivePartner(idx)}
              style={{ color: p.color, backdropFilter: "blur(12px)" }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-110" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <img src={p.logo} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 m-0">{p.name}</h3>
              <span className="text-xs font-semibold text-teal-600">ดูทัวร์ทั้งหมด →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
