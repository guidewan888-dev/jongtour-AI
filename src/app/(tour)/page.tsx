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

type Tour = { id: string; title: string; price: number; durationDays: number; imageUrl?: string; slug?: string };
type Msg = { role: "user" | "ai"; text: string; time: string; tours?: Tour[] };

/* ── Component ─────────────────────────── */
export default function TourHomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "ได้เลย! ฉันช่วยค้นหา เปรียบเทียบ\nและแนะนำโปรแกรมทัวร์ที่ดีที่สุดให้คุณได้",
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePartner, setActivePartner] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

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

      // Parse tour data
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
            imageUrl: t.imageUrl || t.coverImage || "",
            slug: t.slug || t.id || "",
          }));
        } catch {}
      }

      const replyText = raw.replace(/__DATA__[\s\S]*?__DATA__/g, "").replace(/__CHIPS__[\s\S]*$/g, "").trim();
      setMessages((p) => [...p, { role: "ai", text: replyText || "พบข้อมูลทัวร์แล้วครับ", time: now(), tours }]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่", time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-wrap">
        {/* Decorations */}
        <div className="deco deco-1" />
        <div className="deco deco-2" />
        <div className="deco-dot deco-dot-1">✦</div>
        <div className="deco-dot deco-dot-2">✦</div>
        <div className="deco-dot deco-dot-3">+</div>
        <div className="deco-ring deco-ring-1" />
        <div className="deco-ring deco-ring-2" />

        {/* Title */}
        <div className="hero-top">
          <div className="sparkle-badge"><Sparkles className="w-5 h-5" /></div>
          <h1 className="hero-h1">
            Smart <span className="accent">Tour</span> Search
          </h1>
          <p className="hero-sub">ค้นหาทัวร์ที่ใช่ ด้วย AI ที่เข้าใจคุณ</p>
        </div>

        {/* Chat Card */}
        <div className="card">
          <div className="card-glow" />

          {/* Header */}
          <div className="card-head">
            <div className="card-head-l">
              <div className="ai-av"><Sparkles className="w-5 h-5 text-white" /></div>
              <div>
                <span className="ai-name">Jongtour AI Assistant</span>
                <span className="ai-online">Online</span>
              </div>
            </div>
            <div className="card-head-r">
              <button className="hd-btn" aria-label="Support"><Headphones className="w-5 h-5" /></button>
              <button className="hd-btn" aria-label="Toggle"><ChevronDown className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="chips-row">
            {quickActions.map((a) => (
              <button key={a.label} className="chip" onClick={() => send(a.label)}>
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="msgs">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`msg ${m.role === "user" ? "msg-u" : "msg-a"}`}>
                  {m.role === "ai" && <div className="msg-av"><Sparkles className="w-4 h-4 text-white" /></div>}
                  <div className={`bubble ${m.role === "user" ? "bubble-u" : "bubble-a"}`}>
                    <p className="btxt">{m.text}</p>
                    <span className="btime">{m.time}{m.role === "user" && <span className="bchk">✓✓</span>}</span>
                  </div>
                </div>
                {/* Tour Cards */}
                {m.tours && m.tours.length > 0 && (
                  <div className="tour-cards">
                    {m.tours.slice(0, 5).map((t) => (
                      <Link key={t.id} href={`/tours/detail/${t.slug || t.id}`} className="tour-card">
                        <div className="tc-left">
                          <p className="tc-title">{t.title}</p>
                          <p className="tc-meta">{t.durationDays ? `${t.durationDays} วัน` : ""}</p>
                        </div>
                        <div className="tc-price">
                          {t.price ? `฿${Number(t.price).toLocaleString()}` : ""}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="msg msg-a">
                <div className="msg-av"><Sparkles className="w-4 h-4 text-white" /></div>
                <div className="bubble bubble-a"><div className="typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="inp-bar">
            <button className="inp-attach" aria-label="Attach"><Paperclip className="w-6 h-6" /></button>
            <input
              type="text"
              className="inp"
              placeholder="พิมพ์ข้อความหรือสอบถามได้เลย..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            />
            <button className="inp-send" onClick={() => send(input)} disabled={!input.trim() || isLoading} aria-label="Send">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ WHOLESALE PARTNERS SECTION ═══ */}
      <section className="ws-section">
        <p className="ws-label">OFFICIAL WHOLESALE PARTNERS</p>
        <h2 className="ws-title">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
        <div className="ws-grid">
          {wholesalePartners.map((p, idx) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className={`ws-card ${activePartner === idx ? "ws-card-active" : ""}`}
              onMouseEnter={() => setActivePartner(idx)}
              style={{ "--partner-color": p.color } as React.CSSProperties}
            >
              <div className="ws-card-logo">
                <img src={p.logo} alt={p.name} loading="lazy" />
              </div>
              <h3 className="ws-card-name">{p.name}</h3>
              <span className="ws-card-link">ดูทัวร์ทั้งหมด →</span>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        /* ═══ HERO WRAP ═══ */
        .hero-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1.5rem 5rem;
          min-height: calc(100vh - 64px);
          overflow: hidden;
          background: linear-gradient(180deg, #fdf8f3 0%, #fff 40%, #fff 100%);
        }

        /* ═══ DECORATIONS ═══ */
        .deco { position: absolute; border-radius: 50%; pointer-events: none; }
        .deco-1 { width: 800px; height: 800px; top: -250px; right: -200px; background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%); }
        .deco-2 { width: 600px; height: 600px; bottom: -120px; left: -120px; background: radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%); }
        .deco-dot { position: absolute; pointer-events: none; color: rgba(249,115,22,0.15); font-size: 1.2rem; animation: float 6s ease-in-out infinite; }
        .deco-dot-1 { top: 12%; left: 15%; }
        .deco-dot-2 { top: 20%; right: 12%; animation-delay: 2s; }
        .deco-dot-3 { bottom: 25%; left: 10%; color: rgba(0,0,0,0.06); animation-delay: 4s; }
        .deco-ring { position: absolute; border-radius: 50%; border: 1px dashed rgba(249,115,22,0.08); pointer-events: none; animation: spin-slow 40s linear infinite; }
        .deco-ring-1 { width: 900px; height: 900px; top: -150px; left: 50%; transform: translateX(-50%); }
        .deco-ring-2 { width: 650px; height: 650px; top: -30px; left: 50%; transform: translateX(-50%); animation-direction: reverse; }
        @keyframes float { 0%,100%{transform:translateY(0);opacity:.5} 50%{transform:translateY(-10px);opacity:1} }
        @keyframes spin-slow { from{transform:translateX(-50%) rotate(0)} to{transform:translateX(-50%) rotate(360deg)} }

        /* ═══ TITLE ═══ */
        .hero-top { position: relative; z-index: 1; text-align: center; margin-bottom: 2.5rem; }
        .sparkle-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; margin-bottom: 0.75rem; box-shadow: 0 4px 16px rgba(249,115,22,0.35); }
        .hero-h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; color: #1e293b; letter-spacing: -0.02em; line-height: 1.15; margin: 0; }
        .accent { background: linear-gradient(135deg, #f97316, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 1.15rem; color: #94a3b8; margin-top: 0.5rem; font-weight: 500; }

        /* ═══ CARD ═══ */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 880px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(16px);
          border-radius: 1.5rem;
          border: 1px solid rgba(249,115,22,0.12);
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.05), 0 16px 64px rgba(249,115,22,0.07);
        }
        .card-glow {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(249,115,22,0.04), transparent, rgba(249,115,22,0.03), transparent);
          animation: glow-spin 8s linear infinite;
          pointer-events: none;
        }
        @keyframes glow-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        /* ═══ CARD HEAD ═══ */
        .card-head { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem; border-bottom:1px solid #f1f5f9; position:relative; z-index:1; background:rgba(255,255,255,0.8); }
        .card-head-l { display:flex; align-items:center; gap:0.75rem; }
        .ai-av { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#f97316,#ea580c); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(249,115,22,0.35); }
        .ai-name { font-size:1rem; font-weight:700; color:#1e293b; display:block; line-height:1.3; }
        .ai-online { font-size:0.75rem; font-weight:700; color:#22c55e; padding:2px 8px; border-radius:8px; background:#f0fdf4; display:inline-block; margin-top:2px; }
        .card-head-r { display:flex; gap:0.35rem; }
        .hd-btn { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#94a3b8; background:transparent; border:none; cursor:pointer; transition:all .15s; }
        .hd-btn:hover { background:#f1f5f9; color:#64748b; }

        /* ═══ CHIPS ═══ */
        .chips-row { display:flex; gap:0.5rem; padding:0.85rem 1.5rem; overflow-x:auto; scrollbar-width:none; position:relative; z-index:1; }
        .chips-row::-webkit-scrollbar { display:none; }
        .chip { flex-shrink:0; display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem; font-size:0.875rem; font-weight:600; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; border-radius:999px; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .chip:hover { background:#fff7ed; border-color:#fed7aa; color:#ea580c; }

        /* ═══ MESSAGES ═══ */
        .msgs { max-height:480px; overflow-y:auto; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:0.75rem; scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent; position:relative; z-index:1; }
        .msg { display:flex; gap:0.5rem; align-items:flex-end; }
        .msg-u { flex-direction:row-reverse; }
        .msg-av { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .bubble { max-width:80%; padding:0.75rem 1rem; border-radius:1rem; }
        .bubble-a { background:#f1f5f9; border-bottom-left-radius:4px; color:#334155; }
        .bubble-u { background:linear-gradient(135deg,#f97316,#ea580c); border-bottom-right-radius:4px; color:#fff; }
        .btxt { font-size:0.95rem; line-height:1.6; margin:0; white-space:pre-line; }
        .btime { display:block; font-size:0.7rem; margin-top:4px; opacity:.55; }
        .bchk { margin-left:4px; font-size:.65rem; }

        /* ═══ TOUR CARDS ═══ */
        .tour-cards { display:flex; flex-direction:column; gap:6px; margin:6px 0 6px 36px; }
        .tour-card { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; background:#fff; border:1px solid #f1f5f9; border-radius:12px; text-decoration:none; transition:all .15s; }
        .tour-card:hover { border-color:#fed7aa; box-shadow:0 4px 12px rgba(249,115,22,0.08); }
        .tc-left { flex:1; min-width:0; }
        .tc-title { font-size:0.9rem; font-weight:600; color:#1e293b; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .tc-meta { font-size:0.75rem; color:#94a3b8; margin:3px 0 0; }
        .tc-price { font-size:0.95rem; font-weight:700; color:#ea580c; white-space:nowrap; }

        /* ═══ TYPING ═══ */
        .typing { display:flex; gap:5px; padding:4px 0; }
        .typing span { width:7px; height:7px; border-radius:50%; background:#94a3b8; animation:tdot 1.4s ease-in-out infinite; }
        .typing span:nth-child(2) { animation-delay:.2s; }
        .typing span:nth-child(3) { animation-delay:.4s; }
        @keyframes tdot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }

        /* ═══ INPUT BAR ═══ */
        .inp-bar { display:flex; align-items:center; gap:0.5rem; padding:0.85rem 1.25rem; border-top:1px solid #f1f5f9; background:rgba(250,250,250,0.8); position:relative; z-index:1; }
        .inp-attach { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8; background:transparent; border:none; cursor:pointer; flex-shrink:0; }
        .inp-attach:hover { background:#f1f5f9; color:#64748b; }
        .inp { flex:1; height:48px; padding:0 1rem; font-size:1rem; color:#334155; background:#fff; border:1px solid #e2e8f0; border-radius:999px; outline:none; transition:border-color .15s; }
        .inp::placeholder { color:#94a3b8; }
        .inp:focus { border-color:#f97316; box-shadow:0 0 0 4px rgba(249,115,22,0.08); }
        .inp-send { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; background:linear-gradient(135deg,#f97316,#ea580c); border:none; cursor:pointer; flex-shrink:0; box-shadow:0 4px 12px rgba(249,115,22,0.3); transition:all .2s; }
        .inp-send:hover:not(:disabled) { transform:scale(1.05); box-shadow:0 6px 16px rgba(249,115,22,0.4); }
        .inp-send:disabled { opacity:.5; cursor:not-allowed; }

        /* ═══ WHOLESALE SECTION ═══ */
        .ws-section {
          background: #fff;
          padding: 4rem 1.5rem 5rem;
          text-align: center;
        }
        .ws-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #94a3b8;
          margin: 0 0 0.5rem;
        }
        .ws-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          color: #0f766e;
          margin: 0 0 2.5rem;
        }
        .ws-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          max-width: 960px;
          margin: 0 auto;
        }
        .ws-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 2rem 1.5rem;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .ws-card:hover,
        .ws-card-active {
          border-color: var(--partner-color, #22c55e);
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          transform: translateY(-4px);
          background: linear-gradient(135deg, rgba(255,255,255,1), rgba(245,250,248,1));
          border-left: 4px solid var(--partner-color, #22c55e);
        }
        .ws-card-logo {
          width: 80px;
          height: 80px;
          border-radius: 1rem;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 12px;
          transition: transform 0.3s;
        }
        .ws-card:hover .ws-card-logo {
          transform: scale(1.08);
        }
        .ws-card-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ws-card-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .ws-card-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0d9488;
          transition: color 0.2s;
        }
        .ws-card:hover .ws-card-link {
          color: #0f766e;
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width:768px) {
          .hero-wrap { padding: 2rem 1rem 4rem; }
          .hero-h1 { font-size: 2rem; }
          .hero-sub { font-size: 0.95rem; }
          .card { max-width: 100%; border-radius: 1rem; }
          .card-head { padding: 0.75rem 1rem; }
          .chips-row { padding: 0.65rem 1rem; }
          .msgs { padding: 0.75rem 1rem; max-height: 380px; }
          .inp-bar { padding: 0.65rem 0.75rem; }
          .inp { height: 42px; font-size: 0.9rem; }
          .inp-send, .inp-attach { width: 40px; height: 40px; }
          .ws-section { padding: 3rem 1rem 4rem; }
          .ws-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .ws-card { padding: 1.25rem 1rem; }
          .ws-card-logo { width: 64px; height: 64px; padding: 8px; }
        }
        @media (max-width:480px) {
          .ws-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        }
      `}</style>
    </>
  );
}
