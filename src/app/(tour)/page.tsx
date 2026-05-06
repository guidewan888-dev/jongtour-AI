"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Paperclip, Sparkles, ChevronDown, Headphones } from "lucide-react";

/* ── Wholesale Partners ─────────────────────────── */
const wholesalePartners = [
  { name: "Let's Go", code: "letsgo", logo: "/images/logos/download.png" },
  { name: "Check In Group", code: "checkin", logo: "/images/logos/CH7.jpg" },
  { name: "Go365", code: "go365", logo: "/images/logos/download.jfif" },
  { name: "Tour Factory", code: "tour-factory", logo: "/images/logos/Tour-Factory.jpg" },
];

/* ── Quick Actions ─────────────────────────── */
const quickActions = [
  { icon: "📋", label: "จัดทริปแนะนำ" },
  { icon: "💰", label: "ขอใบเสนอราคา" },
  { icon: "⚖️", label: "เปรียบเทียบโปรแกรม" },
];

/* ── Main Page ─────────────────────────── */
export default function TourHomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; time: string }[]>([
    {
      role: "ai",
      text: "ได้เลย! ฉันช่วยค้นหา เปรียบเทียบ\nและแนะนำโปรแกรมทัวร์ที่ดีที่สุดให้คุณได้",
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = {
      role: "user" as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          chatHistory: messages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const raw = await res.text();
      const replyText = raw.replace(/__DATA__.*?__DATA__/g, "").trim();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: replyText || "ขออภัยครับ ไม่สามารถตอบได้ในขณะนี้",
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <section className="hero-section">
      {/* ── Decorative Elements ── */}
      <div className="hero-deco-blob hero-deco-blob--1" />
      <div className="hero-deco-blob hero-deco-blob--2" />
      <div className="hero-deco-line hero-deco-line--1" />
      <div className="hero-deco-line hero-deco-line--2" />
      <div className="hero-deco-sparkle hero-deco-sparkle--1">✦</div>
      <div className="hero-deco-sparkle hero-deco-sparkle--2">✦</div>
      <div className="hero-deco-sparkle hero-deco-sparkle--3">+</div>

      {/* ── Title ── */}
      <div className="hero-title-block">
        <div className="hero-sparkle-icon">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="hero-title">
          Smart <span className="hero-title--accent">Tour</span> Search
        </h1>
        <p className="hero-subtitle">ค้นหาทัวร์ที่ใช่ ด้วย AI ที่เข้าใจคุณ</p>
      </div>

      {/* ── Inline Chat Card ── */}
      <div className="chat-card">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header__left">
            <div className="chat-avatar">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="chat-header__name">Jongtour AI Assistant</span>
              <span className="chat-header__badge">Online</span>
            </div>
          </div>
          <div className="chat-header__right">
            <button className="chat-header__icon-btn" aria-label="Support">
              <Headphones className="w-4 h-4" />
            </button>
            <button className="chat-header__icon-btn" aria-label="Collapse">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chat-quick-actions">
          {quickActions.map((a) => (
            <button
              key={a.label}
              className="chat-chip"
              onClick={() => sendMessage(a.label)}
            >
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role === "user" ? "chat-msg--user" : "chat-msg--ai"}`}>
              {msg.role === "ai" && (
                <div className="chat-msg__avatar">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`chat-msg__bubble ${msg.role === "user" ? "chat-msg__bubble--user" : "chat-msg__bubble--ai"}`}>
                <p className="chat-msg__text">{msg.text}</p>
                <span className="chat-msg__time">
                  {msg.time}
                  {msg.role === "user" && <span className="chat-msg__check">✓✓</span>}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-msg__avatar">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="chat-msg__bubble chat-msg__bubble--ai">
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <button className="chat-input-attach" aria-label="Attach">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="พิมพ์ข้อความหรือสอบถามได้เลย..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
          />
          <button
            className="chat-input-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Wholesale Partners ── */}
      <div className="wholesale-row">
        {wholesalePartners.map((p) => (
          <Link key={p.code} href={`/wholesaler/${p.code}`} className="wholesale-item">
            <div className="wholesale-logo">
              <img src={p.logo} alt={p.name} loading="lazy" />
            </div>
            <span className="wholesale-name">{p.name}</span>
          </Link>
        ))}
        <Link href="/tours/asia" className="wholesale-item">
          <div className="wholesale-logo wholesale-logo--more">
            <span>•••</span>
          </div>
          <span className="wholesale-name">More</span>
        </Link>
      </div>

      {/* ── Scoped CSS ── */}
      <style jsx>{`
        /* ═══════════ HERO SECTION ═══════════ */
        .hero-section {
          position: relative;
          min-height: calc(100vh - 64px - 200px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem 3rem;
          overflow: hidden;
          background: #fafafa;
        }

        /* ── Decorative Blobs ── */
        .hero-deco-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .hero-deco-blob--1 {
          width: 500px; height: 500px;
          top: -120px; right: -80px;
          background: radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%);
        }
        .hero-deco-blob--2 {
          width: 400px; height: 400px;
          bottom: -80px; left: -60px;
          background: radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%);
        }

        /* ── Decorative Lines ── */
        .hero-deco-line {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        .hero-deco-line--1 {
          top: 30%;
          left: 8%;
          width: 180px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent);
          transform: rotate(-20deg);
        }
        .hero-deco-line--2 {
          top: 50%;
          right: 6%;
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent);
          transform: rotate(15deg);
        }

        /* ── Decorative Sparkles ── */
        .hero-deco-sparkle {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          color: rgba(249,115,22,0.18);
          font-size: 1.2rem;
          animation: sparkle-float 6s ease-in-out infinite;
        }
        .hero-deco-sparkle--1 { top: 15%; left: 18%; animation-delay: 0s; }
        .hero-deco-sparkle--2 { top: 25%; right: 15%; animation-delay: 2s; }
        .hero-deco-sparkle--3 { bottom: 20%; left: 12%; font-size: 1rem; color: rgba(0,0,0,0.08); animation-delay: 4s; }

        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-12px) rotate(15deg); opacity: 1; }
        }

        /* ═══════════ TITLE ═══════════ */
        .hero-title-block {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 2rem;
        }
        .hero-sparkle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        }
        .hero-title {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 900;
          color: #1e293b;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0;
        }
        .hero-title--accent {
          background: linear-gradient(135deg, #f97316, #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1rem;
          color: #94a3b8;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* ═══════════ CHAT CARD ═══════════ */
        .chat-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          margin-bottom: 2.5rem;
        }

        /* ── Chat Header ── */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .chat-header__left {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .chat-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
        }
        .chat-header__name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
          display: block;
          line-height: 1.2;
        }
        .chat-header__badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: #22c55e;
          padding: 1px 6px;
          border-radius: 9px;
          background: #f0fdf4;
          display: inline-block;
          margin-top: 2px;
        }
        .chat-header__right {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .chat-header__icon-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .chat-header__icon-btn:hover {
          background: #f1f5f9;
          color: #64748b;
        }

        /* ── Quick Actions ── */
        .chat-quick-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .chat-quick-actions::-webkit-scrollbar { display: none; }
        .chat-chip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .chat-chip:hover {
          background: #fff7ed;
          border-color: #fed7aa;
          color: #ea580c;
        }

        /* ── Messages ── */
        .chat-messages {
          max-height: 240px;
          overflow-y: auto;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .chat-msg {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
        }
        .chat-msg--user {
          flex-direction: row-reverse;
        }
        .chat-msg__avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chat-msg__bubble {
          max-width: 80%;
          padding: 0.625rem 0.875rem;
          border-radius: 1rem;
          position: relative;
        }
        .chat-msg__bubble--ai {
          background: #f1f5f9;
          border-bottom-left-radius: 4px;
          color: #334155;
        }
        .chat-msg__bubble--user {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-bottom-right-radius: 4px;
          color: white;
        }
        .chat-msg__text {
          font-size: 0.8125rem;
          line-height: 1.5;
          margin: 0;
          white-space: pre-line;
        }
        .chat-msg__time {
          display: block;
          font-size: 0.625rem;
          margin-top: 4px;
          opacity: 0.6;
        }
        .chat-msg__check {
          margin-left: 3px;
          color: rgba(255,255,255,0.7);
          font-size: 0.6rem;
        }

        /* Typing indicator */
        .chat-typing {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }
        .chat-typing span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typing-dot 1.4s ease-in-out infinite;
        }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* ── Input Bar ── */
        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
        }
        .chat-input-attach {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .chat-input-attach:hover {
          background: #f1f5f9;
          color: #64748b;
        }
        .chat-input {
          flex: 1;
          height: 40px;
          padding: 0 0.75rem;
          font-size: 0.8125rem;
          color: #334155;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          outline: none;
          transition: border-color 0.15s;
        }
        .chat-input::placeholder {
          color: #94a3b8;
        }
        .chat-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }
        .chat-input-send {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
        }
        .chat-input-send:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(249,115,22,0.4);
        }
        .chat-input-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ═══════════ WHOLESALE ROW ═══════════ */
        .wholesale-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .wholesale-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .wholesale-item:hover {
          transform: translateY(-3px);
        }
        .wholesale-logo {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .wholesale-item:hover .wholesale-logo {
          border-color: #fed7aa;
          box-shadow: 0 4px 12px rgba(249,115,22,0.12);
        }
        .wholesale-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }
        .wholesale-logo--more {
          background: #f1f5f9;
          font-size: 1.2rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .wholesale-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 640px) {
          .hero-section {
            padding: 1.5rem 0.75rem 2rem;
          }
          .hero-title {
            font-size: 2rem;
          }
          .chat-card {
            max-width: 100%;
          }
          .wholesale-row {
            gap: 1.25rem;
          }
          .wholesale-logo {
            width: 48px; height: 48px;
          }
        }
      `}</style>
    </section>
  );
}
