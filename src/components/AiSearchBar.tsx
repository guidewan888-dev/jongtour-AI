"use client";

import { useState, useRef } from "react";
import { Sparkles, Mic, ScanSearch, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AiSearchBar() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. ระบบค้นหาด้วยเสียง (Voice Search)
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการพิมพ์ด้วยเสียง (แนะนำให้ใช้ Google Chrome ครับ)");
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setQuery("");
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 2. ระบบค้นหาด้วยรูปภาพ (Visual Search)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setQuery(`AI กำลังสแกนภาพ: ${file.name}...`);

    setTimeout(() => {
      setIsAnalyzingImage(false);
      const aiResult = "ทัวร์ญี่ปุ่น โตเกียว ภูเขาไฟฟูจิ";
      setQuery(aiResult);
      
      setTimeout(() => {
        router.push(`/ai-planner?q=${encodeURIComponent(aiResult)}`);
      }, 800);
    }, 2500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query) return;
    router.push(`/ai-planner?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full max-w-2xl relative shadow-[0_8px_30px_rgb(249,115,22,0.15)] rounded-full hover:shadow-[0_8px_30px_rgb(249,115,22,0.25)] transition-all duration-500 bg-white group">
      <form onSubmit={handleSubmit} className="flex items-center rounded-full border-2 border-gray-100 hover:border-orange-100 bg-white overflow-hidden px-3 py-2 md:py-3 transition-all">
        
        {/* ไอคอนประกายดาวซ้ายสุด */}
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-orange-500" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "กำลังฟังสิ่งที่คุณพูด..." : "อยากไปไหน พิมพ์เลย... เช่น ญี่ปุ่น 5 วัน งบ 3 หมื่น ช่วงปีใหม่"}
          className={`w-full bg-transparent outline-none px-2 text-[15px] md:text-[17px] font-medium transition-colors ${
            isListening ? "text-orange-600 placeholder-orange-400" : "text-gray-800 placeholder-gray-400"
          }`}
          disabled={isAnalyzingImage}
        />
        
        <div className="flex items-center gap-1.5 md:gap-2 pr-1 shrink-0">
          
          {/* ปุ่มไมโครโฟน */}
          {isListening ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 animate-pulse relative">
              <span className="absolute -inset-1 bg-red-200 rounded-full animate-ping opacity-50"></span>
              <Mic className="w-5 h-5 relative z-10" />
            </div>
          ) : (
            <button type="button" onClick={handleVoiceSearch} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gradient-to-tr hover:from-blue-50 hover:to-indigo-100 text-gray-500 hover:text-indigo-600 transition-all border border-gray-100 hover:border-indigo-200 hover:shadow-sm" title="ค้นหาด้วยเสียง">
              <Mic className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          )}

          {/* ปุ่มอัปโหลดรูปภาพ */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          {isAnalyzingImage ? (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gradient-to-tr hover:from-emerald-50 hover:to-teal-100 text-gray-500 hover:text-teal-600 transition-all border border-gray-100 hover:border-teal-200 hover:shadow-sm" title="อัปโหลดรูปภาพให้ AI สแกน">
              <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          )}

          {/* ปุ่ม Submit (ลูกศรขวา แบบ ChatGPT) */}
          <button type="submit" className="ml-1 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
