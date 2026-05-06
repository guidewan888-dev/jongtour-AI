"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Animated grid background ─────────────────────────── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-400/8 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-primary-500/6 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '4s'}} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
    </div>
  );
}

/* ── Sparkle icon ─────────────────────────── */
function SparkleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

/* ── Data ─────────────────────────── */
const destinations = [
  { name: "ญี่ปุ่น", slug: "asia/japan", flagCode: "jp", tours: "61 โปรแกรม" },
  { name: "จีน", slug: "asia/china", flagCode: "cn", tours: "85 โปรแกรม" },
  { name: "เกาหลี", slug: "asia/south-korea", flagCode: "kr", tours: "42 โปรแกรม" },
  { name: "เวียดนาม", slug: "asia/vietnam", flagCode: "vn", tours: "28 โปรแกรม" },
  { name: "ไต้หวัน", slug: "asia/taiwan", flagCode: "tw", tours: "15 โปรแกรม" },
  { name: "ตุรกี", slug: "europe/turkey", flagCode: "tr", tours: "18 โปรแกรม" },
  { name: "อียิปต์", slug: "europe/egypt", flagCode: "eg", tours: "12 โปรแกรม" },
  { name: "ยุโรป", slug: "europe", flagCode: "eu", tours: "30 โปรแกรม" },
];

