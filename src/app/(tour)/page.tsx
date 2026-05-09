"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Paperclip, Sparkles, ChevronDown, Mic, MicOff } from "lucide-react";

/* ── Data ─────────────────────────── */
const wholesalePartners = [
  { name: "Let's Go", code: "letsgo", logo: "/images/logos/download.png", color: "#22c55e" },
  { name: "Go365", code: "go365", logo: "/images/logos/download.jfif", color: "#3b82f6" },
  { name: "Checkin Group", code: "checkin", logo: "/images/logos/CH7.jpg", color: "#ef4444" },
  { name: "Tour Factory", code: "tour-factory", logo: "/images/logos/Tour-Factory.jpg", color: "#8b5cf6" },
  { name: "World Connection", code: "worldconnection", logo: "/images/logos/worldconnection.png", color: "#f97316" },
  { name: "iTravels Center", code: "itravels", logo: "/images/logos/itravels.png", color: "#0ea5e9" },
  { name: "Best International", code: "bestinternational", logo: "/images/logos/Bestinternational.png", color: "#dc2626" },
  { name: "GS25 Travel", code: "gs25", logo: "/images/logos/GS Group.png", color: "#10b981" },
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
      text: "สวัสดีครับ! ผมช่วยค้นหา เปรียบเทียบ\nและแนะนำโปรแกรมทัวร์ที่ดีที่สุดให้คุณได้",
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
      <section className="relative flex flex-col items-center px-4 pt-12 pb-20 min-h-[calc(100vh-56px)] overflow-hidden bg-[#fafafa]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,#000 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center,rgba(249,115,22,0.06) 0%,transparent 70%)" }} />

        {/* Title — Minimal, crisp */}
        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium tracking-wide text-slate-500">AI-Powered Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
            ค้นหาทัวร์ที่ใช่ — <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#f97316,#ea580c)" }}>ด้วย AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-normal">เปรียบเทียบราคา โปรแกรม และสายการบิน จากทุกโฮลเซล</p>
        </div>

        {/* ══ Chat Card — Ultra-crisp, dimensional ══ */}
        <div className="chat-card relative z-10 w-full max-w-[800px]">
          {/* Outer shadow layers for depth */}
          <div className="absolute -inset-px rounded-2xl" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.8),rgba(241,245,249,0.5))", filter: "blur(0.5px)" }} />
          
          <div className="relative bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.03)" }}>
            
            {/* Header — Clean, structured */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800 block leading-tight">Jongtour AI</span>
                  <span className="text-[11px] font-normal text-emerald-500">พร้อมช่วยเหลือ</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-colors" aria-label="Toggle">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions — pill buttons */}
            <div className="flex gap-2 px-5 py-3 border-b border-slate-50">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => send(a.label)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-normal text-slate-500 bg-slate-50 border border-slate-100 rounded-full hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-200 whitespace-nowrap">
                  <span className="text-sm">{a.icon}</span> {a.label}
                </button>
              ))}
            </div>

            {/* Messages — clean spacing */}
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto px-5 py-5 flex flex-col gap-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i}>
                  <div className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "items-start"}`}>
                    {m.role === "ai" && (
                      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed ${
                        m.role === "user"
                          ? "rounded-2xl rounded-br-md text-white"
                          : "rounded-2xl rounded-bl-md bg-slate-50 text-slate-700 border border-slate-100"
                      }`}
                      style={m.role === "user" ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : undefined}
                    >
                      <p className="m-0 whitespace-pre-line">{m.text}</p>
                      <span className={`block text-[10px] mt-1.5 ${m.role === "user" ? "text-white/50" : "text-slate-300"}`}>
                        {m.time}{m.role === "user" && <span className="ml-1">✓✓</span>}
                      </span>
                    </div>
                  </div>
                  {m.tours && m.tours.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3 ml-10">
                      {m.tours.slice(0, 5).map((t) => (
                        <Link key={t.id} href={`/tour/${t.slug || t.code || t.id}`} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-100 rounded-xl no-underline hover:border-orange-200 hover:shadow-sm transition-all group">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                            {t.imageUrl ? (
                              <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-orange-50 to-amber-50">🏝️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-700 m-0 truncate group-hover:text-orange-600 transition-colors">{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {t.durationDays ? <span className="text-[11px] text-slate-400">⏱ {t.durationDays} วัน</span> : null}
                              {t.destination ? <span className="text-[11px] text-slate-400">📍 {t.destination}</span> : null}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {t.price ? (
                              <>
                                <span className="text-sm font-semibold text-orange-600">฿{Number(t.price).toLocaleString()}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">เริ่มต้น/ท่าน</span>
                              </>
                            ) : <span className="text-[11px] text-slate-400">สอบถาม</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input — precise, sharp */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
              {isListening && (
                <div className="absolute inset-x-0 bottom-0 h-16 bg-red-50/40 animate-pulse pointer-events-none rounded-b-2xl" />
              )}
              <div className="flex items-center gap-2 relative">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-colors flex-shrink-0" aria-label="Attach">
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full h-11 px-4 pr-11 text-[14px] text-slate-700 bg-slate-50 border border-slate-150 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-300 font-normal"
                    placeholder={isListening ? "🎙️ กำลังฟัง..." : "ถามอะไรก็ได้เกี่ยวกับทัวร์..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                  />
                  {/* Mic inside input */}
                  <button
                    onClick={toggleVoice}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-red-500 text-white shadow-md animate-pulse"
                        : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                    }`}
                    aria-label="Voice"
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-150"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: input.trim() ? "0 2px 8px rgba(249,115,22,0.3)" : "none" }}
                  aria-label="Send"
                >
                  <Send className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHOLESALE PARTNERS ═══ */}
      <section className="py-16 px-4 text-center bg-white">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-slate-400 mb-2">OFFICIAL WHOLESALE PARTNERS</p>
        <h2 className="text-xl font-semibold text-slate-800 mb-8">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[900px] mx-auto">
          {wholesalePartners.map((p, idx) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl no-underline transition-all duration-300 cursor-pointer border ${activePartner === idx ? "border-orange-200 shadow-md -translate-y-1 bg-white" : "border-slate-100 bg-white hover:shadow-md hover:-translate-y-1 hover:border-orange-200"}`}
              onMouseEnter={() => setActivePartner(idx)}
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden p-2 transition-transform hover:scale-105" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <img src={p.logo} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 m-0">{p.name}</h3>
              <span className="text-[11px] font-normal text-orange-500">ดูทัวร์ทั้งหมด →</span>
            </Link>
          ))}
        </div>
        <Link href="/wholesale-partners" className="inline-flex items-center gap-2 mt-8 px-6 py-2.5 rounded-xl text-sm font-medium text-white no-underline hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 2px 8px rgba(249,115,22,0.25)" }}>
          ดูโฮลเซลทั้งหมด →
        </Link>
      </section>
    </>
  );
}
