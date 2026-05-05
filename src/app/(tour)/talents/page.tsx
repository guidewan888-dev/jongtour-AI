"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Globe, Heart, SlidersHorizontal, Sparkles } from "lucide-react";

const SPEC = ["เมืองหลวง","ธรรมชาติ","วัฒนธรรม","อาหาร","ถ่ายรูป","ผจญภัย","ครอบครัว","สายมู"];
const TIER_C: Record<string,string> = {
  New:"bg-slate-100 text-slate-600 border border-slate-200",
  Standard:"bg-blue-50 text-blue-700 border border-blue-200",
  Senior:"bg-purple-50 text-purple-700 border border-purple-200",
  Premium:"bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200",
  Elite:"bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
};

const talents = [
  { id:"T-001", name:"พี่ก้อย", photo:"👩‍🦰", tier:"Premium", rating:4.9, reviews:128, langs:["ไทย","อังกฤษ","จีน"], specs:["เมืองหลวง","วัฒนธรรม","อาหาร"], region:"กรุงเทพ", trips:245, bio:"ไกด์มืออาชีพ 10 ปี ชำนาญกรุงเทพและภาคกลาง ได้รับรางวัลไกด์ดีเด่น" },
  { id:"T-002", name:"พี่เจมส์", photo:"👨‍🦱", tier:"Elite", rating:4.95, reviews:210, langs:["ไทย","อังกฤษ","ญี่ปุ่น"], specs:["ธรรมชาติ","ผจญภัย","ถ่ายรูป"], region:"เชียงใหม่", trips:380, bio:"Adventure guide + photographer ชำนาญภาคเหนือ เชี่ยวชาญเชียงใหม่-เชียงราย" },
  { id:"T-003", name:"พี่แนน", photo:"👩", tier:"Senior", rating:4.7, reviews:85, langs:["ไทย","อังกฤษ"], specs:["ครอบครัว","วัฒนธรรม"], region:"ภูเก็ต", trips:120, bio:"Family-friendly guide ภาคใต้ อบอุ่นเป็นกันเอง ดูแลเด็กเก่ง" },
  { id:"T-004", name:"พี่โอ๊ค", photo:"👨", tier:"Standard", rating:4.5, reviews:42, langs:["ไทย","อังกฤษ","เกาหลี"], specs:["อาหาร","สายมู"], region:"กรุงเทพ", trips:65, bio:"Food tour specialist + สายมู วัดดัง ร้านลับกรุงเทพ" },
  { id:"T-005", name:"พี่มิ้นท์", photo:"👩‍🦳", tier:"Premium", rating:4.85, reviews:156, langs:["ไทย","อังกฤษ","ฝรั่งเศส"], specs:["เมืองหลวง","ถ่ายรูป","อาหาร"], region:"กรุงเทพ", trips:290, bio:"Luxury & photography guide กรุงเทพ-หัวหิน ชำนาญ Instagrammable spots" },
  { id:"T-006", name:"พี่บอส", photo:"👨‍💼", tier:"New", rating:4.2, reviews:8, langs:["ไทย","อังกฤษ"], specs:["ธรรมชาติ","ผจญภัย"], region:"กระบี่", trips:12, bio:"ไกด์น้องใหม่ สาย outdoor กระบี่-พังงา-สุราษฎร์" },
];

export default function TalentDirectoryPage() {
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [faved, setFaved] = useState<string[]>([]);
  
  const filtered = talents.filter(t => 
    (!search || t.name.includes(search) || t.bio.includes(search)) && 
    (!specFilter || t.specs.includes(specFilter)) &&
    (!tierFilter || t.tier === tierFilter)
  );

  const toggleFav = (id: string) => setFaved(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  return (
    <div className="g-container py-6 sm:py-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="g-gradient-warm rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary animate-float" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">เลือกไกด์ของคุณ</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl">ดูโปรไฟล์ รีวิว ความชำนาญ แล้วเลือกไกด์ที่ใช่สำหรับทริปของคุณ</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm">👥 {talents.length} ไกด์พร้อมให้บริการ</span>
          <span className="bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm">⭐ Rating เฉลี่ย 4.68</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs sm:text-sm text-amber-800 flex items-start gap-2">
        <span className="text-lg leading-none">⚠️</span>
        <span>การ request ไกด์เป็นแบบ <b>best-effort</b> — ไม่รับประกันว่าจะได้ไกด์ท่านที่เลือก ขึ้นอยู่กับตารางและความพร้อม</span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e=>setSearch(e.target.value)} className="g-search-pill w-full pl-10 pr-4" placeholder="ค้นหาชื่อ ความชำนาญ หรือ keyword..." />
        </div>
        <div className="flex gap-2">
          <select value={specFilter} onChange={e=>setSpecFilter(e.target.value)} className="g-input w-full sm:w-40 rounded-full">
            <option value="">ทุกความชำนาญ</option>
            {SPEC.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} className="g-input w-full sm:w-32 rounded-full">
            <option value="">ทุก Tier</option>
            <option>Standard</option><option>Senior</option><option>Premium</option><option>Elite</option>
          </select>
        </div>
      </div>

      {/* Specialty chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={()=>setSpecFilter("")} className={specFilter === "" ? "g-chip-active" : "g-chip"}>ทั้งหมด</button>
        {SPEC.map(s => (
          <button key={s} onClick={()=>setSpecFilter(s === specFilter ? "" : s)} className={specFilter === s ? "g-chip-active" : "g-chip"}>
            {s}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          พบ <b className="text-slate-900">{filtered.length}</b> ไกด์
          {specFilter && <span> · ความชำนาญ: <b className="text-primary">{specFilter}</b></span>}
        </p>
        <div className="flex gap-1">
          <button className="g-chip text-xs">⭐ Rating สูงสุด</button>
          <button className="g-chip text-xs">🔥 ยอดนิยม</button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((t, i) => (
          <Link key={t.id} href={`/talents/${t.id}`} 
            className="g-card p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            
            {/* Tier ribbon for Elite/Premium */}
            {(t.tier === "Elite" || t.tier === "Premium") && (
              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-xl ${t.tier === "Elite" ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
                {t.tier === "Elite" ? "👑 Elite" : "💎 Premium"}
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl sm:text-5xl drop-shadow-sm">{t.photo}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{t.name}</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_C[t.tier]}`}>{t.tier}</span>
                <span className="text-xs text-slate-400 ml-1">{t.trips} ทริป</span>
              </div>
              <button className={`transition-all duration-300 ${faved.includes(t.id) ? "text-red-400 scale-110" : "text-slate-300 hover:text-red-400"}`} 
                onClick={e=>{e.preventDefault(); toggleFav(t.id)}}>
                <Heart className={`w-5 h-5 ${faved.includes(t.id) ? "fill-red-400" : ""}`} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{t.bio}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {t.specs.map(s => (
                <span key={s} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">{s}</span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400"/>
                <b className="text-slate-900">{t.rating}</b> ({t.reviews})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary/60"/>{t.region}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3"/>{t.langs.length} ภาษา
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="g-empty">
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="g-empty-title">ไม่พบไกด์</h3>
          <p className="g-empty-desc">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองอื่น</p>
          <button onClick={()=>{setSearch(""); setSpecFilter(""); setTierFilter("")}} className="btn-primary mt-4">
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}
