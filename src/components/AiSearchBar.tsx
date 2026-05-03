"use client";

import { useState, useRef } from "react";
import { Sparkles, Mic, ScanSearch, ArrowRight, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui-new/Badge";

export default function AiSearchBar() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. ระบบค้นหาด้วยเสียง (Voice Search)
  const handleVoiceSearch = () => {
    router.push(`/ai-planner?action=voice`);
  };

  // 2. ระบบค้นหาด้วยรูปภาพ (Visual Search)
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
    <div className="w-full max-w-4xl relative flex flex-col items-center group">
      <form 
         onSubmit={handleSubmit} 
         className={`w-full flex items-center rounded-2xl md:rounded-full bg-white/90 backdrop-blur-md overflow-hidden px-3 py-3 md:py-4 transition-all duration-500 relative z-10 
            ${isFocused ? "shadow-[0_0_40px_rgba(249,115,22,0.3)] border border-primary ring-4 ring-primary/20 scale-[1.02]" : "shadow-floating border border-border"}
         `}
      >
        
        {/* Glow behind the input when focused */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 transition-opacity duration-500 rounded-full ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="w-12 h-12 flex items-center justify-center shrink-0 relative z-10">
          <div className="relative">
             {isFocused && <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50"></div>}
             <Sparkles className={`w-6 h-6 text-primary relative z-10 transition-transform duration-500 ${isFocused ? 'scale-110' : ''}`} />
          </div>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isListening ? "กำลังฟังสิ่งที่คุณพูด..." : "ให้ Jongtour AI ช่วยหาทัวร์... (เช่น ญี่ปุ่น 5 วัน งบ 3 หมื่น)"}
          className={`w-full bg-transparent outline-none px-2 text-[16px] md:text-[20px] font-medium transition-colors relative z-10 ${
            isListening ? "text-primary placeholder-primary/60" : "text-trust-900 placeholder-muted-foreground/70"
          }`}
          disabled={isAnalyzingImage}
        />
        
        <div className="flex items-center gap-1.5 md:gap-3 pr-1 shrink-0 relative z-10">
          
          <button type="button" onClick={handleVoiceSearch} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary-50 text-muted-foreground hover:text-primary transition-all hover:scale-105" title="ค้นหาด้วยเสียง">
            <Mic className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary-50 text-muted-foreground hover:text-primary transition-all hover:scale-105" title="อัปโหลดรูปภาพ / PDF">
            <ScanSearch className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="w-[1px] h-8 bg-border mx-1"></div>

          <button type="submit" className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:scale-105 transition-all">
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 px-2 pb-1 relative z-10">
        <button type="button" onClick={() => { setQuery("หาทัวร์ยุโรปเดือนหน้า อากาศเย็นๆ"); setTimeout(() => router.push(`/ai-planner?q=หาทัวร์ยุโรปเดือนหน้า อากาศเย็นๆ`), 100); }} className="text-xs font-medium text-trust-700 hover:text-primary bg-white/80 backdrop-blur-sm border border-border hover:border-primary/50 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-primary/70" /> ยุโรปเดือนหน้า
        </button>
        <button type="button" onClick={() => { setQuery("ขอทัวร์ที่ยังว่างช่วงสงกรานต์ งบไม่เกิน 40,000"); setTimeout(() => router.push(`/ai-planner?q=ขอทัวร์ที่ยังว่างช่วงสงกรานต์ งบไม่เกิน 40,000`), 100); }} className="text-xs font-medium text-trust-700 hover:text-primary bg-white/80 backdrop-blur-sm border border-border hover:border-primary/50 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-primary/70" /> ว่างช่วงสงกรานต์
        </button>
        <button type="button" onClick={() => { setQuery("พาครอบครัวผู้ใหญ่เที่ยวไต้หวัน ไม่เดินเยอะ"); setTimeout(() => router.push(`/ai-planner?q=พาครอบครัวผู้ใหญ่เที่ยวไต้หวัน ไม่เดินเยอะ`), 100); }} className="text-xs font-medium text-trust-700 hover:text-primary bg-white/80 backdrop-blur-sm border border-border hover:border-primary/50 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 hidden md:flex">
          <Wand2 className="w-3.5 h-3.5 text-primary/70" /> พาผู้ใหญ่เที่ยวไต้หวัน
        </button>
        <button type="button" onClick={() => { setQuery("เปรียบเทียบทัวร์ญี่ปุ่น ของ Let's go กับ Next trip"); setTimeout(() => router.push(`/ai-planner?q=เปรียบเทียบทัวร์ญี่ปุ่น ของ Let's go กับ Next trip`), 100); }} className="text-xs font-medium text-trust-700 hover:text-primary bg-white/80 backdrop-blur-sm border border-border hover:border-primary/50 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 hidden lg:flex">
          <Wand2 className="w-3.5 h-3.5 text-primary/70" /> เปรียบเทียบทัวร์
        </button>
      </div>
      
      {/* AI Trust Indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium whitespace-nowrap">
         <Sparkles className="w-3 h-3" /> Powered by Jongtour AI Elite 5.0
      </div>
    </div>
  );
}
