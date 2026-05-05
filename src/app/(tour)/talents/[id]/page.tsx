"use client";
import React from "react";
import Link from "next/link";
import { Star, MapPin, Globe, Calendar, Heart, MessageCircle, Award } from "lucide-react";

const talent = {
  id:"T-001", name:"พี่ก้อย", photo:"👩‍🦰", tier:"Premium", rating:4.9, reviews:128, langs:["ไทย","อังกฤษ","จีน"],
  specs:["เมืองหลวง","วัฒนธรรม","อาหาร"], region:"กรุงเทพ", trips:245,
  bio:"ไกด์มืออาชีพ 10 ปี ชำนาญกรุงเทพและภาคกลาง ได้รับรางวัลไกด์ดีเด่นจาก ททท. 3 ปีซ้อน เชี่ยวชาญด้านวัฒนธรรม วัด อาหาร Street Food Tour และ Night Market Tour",
  experience:"10 ปี", license:"TAT-12345",
  reviewList:[
    {name:"คุณสมชาย",rating:5,text:"พี่ก้อยดูแลดีมาก รู้จริงทุกที่ อธิบายประวัติศาสตร์สนุก",date:"15/04/69"},
    {name:"คุณวิภา",rating:5,text:"ทริปอาหารสุดยอด พาไปร้านลับที่ไม่เคยรู้",date:"02/04/69"},
    {name:"Mr.Chen",rating:4,text:"Very knowledgeable guide, speaks excellent Chinese",date:"20/03/69"},
  ]
};

export default function TalentProfilePage({ params }:{ params:{ id:string } }) {
  return (
    <div className="g-container py-8 max-w-3xl mx-auto space-y-6">
      <div className="text-sm text-slate-400 mb-1"><Link href="/talents" className="hover:text-primary">← ไกด์ทั้งหมด</Link></div>
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm text-amber-800">⚠️ การ request ไกด์เป็นแบบ <b>best-effort</b> — ไม่รับประกันว่าจะได้ไกด์ท่านนี้</div>

      <div className="g-card p-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-6xl">{talent.photo}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{talent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{talent.tier}</span>
              <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/>{talent.rating} ({talent.reviews} reviews)</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">{talent.bio}</p>
          </div>
          <button className="text-slate-300 hover:text-red-400"><Heart className="w-6 h-6"/></button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[{l:"ประสบการณ์",v:talent.experience,i:<Award className="w-4 h-4 text-purple-500"/>},{l:"ทริปทั้งหมด",v:`${talent.trips} ทริป`,i:<Calendar className="w-4 h-4 text-blue-500"/>},{l:"พื้นที่",v:talent.region,i:<MapPin className="w-4 h-4 text-emerald-500"/>},{l:"ภาษา",v:talent.langs.join(", "),i:<Globe className="w-4 h-4 text-primary"/>}].map(s=>(<div key={s.l} className="bg-slate-50 p-3 rounded-xl"><div className="flex items-center gap-1.5 mb-1">{s.i}<span className="text-[10px] text-slate-400">{s.l}</span></div><div className="text-sm font-bold">{s.v}</div></div>))}
        </div>

        <div className="mb-4"><h3 className="font-bold text-sm mb-2">🎯 ความชำนาญ</h3><div className="flex flex-wrap gap-1.5">{talent.specs.map(s=><span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{s}</span>)}</div></div>

        <Link href={`/talents/request?talent=${params.id}`} className="btn-primary w-full text-center block">📩 Request ไกด์ท่านนี้</Link>
      </div>

      <div className="g-card p-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary"/>Reviews ({talent.reviews})</h3>
        <div className="space-y-3">{talent.reviewList.map(r=>(<div key={r.date} className="p-3 bg-slate-50 rounded-xl"><div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.name}</span><div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400"/><span className="text-xs">{r.rating}</span></div></div><p className="text-xs text-slate-600">{r.text}</p><span className="text-[10px] text-slate-400">{r.date}</span></div>))}</div>
      </div>
    </div>
  );
}
