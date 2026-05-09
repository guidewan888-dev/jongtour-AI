"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ExternalLink, Star } from "lucide-react";

const allWholesalePartners = [
  {
    name: "Let's Go",
    code: "letsgo",
    logo: "/images/logos/download.png",
    description: "โฮลเซลชั้นนำด้านทัวร์เอเชีย ยุโรป และตะวันออกกลาง กว่า 30 ปี",
    tourCount: 120,
    rating: 4.8,
    tags: ["เอเชีย", "ยุโรป", "ตะวันออกกลาง"],
  },
  {
    name: "Go365",
    code: "go365",
    logo: "/images/logos/download.jfif",
    description: "บริการทัวร์ครบวงจร ทั้งกรุ๊ปทัวร์และไพรเวทกรุ๊ป ทั่วโลก",
    tourCount: 95,
    rating: 4.7,
    tags: ["เกาหลี", "ญี่ปุ่น", "จีน"],
  },
  {
    name: "Checkin Group",
    code: "checkin",
    logo: "/images/logos/CH7.jpg",
    description: "ผู้เชี่ยวชาญทัวร์เอเชียตะวันออก และเส้นทางยอดนิยมราคาคุ้มค่า",
    tourCount: 80,
    rating: 4.6,
    tags: ["ฮ่องกง", "ญี่ปุ่น", "ไต้หวัน"],
  },
  {
    name: "Tour Factory",
    code: "tour-factory",
    logo: "/images/logos/Tour-Factory.jpg",
    description: "โฮลเซลคุณภาพ เน้นโปรแกรมทัวร์พรีเมียมและ Luxury",
    tourCount: 65,
    rating: 4.9,
    tags: ["ยุโรป", "ออสเตรเลีย", "แอฟริกา"],
  },
  {
    name: "World Connection",
    code: "worldconnection",
    logo: "/images/logos/worldconnection.png",
    description: "โฮลเซลพรีเมี่ยม เชื่อมต่อทุกเส้นทางทั่วโลก ยุโรป เอเชีย และตะวันออกกลาง",
    tourCount: 282,
    rating: 4.8,
    tags: ["ยุโรป", "เอเชีย", "ตะวันออกกลาง"],
  },
  {
    name: "Best International",
    code: "bestinternational",
    logo: "/images/logos/Bestinternational.png",
    description: "โฮลเซลระดับนานาชาติ ครอบคลุมทุกทวีป บริการเกรดพรีเมียม",
    tourCount: 90,
    rating: 4.8,
    tags: ["ยุโรป", "สแกนดิเนเวีย", "รัสเซีย"],
  },
  {
    name: "GS25",
    code: "gs25",
    logo: "/images/logos/GS Group.png",
    description: "ทัวร์คุณภาพราคามิตรภาพ เส้นทางยอดนิยมพร้อมดูแลทุกขั้นตอน",
    tourCount: 55,
    rating: 4.4,
    tags: ["เกาหลี", "ญี่ปุ่น", "จีน"],
  },
  {
    name: "iTravels Center",
    code: "itravels",
    logo: "/images/logos/itravels.png",
    description: "ศูนย์รวมทัวร์ต่างประเทศ ครบทุกเส้นทาง ญี่ปุ่น จีน ยุโรป อเมริกา ราคาดีที่สุด",
    tourCount: 54,
    rating: 4.7,
    tags: ["ญี่ปุ่น", "จีน", "ยุโรป"],
  },
];

export default function WholesalePage() {
  const [search, setSearch] = useState("");
  const filtered = allWholesalePartners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search))
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#fdf8f3 0%,#fff 30%,#f8fafc 100%)" }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors no-underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>

        <div className="text-center mb-10">
          <p className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-slate-400 mb-2">
            OFFICIAL WHOLESALE PARTNERS
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            โฮลเซลพาร์ทเนอร์ทั้งหมด
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            รวมโฮลเซลชั้นนำที่ให้บริการทัวร์ต่างประเทศผ่านแพลตฟอร์ม Jongtour — ครอบคลุมทุกเส้นทางทั่วโลก
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาโฮลเซล..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Partner Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <Link
              key={p.code}
              href={`/wholesaler/${p.code}`}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden no-underline transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-orange-200"
            >
              {/* Logo Area */}
              <div className="flex items-center justify-center py-8 px-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 group-hover:from-orange-50 group-hover:to-white transition-colors">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <img src={p.logo} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">{p.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{p.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[0.65rem] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-600">{p.rating}</span>
                  </div>
                  <span>{p.tourCount}+ โปรแกรม</span>
                </div>
              </div>
              {/* CTA */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-orange-50 transition-colors">
                <span className="text-xs font-semibold text-orange-500">ดูทัวร์ทั้งหมด</span>
                <ExternalLink className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-500">ไม่พบโฮลเซลที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
