"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Paperclip, Sparkles, ChevronDown, Headphones, Mic, MicOff } from "lucide-react";

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
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Load messages from sessionStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = sessionStorage.getItem("jt_chat");
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[];
        if (parsed.length > 0) { setMessages(parsed); return; }
      }
    } catch {}
    // Default welcome message
    setMessages([{
      role: "ai",
      text: "ได้เลย! ฉันช่วยค้นหา เปรียบเทียบ\nและแนะนำโปรแกรมทัวร์ที่ดีที่สุดให้คุณได้",
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    }]);
  }, []);

  // Save messages to sessionStorage on every change
  useEffect(() => {
    if (messages.length > 0) {
      try { sessionStorage.setItem("jt_chat", JSON.stringify(messages)); } catch {}
    }
  }, [messages]);

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

  // ── Voice Recognition ──
  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("เบราว์เซอร์ไม่รองรับการพูด กรุณาใช้ Chrome"); return; }
    const recognition = new SR();
    recognition.lang = "th-TH";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

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
          <p className="text-base text-slate-500 mt-1 font-medium">
            ค้นหาทัวร์ที่ใช่ — ด้วย AI ที่เข้าใจคุณ
          </p>
        </div>

        {/* Chat Card — Futuristic Glass */}
        <div className="chat-card-wrapper relative z-10 w-full max-w-[880px] mb-8 group/card">
          {/* Animated glow border */}
          <div className="absolute -inset-[1px] rounded-[26px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.3),rgba(59,130,246,0.15),rgba(249,115,22,0.3))", filter: "blur(4px)" }} />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(249,115,22,0.12)", boxShadow: "0 8px 40px rgba(0,0,0,0.05),0 16px 64px rgba(249,115,22,0.07)" }}>
            {/* Shimmer top edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] opacity-60" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.4),transparent)" }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 bg-gradient-to-r from-white/90 to-orange-50/30 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  {/* Pulse ring */}
                  <div className="absolute -inset-1 rounded-xl animate-ping opacity-20" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", animationDuration: "3s" }} />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-800 block leading-tight">Jongtour AI Assistant</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[0.7rem] font-semibold text-emerald-500">ออนไลน์</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-all" aria-label="Support"><Headphones className="w-5 h-5" /></button>
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-all" aria-label="Toggle"><ChevronDown className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar relative z-10 bg-gradient-to-b from-white/50 to-transparent">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => send(a.label)} className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-200 hover:text-orange-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap">
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
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl transition-shadow duration-200 hover:shadow-md ${
                        m.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm bg-gradient-to-br from-slate-50 to-slate-100/80 text-slate-700 border border-slate-100"
                      }`}
                      style={m.role === "user" ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : undefined}
                    >
                      <p className="text-[0.95rem] leading-relaxed whitespace-pre-line m-0">{m.text}</p>
                      <span className="block text-[0.7rem] mt-1 opacity-50">{m.time}{m.role === "user" && <span className="ml-1 text-[0.65rem]">✓✓</span>}</span>
                    </div>
                  </div>
                  {m.tours && m.tours.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 ml-10">
                      {m.tours.slice(0, 5).map((t) => (
                        <Link key={t.id} href={`/tour/${t.slug || t.code || t.id}`} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl no-underline hover:border-orange-300 hover:shadow-md transition-all group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                            {t.imageUrl ? (
                              <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-orange-50 to-amber-50">🏝️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 m-0 truncate group-hover:text-orange-600 transition-colors">{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {t.durationDays ? <span className="text-[0.7rem] text-slate-400">⏱ {t.durationDays} วัน</span> : null}
                              {t.destination ? <span className="text-[0.7rem] text-slate-400">📍 {t.destination}</span> : null}
                            </div>
                            {t.supplierName && <p className="text-[0.65rem] text-slate-400 m-0 mt-0.5">🏢 {t.supplierName}</p>}
                          </div>
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
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-100">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input — Futuristic */}
            <div className="relative px-4 py-3 border-t border-slate-100/80 bg-gradient-to-r from-slate-50/90 to-orange-50/30 z-10">
              {isListening && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-orange-50/50 animate-pulse pointer-events-none rounded-b-3xl" />
              )}
              <div className="flex items-center gap-2 relative">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all flex-shrink-0" aria-label="Attach"><Paperclip className="w-5 h-5" /></button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full h-12 px-5 pr-12 text-base text-slate-700 bg-white border border-slate-200 rounded-full outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:shadow-lg placeholder:text-slate-400"
                    placeholder={isListening ? "🎙️ กำลังฟัง..." : "พิมพ์ข้อความหรือสอบถามได้เลย..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                  />
                  {/* Mic inside input */}
                  <button
                    onClick={toggleVoice}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                        : "text-slate-400 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                    aria-label="Voice"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 hover:shadow-xl transition-all duration-200"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom shimmer */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-40" style={{ background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)" }} />
          </div>
        </div>
      </section>

      {/* ═══ WHOLESALE PARTNERS ═══ */}
      <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(180deg,#fff 0%,#f8fafc 100%)" }}>
        <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-slate-500 mb-2">OFFICIAL WHOLESALE PARTNERS</p>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-8">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[880px] mx-auto">
          {wholesalePartners.map((p, idx) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl no-underline transition-all duration-300 cursor-pointer border ${activePartner === idx ? "border-orange-300 shadow-lg -translate-y-1.5 bg-white" : "border-slate-200/60 bg-white/70 hover:shadow-lg hover:-translate-y-1.5 hover:bg-white hover:border-orange-200"}`}
              onMouseEnter={() => setActivePartner(idx)}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-110" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <img src={p.logo} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 m-0">{p.name}</h3>
              <span className="text-xs font-semibold text-orange-500">ดูทัวร์ทั้งหมด →</span>
            </Link>
          ))}
        </div>
        <Link href="/wholesale-partners" className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-full text-sm font-bold text-white no-underline hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
          ดูโฮลเซลทั้งหมด →
        </Link>
      </section>
    </>
  );
}
