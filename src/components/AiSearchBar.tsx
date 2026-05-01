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

  // 1. ระบบค้นหาด้วยเสียง (Voice Search) - Redirect to AI Planner
  const handleVoiceSearch = () => {
    router.push(`/ai-planner?action=voice`);
  };

  // 2. ระบบค้นหาด้วยรูปภาพ (Visual Search) - Redirect to AI Planner
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 and store in session storage to pass to the next page
    const reader = new FileReader();
    reader.onload = (event) => {
      sessionStorage.setItem("pending_ai_image", event.target?.result as string);
      router.push(`/ai-planner?action=image`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query) return;
    router.push(`/ai-planner?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full max-w-4xl relative shadow-[0_8px_30px_rgb(249,115,22,0.15)] rounded-full hover:shadow-[0_8px_30px_rgb(249,115,22,0.25)] transition-all duration-500 bg-white group">
      <form onSubmit={handleSubmit} className="flex items-center rounded-full border-2 border-gray-100 hover:border-orange-100 bg-white overflow-hidden px-4 py-4 md:py-5 transition-all">
        
        {/* ไอคอนประกายดาวซ้ายสุด */}
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-orange-500" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "กำลังฟังสิ่งที่คุณพูด..." : "อยากไปไหน พิมพ์เลย... เช่น ญี่ปุ่น 5 วัน งบ 3 หมื่น ช่วงปีใหม่"}
          className={`w-full bg-transparent outline-none px-2 text-[18px] md:text-[20px] font-medium transition-colors ${
            isListening ? "text-orange-600 placeholder-orange-400" : "text-gray-800 placeholder-gray-400"
          }`}
          disabled={isAnalyzingImage}
        />
        
        <div className="flex items-center gap-1.5 md:gap-2 pr-1 shrink-0">
          
          {/* ปุ่มไมโครโฟน */}
          <button type="button" onClick={handleVoiceSearch} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gradient-to-tr hover:from-blue-50 hover:to-indigo-100 text-gray-500 hover:text-indigo-600 transition-all border border-gray-100 hover:border-indigo-200 hover:shadow-sm" title="ค้นหาด้วยเสียง">
            <Mic className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>

          {/* ปุ่มอัปโหลดรูปภาพ */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gradient-to-tr hover:from-emerald-50 hover:to-teal-100 text-gray-500 hover:text-teal-600 transition-all border border-gray-100 hover:border-teal-200 hover:shadow-sm" title="อัปโหลดรูปภาพให้ AI สแกน">
            <ScanSearch className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>

          {/* ปุ่ม Submit (ลูกศรขวา แบบ ChatGPT) */}
          <button type="submit" className="ml-2 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
