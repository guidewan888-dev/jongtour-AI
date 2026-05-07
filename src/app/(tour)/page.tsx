"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Paperclip, Sparkles, ChevronDown, Headphones } from "lucide-react";
import s from "./home.module.css";

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

export default function TourHomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePartner, setActivePartner] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Set initial message client-side to avoid hydration mismatch
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
      <section className={s.heroWrap}>
        <div className={`${s.deco} ${s.deco1}`} />
        <div className={`${s.deco} ${s.deco2}`} />
        <div className={`${s.decoDot} ${s.decoDot1}`}>✦</div>
        <div className={`${s.decoDot} ${s.decoDot2}`}>✦</div>
        <div className={`${s.decoDot} ${s.decoDot3}`}>+</div>
        <div className={`${s.decoRing} ${s.decoRing1}`} />
        <div className={`${s.decoRing} ${s.decoRing2}`} />

        {/* Title */}
        <div className={s.heroTop}>
          <div className={s.aiPulse}><Sparkles className="w-6 h-6" /></div>
          <p className={s.heroTag}>✦ AI-POWERED SEARCH ENGINE</p>
          <h1 className={s.heroH1}>
            <span className={s.h1Sm}>Smart</span>
            <span className={s.h1Big}>Tour Search</span>
          </h1>
          <p className={s.heroSub}>ค้นหาทัวร์ที่ใช่จาก 50+ โฮลเซล — ด้วย AI ที่เข้าใจคุณ</p>
        </div>

        {/* Chat Card */}
        <div className={s.card}>
          <div className={s.cardGlow} />
          <div className={s.cardHead}>
            <div className={s.cardHeadL}>
              <div className={s.aiAv}><Sparkles className="w-5 h-5 text-white" /></div>
              <div>
                <span className={s.aiName}>Jongtour AI Assistant</span>
                <span className={s.aiOnline}>Online</span>
              </div>
            </div>
            <div className={s.cardHeadR}>
              <button className={s.hdBtn} aria-label="Support"><Headphones className="w-5 h-5" /></button>
              <button className={s.hdBtn} aria-label="Toggle"><ChevronDown className="w-5 h-5" /></button>
            </div>
          </div>

          <div className={s.chipsRow}>
            {quickActions.map((a) => (
              <button key={a.label} className={s.chip} onClick={() => send(a.label)}>
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          <div className={s.msgs}>
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`${s.msg} ${m.role === "user" ? s.msgU : ""}`}>
                  {m.role === "ai" && <div className={s.msgAv}><Sparkles className="w-4 h-4 text-white" /></div>}
                  <div className={`${s.bubble} ${m.role === "user" ? s.bubbleU : s.bubbleA}`}>
                    <p className={s.btxt}>{m.text}</p>
                    <span className={s.btime}>{m.time}{m.role === "user" && <span className={s.bchk}>✓✓</span>}</span>
                  </div>
                </div>
                {m.tours && m.tours.length > 0 && (
                  <div className={s.tourCards}>
                    {m.tours.slice(0, 5).map((t) => (
                      <Link key={t.id} href={`/tours/detail/${t.slug || t.id}`} className={s.tourCard}>
                        <div className={s.tcLeft}>
                          <p className={s.tcTitle}>{t.title}</p>
                          <p className={s.tcMeta}>{t.durationDays ? `${t.durationDays} วัน` : ""}</p>
                        </div>
                        <div className={s.tcPrice}>{t.price ? `฿${Number(t.price).toLocaleString()}` : ""}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={`${s.msg}`}>
                <div className={s.msgAv}><Sparkles className="w-4 h-4 text-white" /></div>
                <div className={`${s.bubble} ${s.bubbleA}`}><div className={s.typing}><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className={s.inpBar}>
            <button className={s.inpAttach} aria-label="Attach"><Paperclip className="w-6 h-6" /></button>
            <input
              type="text"
              className={s.inp}
              placeholder="พิมพ์ข้อความหรือสอบถามได้เลย..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            />
            <button className={s.inpSend} onClick={() => send(input)} disabled={!input.trim() || isLoading} aria-label="Send">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ WHOLESALE PARTNERS ═══ */}
      <section className={s.wsSection}>
        <p className={s.wsLabel}>OFFICIAL WHOLESALE PARTNERS</p>
        <h2 className={s.wsTitle}>รวมทัวร์จากโฮลเซลชั้นนำ</h2>
        <div className={s.wsGrid}>
          {wholesalePartners.map((p, idx) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className={`${s.wsCard} ${activePartner === idx ? s.wsCardActive : ""}`}
              onMouseEnter={() => setActivePartner(idx)}
              style={{ "--partner-color": p.color } as React.CSSProperties}
            >
              <div className={s.wsCardLogo}>
                <img src={p.logo} alt={p.name} loading="lazy" />
              </div>
              <h3 className={s.wsCardName}>{p.name}</h3>
              <span className={s.wsCardLink}>ดูทัวร์ทั้งหมด →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
