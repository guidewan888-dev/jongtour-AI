"use client";

import React from "react";
import Link from "next/link";

const regions = [
  {
    name: "เอเชีย",
    emoji: "🌏",
    countries: [
      { name: "ญี่ปุ่น", slug: "japan", flag: "🇯🇵" },
      { name: "เกาหลี", slug: "south-korea", flag: "🇰🇷" },
      { name: "จีน", slug: "china", flag: "🇨🇳" },
      { name: "ไต้หวัน", slug: "taiwan", flag: "🇹🇼" },
      { name: "เวียดนาม", slug: "vietnam", flag: "🇻🇳" },
      { name: "สิงคโปร์", slug: "singapore", flag: "🇸🇬" },
      { name: "มาเลเซีย", slug: "malaysia", flag: "🇲🇾" },
      { name: "อินเดีย", slug: "india", flag: "🇮🇳" },
    ],
  },
  {
    name: "ยุโรป",
    emoji: "🏰",
    countries: [
      { name: "อิตาลี", slug: "italy", flag: "🇮🇹" },
      { name: "ฝรั่งเศส", slug: "france", flag: "🇫🇷" },
      { name: "สวิตเซอร์แลนด์", slug: "switzerland", flag: "🇨🇭" },
      { name: "อังกฤษ", slug: "united-kingdom", flag: "🇬🇧" },
      { name: "สเปน", slug: "spain", flag: "🇪🇸" },
      { name: "เยอรมัน", slug: "germany", flag: "🇩🇪" },
    ],
  },
  {
    name: "ตะวันออกกลาง & แอฟริกา",
    emoji: "🕌",
    countries: [
      { name: "อียิปต์", slug: "egypt", flag: "🇪🇬" },
      { name: "ตุรกี", slug: "turkey", flag: "🇹🇷" },
      { name: "จอร์เจีย", slug: "georgia", flag: "🇬🇪" },
      { name: "ดูไบ", slug: "dubai", flag: "🇦🇪" },
      { name: "จอร์แดน", slug: "jordan", flag: "🇯🇴" },
    ],
  },
  {
    name: "อเมริกา & โอเชียเนีย",
    emoji: "🗽",
    countries: [
      { name: "อเมริกา", slug: "usa", flag: "🇺🇸" },
      { name: "แคนาดา", slug: "canada", flag: "🇨🇦" },
      { name: "ออสเตรเลีย", slug: "australia", flag: "🇦🇺" },
      { name: "นิวซีแลนด์", slug: "new-zealand", flag: "🇳🇿" },
    ],
  },
];

export default function DestinationsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-orange-50 border-b border-primary-100">
        <div className="g-container py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            🌍 จุดหมายเที่ยวทั้งหมด
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            เลือกประเทศที่คุณสนใจ เรารวบรวมทัวร์จากทุก Wholesale ให้เปรียบเทียบในที่เดียว
          </p>
        </div>
      </section>

      {/* Regions Grid */}
      <section className="g-container py-12">
        <div className="space-y-12">
          {regions.map((region) => (
            <div key={region.name}>
              <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="text-2xl">{region.emoji}</span>
                {region.name}
              </h2>
              <p className="text-sm text-slate-400 mb-5">{region.countries.length} ประเทศ</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {region.countries.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/country/${c.slug}`}
                    className="g-card-interactive flex items-center gap-3 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">{c.flag}</span>
                    <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
