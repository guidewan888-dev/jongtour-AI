import React from "react";
import Link from "next/link";
const SC:Record<string,string>={SUBMITTED:"bg-blue-100 text-blue-700",PENDING_REVIEW:"bg-purple-100 text-purple-700",TALENT_NOTIFIED:"bg-indigo-100 text-indigo-700",CONFIRMED:"bg-emerald-100 text-emerald-700",ALTERNATIVE_OFFERED:"bg-amber-100 text-amber-700",COMPLETED:"bg-emerald-100 text-emerald-700"};
const requests=[
  {id:"TR-001",talent:"👩‍🦰 พี่ก้อย",tour:"Tokyo Explorer 5D",date:"15-19 ก.ค.",status:"PENDING_REVIEW",submitted:"06/05/69"},
  {id:"TR-002",talent:"👨‍🦱 พี่เจมส์",tour:"Hokkaido Premium 7D",date:"20-26 ก.ค.",status:"CONFIRMED",submitted:"01/05/69"},
  {id:"TR-003",talent:"👩 พี่แนน",tour:"Private Phuket 3D",date:"10-12 ส.ค.",status:"ALTERNATIVE_OFFERED",submitted:"28/04/69"},
];
export default function CustomerTalentRequestsPage(){return(<div className="g-container py-8 max-w-3xl mx-auto space-y-6"><h1 className="text-2xl font-bold text-slate-900">📩 คำขอไกด์ของฉัน</h1><div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-800">⚠️ ไม่รับประกันว่าจะได้ไกด์ที่เลือก — best-effort matching</div><div className="space-y-3">{requests.map(r=>(<Link key={r.id} href={`/account/talent-requests/${r.id}`} className="g-card p-4 flex items-center gap-3 hover:shadow-lg transition-all"><span className="text-2xl">{r.talent.slice(0,2)}</span><div className="flex-1"><div className="font-bold text-sm">{r.talent.slice(2)} — {r.tour}</div><div className="text-xs text-slate-500">{r.id} · {r.date} · ส่งเมื่อ {r.submitted}</div></div><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SC[r.status]}`}>{r.status}</span></Link>))}</div></div>);}
