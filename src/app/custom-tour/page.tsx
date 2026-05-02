"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Loader2, Bot, MapPin, Calendar, Compass, User, SlidersHorizontal, ChevronDown, Mic, MicOff } from "lucide-react";
import InteractiveItinerary from "@/components/InteractiveItinerary";

const SUGGESTIONS = [
  "พาพ่อแม่และเด็กเล็กเที่ยวโตเกียว 5 วัน เน้นเดินทางสะดวก ไม่เหนื่อย ขอโรงแรมสไตล์ครอบครัว",
  "ทริปฮันนีมูน สวิสเซอร์แลนด์ 7 วัน ขอแบบสุดโรแมนติก นั่งรถไฟชมวิว นอนโรงแรมหรู 5 ดาว",
  "ไปตะลุยชิมสตรีทฟู้ดและช้อปปิ้งที่โอซาก้า 4 วัน 3 คืน ขอโรงแรมใจกลางย่านนัมบะ",
  "เที่ยวเกียวโต 4 วัน เน้นไหว้พระ ขอพร ถ่ายรูปชุดกิมิโน และอยากพักเรียวกังแบบดั้งเดิม",
  "ตามรอยซีรีส์ที่โซล 5 วัน ขอคาเฟ่สวยๆ ช้อปปิ้งย่านเมียงดง นอนโรงแรมดีไซน์เก๋ๆ",
  "ดานัง-ฮอยอัน 4 วัน ไปกับแก๊งเพื่อน เน้นประหยัด คุ้มค่า และได้รูปสวยๆ คาเฟ่ชิคๆ"
];

const LOADING_STEPS = [
  "กำลังเชื่อมต่อระบบ AI Travel Engine...",
  "กำลังวิเคราะห์ความต้องการและสถานที่ปลายทาง...",
  "กำลังค้นหาเที่ยวบินที่ดีที่สุด...",
  "กำลังคัดกรองโรงแรมและที่พัก...",
  "คำนวณระยะทางและจัดสรรเส้นทางที่เหมาะสม...",
  "ร้อยเรียงเรื่องราวและสร้างแผนการเดินทาง...",
  "กำลังประเมินราคาและออกเอกสาร..."
];

