"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

const suggestions = [
  "ต้องเตรียมเอกสารอะไรบ้างสำหรับวีซ่าญี่ปุ่น?",
  "ค่าใช้จ่ายวีซ่าอเมริกาเท่าไหร่?",
  "แพ็กเกจ EXCLUSIVE ต่างจาก VIP ยังไง?",
  "ซ้อมสัมภาษณ์วีซ่า B1/B2 ให้หน่อย",
];

const aiResponses: Record<string, string> = {
  "ญี่ปุ่น": "🇯🇵 **วีซ่าญี่ปุ่น** - เอกสารที่ต้องเตรียม:\n\n1. พาสปอร์ตเหลืออายุ 6 เดือน\n2. รูปถ่าย 2x2 นิ้ว (2 ใบ)\n3. หนังสือรับรองการทำงาน\n4. Statement ย้อนหลัง 6 เดือน\n5. ทะเบียนบ้าน\n6. ตั๋วเครื่องบิน + แผนเดินทาง\n\n💡 **คนไทยเข้าฟรี 15 วัน** ไม่ต้องวีซ่า แต่ถ้าอยู่นานกว่า 15 วัน ต้องทำวีซ่า\n\nเริ่มต้นที่ **฿1,500** (PLUS)",
  "อเมริกา": "🇺🇸 **วีซ่าอเมริกา B1/B2**\n\n💰 ค่าใช้จ่าย:\n- ค่าบริการ Jongtour: **฿5,500 - ฿20,000** (ตาม Tier)\n- ค่าธรรมเนียมสถานทูต: **$185 (~฿6,000)**\n- ค่า SEVIS (นักเรียน): $350\n\n⏱️ ต้อง **สัมภาษณ์** ที่สถานทูต\n\n📋 Tier VIP (฿20,000) รวม:\n- ซ้อมสัมภาษณ์\n- ค่าสถานทูต\n- ยื่นรอบ 2 ฟรี ถ้าไม่ผ่าน",
  "exclusive": "**EXCLUSIVE vs VIP:**\n\n🔥 **EXCLUSIVE** (Best Seller):\n- แปลเอกสาร 8 ฉบับ\n- Itinerary + Cover Letter\n- ประสานเร่งด่วน\n\n👑 **VIP** (Guarantee):\n- แปลทุกฉบับ (ไม่จำกัด)\n- ซ้อมสัมภาษณ์\n- **ค่าสถานทูตรวม**\n- **ยื่นรอบ 2 ฟรี** ถ้าไม่ผ่าน",
};

export default function VisaAIAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: "สวัสดีค่ะ! 🛂 ฉันคือ AI Visa Assistant จาก Jongtour\n\nถามได้เลย เรื่องวีซ่า เอกสาร ราคา หรือเตรียมตัวสัมภาษณ์ ฉันช่วยได้ค่ะ!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const key = Object.keys(aiResponses).find(k => text.toLowerCase().includes(k.toLowerCase()));
      const reply = key ? aiResponses[key] : `ขอบคุณสำหรับคำถามค่ะ! เกี่ยวกับ "${text}" — ทีมงาน Jongtour จะติดต่อกลับภายใน 30 นาที\n\nหรือโทรสอบถามเลย ☎️ 02-123-4567`;
      setMsgs(prev => [...prev, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3"><Sparkles className="w-7 h-7 text-primary" /></div>
        <h1 className="text-2xl font-bold text-slate-900">AI Visa Assistant</h1>
        <p className="text-sm text-slate-500 mt-1">ถามเรื่องวีซ่าได้ทุกอย่าง ตอบทันที!</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: "60vh" }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${m.role === "user" ? "bg-primary text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-slate-100 p-3 rounded-2xl rounded-bl-md text-sm text-slate-400">กำลังพิมพ์...</div></div>}
            <div ref={endRef} />
          </div>

          {msgs.length <= 1 && (
            <div className="px-4 pb-2"><div className="flex flex-wrap gap-1.5">{suggestions.map(s => (<button key={s} onClick={() => send(s)} className="text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">{s}</button>))}</div></div>
          )}

          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="ถามเรื่องวีซ่า..." />
            <button onClick={() => send(input)} disabled={!input.trim()} className="bg-primary text-white p-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-50"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
