'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type TourResult = {
  id: string;
  tourCode: string;
  tourName: string;
  slug: string;
  durationDays: number;
  durationNights: number;
  coverImage: string | null;
  supplier: string;
  startingPrice: number | null;
  nextDeparture: string | null;
  remainingSeats: number;
  similarity?: number;
};

type Message = {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  tours?: TourResult[];
  isLowConfidence?: boolean;
};

export default function AiSearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [aiState, setAiState] = useState<'idle' | 'searching' | 'typing'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, aiState]);

  const handleSend = async (text: string) => {
    if (!text.trim() || aiState !== 'idle') return;

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // 2. State: Tool Loading (Searching Database)
    setAiState('searching');

    try {
      // 3. Call real AI search API first, fallback to keyword search
      let tours: TourResult[] = [];
      let fallback = false;

      try {
        const aiRes = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text.trim(), limit: 5 }),
        });
        const aiData = await aiRes.json();
        if (aiData.success && aiData.data && aiData.data.length > 0) {
          // Map AI search response to TourResult shape
          tours = aiData.data.map((t: any) => ({
            id: t.id,
            tourCode: t.tourCode || '',
            tourName: t.tourName || '',
            slug: t.slug || t.id,
            durationDays: parseInt(t.duration?.split('D')[0]) || 0,
            durationNights: parseInt(t.duration?.split('D')[1]?.replace('N', '')) || 0,
            coverImage: null,
            supplier: t.supplier || '',
            startingPrice: t.lowestPrice || null,
            nextDeparture: t.nextDeparture,
            remainingSeats: t.remainingSeats || 0,
            similarity: t.similarity,
          }));
        }
      } catch {
        // AI search failed, try keyword fallback
      }

      // Fallback: keyword search via /api/search
      if (tours.length === 0) {
        fallback = true;
        try {
          const kwRes = await fetch(`/api/search?q=${encodeURIComponent(text.trim())}&mode=keyword`);
          const kwData = await kwRes.json();
          if (kwData.tours && kwData.tours.length > 0) {
            tours = kwData.tours.slice(0, 5);
          }
        } catch {
          // Both searches failed
        }
      }

      // 4. State: AI Generating response
      setAiState('typing');

      // Small delay for typing animation
      await new Promise(r => setTimeout(r, 800));

      // 5. Build AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: tours.length > 0
          ? `เจอแล้วค่ะ! พบโปรแกรมทัวร์ ${tours.length} รายการที่ตรงกับความต้องการ "${text}" ลองดูรายละเอียดด้านล่างได้เลยค่ะ 👇`
          : `ขอโทษค่ะ ไม่พบโปรแกรมทัวร์ที่ตรงกับ "${text}" ในตอนนี้ ลองเปลี่ยนคำค้นหาดูนะคะ หรือจะให้เจ้าหน้าที่ช่วยหาทัวร์ที่เหมาะกับคุณก็ได้ค่ะ`,
        tours: tours.length > 0 ? tours : undefined,
        isLowConfidence: fallback && tours.length > 0,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error fallback
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'ขอโทษค่ะ เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้งนะคะ',
      };
      setMessages(prev => [...prev, errMsg]);
    }
    
    setAiState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
    setAiState('idle');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch { return null; }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
      {/* Main Layout: Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Chat Area */}
        <div className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)] border-x border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">Jongtour AI Elite</h1>
                <p className="text-xs text-emerald-600 font-medium">Online • พร้อมช่วยหาทัวร์</p>
              </div>
            </div>
            <button onClick={handleReset} className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              เริ่มใหม่
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-8 py-10">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">ให้ AI ช่วยหาทัวร์ที่ใช่</h2>
                  <p className="text-slate-500">พิมพ์ความต้องการของคุณด้วยภาษาธรรมดา หรืออัปโหลดไฟล์โบรชัวร์ PDF เพื่อให้ AI ค้นหาทัวร์ที่คุ้มค่ากว่าจาก 50+ โฮลเซลล์</p>
                </div>
                
                {/* Quick Prompts */}
                <div className="w-full flex flex-wrap justify-center gap-2">
                  <button onClick={() => handleSend('หาทัวร์ญี่ปุ่น พ่อแม่ลูก งบไม่เกิน 30,000')} className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-600 px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
                    หาทัวร์ญี่ปุ่น พ่อแม่ลูก งบไม่เกิน 30,000
                  </button>
                  <button onClick={() => handleSend('อยากไปดูแสงเหนือช่วงปีใหม่ มีที่ไหนว่างบ้าง?')} className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-600 px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
                    อยากไปดูแสงเหนือช่วงปีใหม่ ว่างไหม?
                  </button>
                  <button onClick={() => handleSend('ทัวร์จีน เฉิงตู จิ่วจ้ายโกว')} className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-600 px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
                    🇨🇳 ทัวร์จีน เฉิงตู จิ่วจ้ายโกว
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%]`}>
                  
                  {/* AI Warning / Context */}
                  {msg.isLowConfidence && (
                    <div className="mb-2 bg-yellow-50 text-yellow-800 border border-yellow-200 p-3 rounded-xl text-xs flex gap-2 items-start shadow-sm">
                      <svg className="w-4 h-4 shrink-0 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      <span><strong>AI Note:</strong> ไม่พบผลลัพธ์จาก AI Vector Search จึงแสดงผลจากการค้นหาด้วยคีย์เวิร์ดแทนค่ะ หากต้องการผลลัพธ์ที่แม่นยำกว่า ลองระบุประเทศหรือชื่อเมืองดูนะคะ</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Embedded Tour Cards — inline styled, no TourCard dependency */}
                  {msg.tours && msg.tours.length > 0 && (
                    <div className="mt-4 flex flex-col gap-3">
                      {msg.tours.map(tour => (
                        <Link
                          key={tour.id}
                          href={`/tour/${tour.slug || tour.id}`}
                          className="group block bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all overflow-hidden"
                        >
                          <div className="flex gap-4 p-4">
                            {/* Thumbnail */}
                            <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              {tour.coverImage ? (
                                <img src={tour.coverImage} alt={tour.tourName} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
                                  <span className="text-2xl">✈️</span>
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{tour.tourCode}</span>
                                <span className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">🏢 {tour.supplier}</span>
                                {tour.similarity && tour.similarity > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">🎯 {Math.round(tour.similarity * 100)}% match</span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">{tour.tourName}</h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                {tour.durationDays > 0 && <span>⏱️ {tour.durationDays} วัน {tour.durationNights} คืน</span>}
                                {tour.nextDeparture && <span>📅 {formatDate(tour.nextDeparture)}</span>}
                                {tour.remainingSeats > 0 && tour.remainingSeats <= 10 && (
                                  <span className="text-red-600 font-semibold">🔥 เหลือ {tour.remainingSeats} ที่</span>
                                )}
                              </div>
                            </div>
                            {/* Price */}
                            <div className="text-right shrink-0">
                              {tour.startingPrice && tour.startingPrice > 0 ? (
                                <>
                                  <p className="text-[10px] text-slate-400">เริ่มต้น</p>
                                  <p className="text-lg font-black text-orange-600 leading-tight">฿{Number(tour.startingPrice).toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-400">/ท่าน</p>
                                </>
                              ) : (
                                <p className="text-xs text-slate-400">สอบถามราคา</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Suggestions (Only show on AI msgs) */}
                  {msg.role === 'ai' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => handleSend('ขอราคาถูกกว่านี้')} className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        ขอราคาถูกกว่านี้
                      </button>
                      <button onClick={() => handleSend('มีสายการบินอื่นไหม?')} className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        มีสายการบินอื่นไหม?
                      </button>
                      <a href="/contact" className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        ให้เจ้าหน้าที่ช่วย (Human Handoff)
                      </a>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* AI Loading States */}
            {aiState === 'searching' && (
              <div className="flex justify-start">
                <div className="max-w-[75%] bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-sm font-bold text-slate-600 tracking-wide">AI กำลังค้นหาข้อมูลจาก 50+ Wholesale แบบ Real-time...</span>
                </div>
              </div>
            )}

            {aiState === 'typing' && (
              <div className="flex justify-start">
                <div className="max-w-[75%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
              
              {/* Attachment Button */}
              <button className="w-10 h-10 shrink-0 rounded-full bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors shadow-sm border border-slate-200" title="อัปโหลดโบรชัวร์ (PDF/JPG) เพื่อเปรียบเทียบราคา">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>

              {/* Text Input */}
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="บอก AI ว่าอยากไปเที่ยวไหน งบเท่าไหร่..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-slate-800 placeholder-slate-400 outline-none min-h-[44px] max-h-32"
                rows={1}
                disabled={aiState !== 'idle'}
              />

              {/* Send Button */}
              <button 
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || aiState !== 'idle'}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
                  inputValue.trim() && aiState === 'idle' 
                    ? 'bg-orange-600 text-white shadow-md hover:bg-orange-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400">AI อาจสร้างข้อมูลที่ไม่ถูกต้อง กรุณาตรวจสอบรายละเอียดอีกครั้งกับเจ้าหน้าที่</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