export default function CustomTourPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [itineraryResult, setItineraryResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Advanced Options state (optional overrides)
  const [advancedData, setAdvancedData] = useState({
    serviceType: "FULL_SERVICE",
    pax: 2,
    hotelStars: 3,
    durationDays: 3,
    airlinePreference: "lowcost",
  });

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง กรุณาใช้ Chrome หรือ Edge เวอร์ชั่นใหม่ครับ");
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setPrompt("");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setPrompt(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert("กรุณาบอกเราหน่อยครับว่าอยากไปเที่ยวที่ไหน?");
      return;
    }

    setIsLoading(true);
    setItineraryResult(null);

    try {
      const res = await fetch("/api/fit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          ...advancedData
        })
      });
      const data = await res.json();
      if (data.itinerary) {
        setItineraryResult(data.itinerary);
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างแผนการเดินทาง: " + (data.error || "Unknown Error"));
      }
    } catch (err) {
      console.error(err);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 selection:bg-orange-200 font-sans relative overflow-x-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-300/30 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[150px] opacity-70"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      </div>

      {/* Header */}
      <div className="relative z-40 border-b border-gray-200/50 backdrop-blur-md bg-white/60">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/ai-planner" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors border border-gray-200">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium tracking-wide">กลับไปหน้าหลัก</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 uppercase tracking-widest">
              Jongtour AI
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* Results View */}
        {itineraryResult ? (
          <div className="w-full animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bot className="w-8 h-8 text-orange-500" /> 
                แผนการเดินทางสุดพิเศษของคุณ
              </h2>
              <button onClick={() => setItineraryResult(null)} className="px-4 py-2 bg-white hover:bg-gray-50 rounded-full text-sm font-medium text-gray-700 transition-colors flex items-center gap-2 border border-gray-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-orange-400"/> ปรับแต่งใหม่
              </button>
            </div>
            
            <div className="w-full">
              <InteractiveItinerary itinerary={itineraryResult} />
            </div>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="w-full max-w-2xl mx-auto mt-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute -inset-4 bg-orange-100 rounded-full blur-xl animate-pulse"></div>
              {/* Inner scanning ring */}
              <div className="w-24 h-24 rounded-full border border-orange-200 flex items-center justify-center relative overflow-hidden bg-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-200 to-transparent animate-[spin_2s_linear_infinite] opacity-50"></div>
                <div className="bg-white w-20 h-20 rounded-full absolute inset-2 flex items-center justify-center z-10 shadow-inner">
                  <Bot className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">AI กำลังทำงาน...</h3>
              <div className="h-6 overflow-hidden relative w-full flex justify-center">
                <p 
                  key={loadingStep} 
                  className="text-orange-600 text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 absolute"
                >
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, (loadingStep / (LOADING_STEPS.length - 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          /* Input View */
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-300 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 transform -rotate-6">
               <Bot className="w-8 h-8 text-white transform rotate-6" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4 tracking-tight leading-tight">
              ให้ AI จัดทริปในฝันให้คุณ
            </h1>
            <p className="text-gray-500 text-center text-lg mb-12 max-w-xl">
              บอกสิ่งที่คุณต้องการ หรือแค่ <strong className="text-orange-500">กดไมค์แล้วพูด</strong> ให้ AI ออกแบบทริปส่วนตัวให้คุณใน 30 วินาที
            </p>

            <form onSubmit={handleSubmit} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-300 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <div className={`relative bg-white/80 backdrop-blur-xl border ${isListening ? 'border-orange-400 ring-4 ring-orange-100' : 'border-gray-200/60'} rounded-3xl p-2 md:p-3 shadow-2xl shadow-gray-200/50 flex flex-col transition-all`}>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={handleTextareaInput}
                    placeholder="พิมพ์บอกเรา เช่น อยากไปญี่ปุ่น 5 วัน หรือกดปุ่มไมค์เพื่อพูด..."
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-lg md:text-xl p-4 md:p-6 pr-16 outline-none resize-none min-h-[120px] overflow-hidden font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={startListening}
                    className={`absolute right-4 bottom-4 p-3 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' : 'bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600'}`}
                    title="สั่งงานด้วยเสียง"
                  >
                    {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-4 pb-2 pt-2 border-t border-gray-100 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-gray-500 hover:text-orange-600 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    การตั้งค่าเพิ่มเติม (Advanced)
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={!prompt.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 text-white p-3 rounded-xl flex items-center gap-2 font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-orange-500/20"
                  >
                    <span className="hidden md:inline pl-2">สร้างแผนเดินทาง</span>
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Advanced Options Drawer */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500 text-xs mb-1.5 block uppercase tracking-wider font-bold">บริการที่ต้องการ</label>
                      <select 
                        value={advancedData.serviceType}
                        onChange={(e) => setAdvancedData({...advancedData, serviceType: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none shadow-sm"
                      >
                        <option value="FULL_SERVICE">ทัวร์จัดเต็ม (Full Service)</option>
                        <option value="A_LA_CARTE">เลือกบริการเอง (A La Carte)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1.5 block uppercase tracking-wider font-bold">ระดับโรงแรมบังคับ</label>
                      <select 
                        value={advancedData.hotelStars}
                        onChange={(e) => setAdvancedData({...advancedData, hotelStars: Number(e.target.value)})}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none shadow-sm"
                      >
                        <option value={3}>3 ดาว (มาตรฐาน)</option>
                        <option value={4}>4 ดาว (พรีเมียม)</option>
                        <option value={5}>5 ดาว (หรูหรา)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1.5 block uppercase tracking-wider font-bold">ประเภทสายการบิน</label>
                      <select 
                        value={advancedData.airlinePreference}
                        onChange={(e) => setAdvancedData({...advancedData, airlinePreference: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none shadow-sm"
                      >
                        <option value="lowcost">โลว์คอสต์ (ราคาประหยัด)</option>
                        <option value="fullservice">ฟูลเซอร์วิส (บริการเต็มรูปแบบ)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Suggestions */}
            <div className="mt-12 w-full max-w-3xl">
              <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest text-center">ลองพิมพ์ตัวอย่างเหล่านี้</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUGGESTIONS.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(text)}
                    className="bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-200 p-4 rounded-2xl text-left text-sm text-gray-600 hover:text-orange-700 transition-all shadow-sm group"
                  >
                    <span className="line-clamp-3 leading-relaxed">{text}</span>
                    <div className="mt-2 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold flex items-center gap-1">
                      เลือก <ArrowLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