const wholesalePartners = [
  { name: "Let's Go", code: "letsgo", logo: "/images/logos/download.png", textColor: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-100" },
  { name: "Go365", code: "go365", logo: "/images/logos/download.jfif", textColor: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-100" },
  { name: "Checkin Group", code: "checkin", logo: "/images/logos/CH7.jpg", textColor: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-100" },
  { name: "Tour Factory", code: "tour-factory", logo: "/images/logos/Tour-Factory.jpg", textColor: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-100" },
];

const aiExamples = [
  "ทัวร์ญี่ปุ่น ใบไม้เปลี่ยนสี 5 วัน งบ 4 หมื่น",
  "ทัวร์จีน เฉิงตู จิ่วจ้ายโกว 6 วัน",
  "ทัวร์เกาหลี ปีใหม่ บินตรง",
  "ทัวร์ตุรกี คัปปาโดเกีย บอลลูน",
];

/* ── Main Page ─────────────────────────── */
export default function TourHomePage() {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIdx, setExampleIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Typewriter placeholder effect
  useEffect(() => {
    const example = aiExamples[exampleIdx];
    let charIdx = 0;
    setIsTyping(true);
    setPlaceholder("");

    const typeInterval = setInterval(() => {
      if (charIdx <= example.length) {
        setPlaceholder(example.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setExampleIdx((prev) => (prev + 1) % aiExamples.length);
        }, 2500);
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, [exampleIdx]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          HERO — AI Search-First, Clean & Futuristic
         ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white min-h-[80vh] flex items-center justify-center overflow-hidden">
        <AnimatedGrid />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-20 md:py-28">
          {/* Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-bold mb-6">
              <SparkleIcon className="w-3.5 h-3.5" />
              AI-Powered Tour Search
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
              ค้นหาทัวร์ที่ใช่
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                ด้วยพลัง AI
              </span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-lg mx-auto">
              รวมทัวร์จาก 4 โฮลเซลชั้นนำ กว่า 300+ โปรแกรม
              <br className="hidden md:block" />
              เปรียบเทียบราคา จองง่าย ได้ทัวร์ที่ตรงใจ
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-orange-400 to-amber-400 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-500" />
            <div className="relative bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 group-focus-within:border-primary-300 transition-all overflow-hidden">
              <div className="flex items-center">
                <div className="pl-5 flex items-center">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-4 md:py-5 text-base md:text-lg text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                  placeholder={placeholder + (isTyping ? '|' : '')}
                />
                <div className="flex items-center gap-2 pr-2">
                  <Link href="/ai-search" className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-primary-50 to-orange-50 text-primary-600 text-xs font-bold rounded-xl border border-primary-100 hover:from-primary-100 hover:to-orange-100 transition-all">
                    <SparkleIcon className="w-3.5 h-3.5" />
                    AI
                  </Link>
                  <button
                    onClick={handleSearch}
                    className="px-5 py-2 md:py-2.5 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-orange-600 transition-all shadow-sm"
                  >
                    ค้นหา
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "ทัวร์ไฟไหม้", icon: "🔥", href: "/deals/flash-sale" },
              { label: "ทัวร์ราคาดี", icon: "💰", href: "/cheap-tours" },
              { label: "กรุ๊ปส่วนตัว", icon: "👥", href: "/private-group" },
              { label: "เปรียบเทียบทัวร์", icon: "⚖️", href: "/compare" },
              { label: "บริการวีซ่า", icon: "🛂", href: "/visa" },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:text-slate-700 transition-all">
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHOLESALE PARTNERS — Logo Grid with Links
         ══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Official Wholesale Partners</p>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wholesalePartners.map(partner => (
              <Link key={partner.code} href={`/wholesaler/${partner.code}`}
                className={`group relative flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl ${partner.bgColor} border ${partner.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2">
                  <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                </div>
                <h3 className={`text-sm md:text-base font-bold ${partner.textColor}`}>{partner.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1">ดูทัวร์ทั้งหมด →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DESTINATIONS — Clean Flag Grid
         ══════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">จุดหมายยอดนิยม</h2>
              <p className="text-sm text-slate-400 mt-1">เลือกประเทศที่สนใจ</p>
            </div>
            <Link href="/tours/asia" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:block">ดูทั้งหมด →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {destinations.map(d => (
              <Link key={d.slug} href={`/tours/${d.slug}`}
                className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200">
                <img
                  src={`https://flagcdn.com/w80/${d.flagCode}.png`}
                  width="36" height="27" alt={d.name}
                  className="rounded-sm shadow-sm group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{d.name}</p>
                  <p className="text-[10px] text-slate-400">{d.tours}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          AI FEATURE SHOWCASE — Dark Contrast Section
         ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-primary-300 text-xs font-bold mb-6 border border-white/10">
                <SparkleIcon className="w-3.5 h-3.5" />
                Powered by AI
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                บอก AI ว่าอยากไปไหน
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">จะหาให้ใน 30 วินาที</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
                พิมพ์ภาษาคนได้เลย — งบเท่าไหร่ กี่วัน ชอบอะไร AI จะเข้าใจแล้วค้นจากทุกโฮลเซลให้
              </p>
              <Link href="/ai-search" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg shadow-primary-500/30">
                <SparkleIcon className="w-4 h-4" />
                ลองใช้ AI Search
              </Link>
            </div>

            {/* Right — Mock Chat */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
                  <SparkleIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Jongtour AI</p>
                  <p className="text-[10px] text-slate-500">Online • พร้อมช่วย</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary-500 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm max-w-[85%]">
                    หาทัวร์ญี่ปุ่นให้หน่อย ไปกัน 2 คน งบ 4 หมื่น ช่วงปีใหม่
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[85%] text-slate-300">
                    พบ <span className="text-primary-400 font-bold">12 โปรแกรม</span> ที่ตรง! ราคาเริ่ม ฿32,900 จาก 3 โฮลเซล ✨
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[85%] text-slate-300">
                    แนะนำ: <span className="text-amber-400">โตเกียว-โอซาก้า 5D3N</span> บิน Thai AirAsia X ✈️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY JONGTOUR — Glass cards
         ══════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-2">ทำไมต้อง Jongtour?</h2>
          <p className="text-sm text-slate-400 text-center mb-8">แพลตฟอร์มที่ลูกค้ากว่า 10,000+ ไว้วางใจ</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "🤖", title: "AI ค้นหาทัวร์", desc: "บอกภาษาคน AI หาให้ใน 30 วินาที" },
              { icon: "🏢", title: "รวมทุก Wholesale", desc: "เปรียบเทียบราคาจาก 4+ โฮลเซล" },
              { icon: "🔒", title: "จองง่าย ปลอดภัย", desc: "ชำระผ่านบัตรหรือโอน ปลอดภัย 100%" },
              { icon: "🇹🇭", title: "ทีมงานคนไทย", desc: "ดูแลตั้งแต่จองจนกลับบ้าน" },
            ].map(card => (
              <div key={card.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200">
                <span className="text-3xl mb-3 block">{card.icon}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{card.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
