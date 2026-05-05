import React from "react";
import Link from "next/link";
import { Star, MapPin, Globe } from "lucide-react";
const alts=[
  {id:"T-002",name:"พี่เจมส์",photo:"👨‍🦱",tier:"Elite",rating:4.95,match:"92%",region:"เชียงใหม่",reason:"ว่างตรงวัน + ชำนาญ adventure"},
  {id:"T-005",name:"พี่มิ้นท์",photo:"👩‍🦳",tier:"Premium",rating:4.85,match:"88%",region:"กรุงเทพ",reason:"ว่างตรงวัน + ชำนาญถ่ายรูป"},
  {id:"T-003",name:"พี่แนน",photo:"👩",tier:"Senior",rating:4.7,match:"75%",region:"ภูเก็ต",reason:"ว่างตรงวัน + family-friendly"},
];
export default function TalentAlternativesPage(){return(<div className="g-container py-8 max-w-2xl mx-auto space-y-6"><h1 className="text-xl font-bold text-slate-900">🔄 ทางเลือกไกด์</h1><p className="text-sm text-slate-500">ไกด์ที่คุณเลือก (พี่ก้อย) ไม่ว่างในช่วงนี้ — admin เสนอทางเลือกเหล่านี้:</p><div className="space-y-3">{alts.map(a=>(<div key={a.id} className="g-card p-5"><div className="flex items-center gap-3 mb-2"><span className="text-3xl">{a.photo}</span><div className="flex-1"><div className="font-bold">{a.name} <span className="text-xs text-amber-600">({a.tier})</span></div><div className="text-xs text-slate-500 flex items-center gap-2"><Star className="w-3 h-3 text-amber-400 fill-amber-400"/>{a.rating} · <MapPin className="w-3 h-3"/>{a.region}</div></div><span className="text-lg font-bold text-primary">{a.match}</span></div><p className="text-xs text-slate-500 mb-3">💡 {a.reason}</p><div className="flex gap-2"><Link href={`/talents/${a.id}`} className="btn-outline text-sm flex-1 text-center">ดูโปรไฟล์</Link><button className="btn-primary text-sm flex-1">✓ เลือกท่านนี้</button></div></div>))}</div><div className="flex gap-3"><button className="btn-outline w-full">❌ ไม่เอาไกด์ (คืนเงิน premium)</button></div></div>);}
