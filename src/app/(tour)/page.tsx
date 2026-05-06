"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Data ─────────────────────────── */
const destinations = [
  { name: "ญี่ปุ่น", slug: "asia/japan", flagCode: "jp", tours: "61 โปรแกรม", bg: "linear-gradient(135deg, #fff1f2, #fce7f3)", borderColor: "#ffe4e6" },
  { name: "จีน", slug: "asia/china", flagCode: "cn", tours: "85 โปรแกรม", bg: "linear-gradient(135deg, #fef2f2, #fff7ed)", borderColor: "#fecaca" },
  { name: "เกาหลี", slug: "asia/south-korea", flagCode: "kr", tours: "42 โปรแกรม", bg: "linear-gradient(135deg, #eff6ff, #eef2ff)", borderColor: "#bfdbfe" },
  { name: "เวียดนาม", slug: "asia/vietnam", flagCode: "vn", tours: "28 โปรแกรม", bg: "linear-gradient(135deg, #fffbeb, #fefce8)", borderColor: "#fde68a" },
  { name: "ไต้หวัน", slug: "asia/taiwan", flagCode: "tw", tours: "15 โปรแกรม", bg: "linear-gradient(135deg, #f0f9ff, #ecfeff)", borderColor: "#bae6fd" },
  { name: "ตุรกี", slug: "europe/turkey", flagCode: "tr", tours: "18 โปรแกรม", bg: "linear-gradient(135deg, #fef2f2, #fff1f2)", borderColor: "#fecaca" },
  { name: "อียิปต์", slug: "africa/egypt", flagCode: "eg", tours: "12 โปรแกรม", bg: "linear-gradient(135deg, #fffbeb, #fff7ed)", borderColor: "#fde68a" },
  { name: "ยุโรป", slug: "europe", flagCode: "eu", tours: "30 โปรแกรม", bg: "linear-gradient(135deg, #eef2ff, #f5f3ff)", borderColor: "#c7d2fe" },
];

const wholesalePartners = [
  { name: "Let's Go", code: "letsgo", logo: "/images/logos/download.png", accent: "hover:border-green-300 hover:bg-green-50/50" },
  { name: "Go365", code: "go365", logo: "/images/logos/download.jfif", accent: "hover:border-blue-300 hover:bg-blue-50/50" },
  { name: "Checkin Group", code: "checkin", logo: "/images/logos/CH7.jpg", accent: "hover:border-teal-300 hover:bg-teal-50/50" },
  { name: "Tour Factory", code: "tour-factory", logo: "/images/logos/Tour-Factory.jpg", accent: "hover:border-purple-300 hover:bg-purple-50/50" },
];

const aiExamples = [
  "ทัวร์ญี่ปุ่น ใบไม้เปลี่ยนสี 5 วัน งบ 4 หมื่น",
  "ทัวร์จีน เฉิงตู จิ่วจ้ายโกว 6 วัน",
  "ทัวร์เกาหลี ปีใหม่ บินตรง",
  "ทัวร์ตุรกี คัปปาโดเกีย บอลลูน",
];

