"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ============================================================
   DESTINATION DATA — flags + emoji icons (no photos)
   ============================================================ */

const destinations = [
  { name: "ญี่ปุ่น", slug: "japan", flagCode: "jp", color: "bg-red-50 border-red-100 text-red-700" },
  { name: "เกาหลี", slug: "south-korea", flagCode: "kr", color: "bg-blue-50 border-blue-100 text-blue-700" },
  { name: "จีน", slug: "china", flagCode: "cn", color: "bg-amber-50 border-amber-100 text-amber-700" },
  { name: "ไต้หวัน", slug: "taiwan", flagCode: "tw", color: "bg-sky-50 border-sky-100 text-sky-700" },
  { name: "เวียดนาม", slug: "vietnam", flagCode: "vn", color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
  { name: "ยุโรป", slug: "europe", flagCode: "eu", color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
  { name: "อียิปต์", slug: "egypt", flagCode: "eg", color: "bg-orange-50 border-orange-100 text-orange-700" },
  { name: "ตุรกี", slug: "turkey", flagCode: "tr", color: "bg-rose-50 border-rose-100 text-rose-700" },
  { name: "จอร์เจีย", slug: "georgia", flagCode: "ge", color: "bg-purple-50 border-purple-100 text-purple-700" },
  { name: "อินเดีย", slug: "india", flagCode: "in", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
];

const quickPrompts = [
  { label: "ทัวร์ไฟไหม้", emoji: "🔥", href: "/deals/flash-sale" },
  { label: "ทัวร์ปีใหม่", emoji: "🎉", href: "/search?tag=newyear" },
  { label: "ทัวร์ราคาดี", emoji: "💰", href: "/cheap-tours" },
  { label: "กรุ๊ปส่วนตัว", emoji: "👨‍👩‍👧‍👦", href: "/private-group" },
  { label: "เปรียบเทียบทัวร์", emoji: "⚖️", href: "/compare" },
  { label: "AI แนะนำ", emoji: "✨", href: "/ai-search" },
];

const whyCards = [
  { title: "รวมทุก Wholesale", desc: "เปรียบเทียบราคาจาก 50+ โฮลเซลล์ในที่เดียว", icon: "🏢" },
  { title: "AI ช่วยค้นหา", desc: "บอก AI ว่าอยากไปไหน จะหาทัวร์ที่ใช่ให้ใน 30 วินาที", icon: "🤖" },
  { title: "จองง่าย ปลอดภัย", desc: "จองออนไลน์ ชำระผ่านบัตรหรือโอน ปลอดภัย 100%", icon: "🔒" },
  { title: "ทีมงานคนไทย", desc: "มีทีมงานดูแลตลอดตั้งแต่จองจนกลับบ้าน", icon: "🇹🇭" },
];

export default function TourHomePage() {
  const [query, setQuery] = useState("");

  return (
    <>
      {/* ============================================================
          1. HERO — Clean Google-style with search pill
         ============================================================ */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            ทัวร์ที่ใช่ <span className="text-primary-500">ในแพลตฟอร์มเดียว</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            เปรียบเทียบทัวร์จากทุก Wholesale พร้อม AI ช่วยค้นหาโปรแกรมที่ตรงใจ
          </p>

          {/* Search Pill — Google-style */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="g-search-pill pl-12 pr-32"
                placeholder="ค้นหาทัวร์ เช่น 'ญี่ปุ่น ใบไม้เปลี่ยนสี 5 วัน'"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
                <Link href="/ai-search" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full border border-primary-200 hover:bg-primary-100 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  AI
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="btn-primary text-xs px-4 py-2"
                >
                  ค้นหา
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickPrompts.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="g-chip text-xs"
              >
                <span>{p.emoji}</span>
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. POPULAR DESTINATIONS — Flag grid (no photos!)
         ============================================================ */}
      <section className="g-section bg-background">
        <div className="g-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="g-section-title">จุดหมายยอดฮิต</h2>
              <p className="g-section-subtitle mb-0">เลือกประเทศที่คุณสนใจ</p>
            </div>
            <Link href="/destinations" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:block">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 stagger-children">
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/country/${d.slug}`}
                className={`g-card-interactive flex items-center gap-3 p-4 rounded-2xl border ${d.color}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${d.flagCode}.png`}
                  srcSet={`https://flagcdn.com/w80/${d.flagCode}.png 2x`}
                  width="32"
                  height="24"
                  alt={d.name}
                  className="rounded-sm shadow-sm object-cover"
                  loading="lazy"
                />
                <span className="text-sm font-semibold">{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          3. FLASH SALE — ทัวร์ไฟไหม้
         ============================================================ */}
      <section className="g-section bg-white">
        <div className="g-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="g-section-title">ทัวร์ไฟไหม้</h2>
              </div>
              <p className="g-section-subtitle mb-0">ดีลหลุดจอง ราคาพิเศษสุดๆ ช้าอด!</p>
            </div>
            <Link href="/deals/flash-sale" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:block">
              ดูทั้งหมด →
            </Link>
          </div>

          {/* Empty state */}
          <div className="g-card p-12 text-center">
            <div className="g-empty">
              <span className="text-5xl mb-4">⏰</span>
              <p className="g-empty-title">ยังไม่มีทัวร์ไฟไหม้ในขณะนี้</p>
              <p className="g-empty-desc">ทัวร์ไฟไหม้จะปรากฏที่นี่เมื่อมีโปรแกรมเดินทางด่วนในราคาพิเศษ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. AI SEARCH FEATURE SHOWCASE
         ============================================================ */}
      <section className="g-section bg-primary-50 border-y border-primary-100">
        <div className="g-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-6 border border-primary-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Powered by AI
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
              AI ช่วยหาทัวร์ <span className="text-primary-600">ใน 30 วินาที</span>
            </h2>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              พิมพ์บอกว่าอยากไปไหน งบเท่าไหร่ กี่วัน AI จะค้นหาทัวร์ที่ตรงใจจากทุก Wholesale แล้วแสดงให้เลือกทันที
            </p>

            {/* Example Chat Bubbles */}
            <div className="max-w-md mx-auto space-y-3 mb-8 text-left">
              <div className="flex justify-end">
                <div className="bg-primary-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm max-w-[80%]">
                  หาทัวร์ญี่ปุ่นให้หน่อย ไปกัน 2 คน งบประมาณ 4 หมื่น ช่วงปีใหม่
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm max-w-[80%] text-slate-700">
                  พบ 12 โปรแกรมที่ตรงกับความต้องการ ราคาเริ่มต้น ฿32,900/ท่าน ✨
                </div>
              </div>
            </div>

            <Link href="/ai-search" className="btn-primary btn-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              ลองใช้ AI Search เลย
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. WHY JONGTOUR — 4 cards
         ============================================================ */}
      <section className="g-section bg-white">
        <div className="g-container">
          <h2 className="g-section-title text-center">ทำไมต้อง Jongtour?</h2>
          <p className="g-section-subtitle text-center">เหตุผลที่ลูกค้ากว่า 10,000+ เลือกเรา</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {whyCards.map((card) => (
              <div key={card.title} className="g-card p-6 text-center">
                <span className="text-4xl mb-4 block">{card.icon}</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          6. PRIVATE GROUP CTA
         ============================================================ */}
      <section className="g-section bg-background">
        <div className="g-container">
          <div className="g-card-elevated p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-primary-50 to-orange-50 border border-primary-100">
            <div className="flex-1">
              <span className="text-4xl mb-4 block">✈️</span>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">อยากออกแบบทัวร์ส่วนตัว?</h2>
              <p className="text-slate-600 mb-6">
                เลือกประเทศ กำหนดวัน กำหนดงบ แล้วให้ AI ช่วยออกแบบ Itinerary ให้ ส่งให้ทีมขายทำใบเสนอราคาได้ทันที
              </p>
              <Link href="/private-group" className="btn-primary">
                เริ่มออกแบบทริป
              </Link>
            </div>
            <div className="w-full md:w-64 h-48 bg-white/60 rounded-2xl border border-primary-200 flex items-center justify-center">
              <span className="text-6xl">🗺️</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. VISA SERVICE CTA
         ============================================================ */}
      <section className="bg-white py-12">
        <div className="g-container">
          <div className="g-card p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <span className="text-5xl">🛂</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">บริการรับทำวีซ่า</h3>
              <p className="text-sm text-slate-500">ยุ่งยากกับวีซ่า? ให้เราดูแลให้ ครอบคลุมกว่า 10 ประเทศ</p>
            </div>
            <Link href="/visa" className="btn-outline whitespace-nowrap">
              ดูบริการวีซ่า
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. WHOLESALE PARTNERS
         ============================================================ */}
      <section className="py-12 bg-background border-t border-slate-200">
        <div className="g-container text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            เรารวบรวมทัวร์จากโฮลเซลล์ชั้นนำ
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {["LET'GO", "GO365", "CHECK IN", "TOUR FACTORY", "ZEGO", "GO HOLIDAY"].map((name) => (
              <span key={name} className="text-lg font-black tracking-widest text-slate-300 hover:text-primary-400 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          9. CAREER CTA
         ============================================================ */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="g-container text-center">
          <p className="text-sm text-slate-500 mb-2">ร่วมเป็นส่วนหนึ่งของทีม</p>
          <h3 className="text-xl font-bold text-slate-900 mb-4">สมัครเป็นไกด์ / หัวหน้าทัวร์กับ Jongtour</h3>
          <Link href="/careers" className="btn-secondary">
            ดูตำแหน่งที่เปิดรับ
          </Link>
        </div>
      </section>
    </>
  );
}