const continents = [
  { name: "เอเชีย", slug: "asia", count: "200+", icon: "🌏" },
  { name: "ยุโรป", slug: "europe", count: "30+", icon: "🏰" },
  { name: "แอฟริกา & ตะวันออกกลาง", slug: "africa", count: "20+", icon: "🏜️" },
  { name: "อเมริกา", slug: "americas", count: "10+", icon: "🗽" },
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
        setTimeout(() => setExampleIdx((prev) => (prev + 1) % aiExamples.length), 2500);
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, [exampleIdx]);

  const handleSearch = () => {
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle warm gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-primary-500/[0.06] via-orange-400/[0.04] to-amber-300/[0.03] rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-orange-50 border border-primary-100/80 text-primary-600 text-xs font-bold mb-6 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI-Powered Tour Search
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
              ค้นหาทัวร์ที่ใช่
              <br />
              <span className="bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                ด้วยพลัง AI
              </span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              รวมทัวร์จาก 4 โฮลเซลชั้นนำ กว่า 300+ โปรแกรม
              <br className="hidden md:block" />
              เปรียบเทียบราคา จองง่าย ได้ทัวร์ที่ตรงใจ
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400/60 via-orange-400/60 to-amber-400/60 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
            <div className="relative bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 group-focus-within:border-primary-200 group-focus-within:shadow-xl group-focus-within:shadow-primary-100/30 transition-all duration-300 overflow-hidden">
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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-4 md:py-5 text-base md:text-lg text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                  placeholder={placeholder + (isTyping ? "|" : "")}
                />
                <div className="flex items-center gap-2 pr-2.5">
                  <Link href="/ai-search" className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-primary-50 to-orange-50 text-primary-600 text-xs font-bold rounded-xl border border-primary-100 hover:from-primary-100 hover:to-orange-100 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI
                  </Link>
                  <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
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
              { label: "บริการวีซ่า", icon: "📋", href: "/visa" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-500 bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all shadow-sm"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHOLESALE PARTNERS ══════════ */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Official Wholesale Partners</p>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">รวมทัวร์จากโฮลเซลชั้นนำ</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wholesalePartners.map((p) => (
              <Link
                key={p.code}
                href={`/wholesaler/${p.code}`}
                className={`group flex flex-col items-center justify-center p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${p.accent}`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300 overflow-hidden p-2">
                  <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{p.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-primary-500 transition-colors">ดูทัวร์ทั้งหมด →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ DESTINATIONS ══════════ */}
      <section className="bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">จุดหมายยอดนิยม</h2>
              <p className="text-sm text-slate-400 mt-0.5">เลือกประเทศที่สนใจ</p>
            </div>
            <Link href="/tours/asia" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:flex items-center gap-1">
              ดูทั้งหมด
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/tours/${d.slug}`}
                className="group flex items-center gap-3 p-3.5 rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: d.bg, borderColor: d.borderColor }}
              >
                <img
                  src={`https://flagcdn.com/w80/${d.flagCode}.png`}
                  width="36"
                  height="27"
                  alt={d.name}
                  className="rounded-[4px] shadow-sm group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{d.name}</p>
                  <p className="text-[10px] text-slate-500">{d.tours}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Continents Row */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {continents.map((c) => (
              <Link
                key={c.slug}
                href={`/tours/${c.slug}`}
                className="group flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-xl">{c.icon}</span>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.count} โปรแกรม</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AI FEATURE SHOWCASE ══════════ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-primary-300 text-xs font-bold mb-5 border border-white/10">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Powered by AI
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                บอก AI ว่าอยากไปไหน
                <br />
                <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">
                  จะหาให้ใน 30 วินาที
                </span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-6 leading-relaxed">
                พิมพ์ภาษาคนได้เลย — งบเท่าไหร่ กี่วัน ชอบอะไร
                <br />
                AI จะเข้าใจแล้วค้นจากทุกโฮลเซลให้
              </p>
              <Link
                href="/ai-search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                ลองใช้ AI Search
              </Link>
            </div>

            {/* Mock Chat */}
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Jongtour AI</p>
                  <p className="text-[10px] text-slate-500">Online</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-end">
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-2xl rounded-br-sm text-sm max-w-[85%]">
                    หาทัวร์ญี่ปุ่นให้หน่อย ไปกัน 2 คน งบ 4 หมื่น ช่วงปีใหม่
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[85%] text-slate-300">
                    พบ <span className="text-primary-400 font-bold">12 โปรแกรม</span> ที่ตรง! ราคาเริ่ม ฿32,900 จาก 3 โฮลเซล
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[85%] text-slate-300">
                    แนะนำ: <span className="text-amber-400">โตเกียว-โอซาก้า 5D3N</span> บิน Thai AirAsia X
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WHY JONGTOUR ══════════ */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 text-center mb-1.5">ทำไมต้อง Jongtour?</h2>
          <p className="text-sm text-slate-400 text-center mb-8">แพลตฟอร์มที่ลูกค้ากว่า 10,000+ ไว้วางใจ</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "🤖", title: "AI ค้นหาทัวร์", desc: "บอกภาษาคน AI หาให้ใน 30 วินาที" },
              { icon: "🏢", title: "รวมทุก Wholesale", desc: "เปรียบเทียบราคาจาก 4+ โฮลเซล" },
              { icon: "🔒", title: "จองง่าย ปลอดภัย", desc: "ชำระผ่านบัตรหรือโอน ปลอดภัย 100%" },
              { icon: "🇹🇭", title: "ทีมงานคนไทย", desc: "ดูแลตั้งแต่จองจนกลับบ้าน" },
            ].map((card) => (
              <div
                key={card.title}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 text-center hover:bg-white hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-2xl mb-2.5 block">{card.icon}</span>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{card.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
