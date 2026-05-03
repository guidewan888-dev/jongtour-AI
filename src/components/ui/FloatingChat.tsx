"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles, Map, Loader2, MessageSquareText, ChevronDown, Wand2, Paperclip, Compare, FileText, HeadphonesIcon, Globe2, ScanSearch } from "lucide-react";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";
import { Badge } from "@/components/ui-new/Badge";

type Tour = {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  imageUrl: string;
};

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  tours?: Tour[];
  chips?: string[];
  image?: string;
  customItinerary?: any;
  isSearching?: boolean;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "ยินดีต้อนรับสู่ Jongtour AI ✈️✨\nผมเป็นผู้ช่วยส่วนตัวของคุณ คุณสามารถให้ผมช่วยหาทัวร์ เปรียบเทียบราคา จัดทริปส่วนตัว หรืออัปโหลดรูปภาพสถานที่ที่อยากไปได้เลยครับ",
      chips: ["หาทัวร์ญี่ปุ่นเดือนหน้า", "ขอทัวร์งบไม่เกิน 40,000", "จัดกรุ๊ปส่วนตัว", "เปรียบเทียบทัวร์"],
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide floating chat if we are already on ai-planner full page
  if (pathname === "/ai-planner") {
    return null;
  }

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, toolStatus]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add User Message
    const userMessageObj: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      text: userMsg,
    };
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);
    setToolStatus("กำลังเช็กข้อมูลจากระบบ..."); // AI Searching state

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.text,
        tours: m.tours
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, chatHistory })
      });
      
      if (!response.ok) throw new Error("API failed");
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setToolStatus(null);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: data.reply,
          tours: data.tours
        }]);
        setIsLoading(false);
        return;
      }

      // Streaming Mode
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      
      const decoder = new TextDecoder();
      let aiText = "";
      let toursData: any[] = [];
      let chipsData: string[] = [];
      let customItineraryData: any = undefined;
      let buffer = "";
      let dataParsed = false;
      
      const aiMsgId = (Date.now() + 1).toString();
      
      // Wait a moment to clear tool status and start typing
      setToolStatus(null);
      
      // Add empty AI message first
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: "ai",
        text: "",
        tours: [],
        chips: []
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        if (!dataParsed) {
          const match = buffer.match(/__DATA__([\s\S]*?)__DATA__\n/);
          if (match) {
            try { 
              const parsed = JSON.parse(match[1]);
              toursData = parsed.tours || []; 
              if (parsed.itinerary) {
                customItineraryData = parsed.itinerary;
              }
            } catch(e) {}
            aiText = buffer.slice(match[0].length);
            dataParsed = true;
          }
        } else {
          aiText += chunk;
        }

        if (dataParsed) {
          // Check for chips
          const chipsMatch = aiText.match(/__CHIPS__\[([\s\S]*?)\]/);
          let displayText = aiText;
          if (chipsMatch) {
            try {
              chipsData = JSON.parse(`[${chipsMatch[1]}]`);
              displayText = aiText.replace(chipsMatch[0], "").trim();
            } catch(e) {}
          }
          
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, text: displayText, tours: toursData, chips: chipsData, customItinerary: customItineraryData } : m
          ));
        }
      }
      
    } catch (error) {
      setToolStatus(null);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "ขออภัยครับ ตอนนี้เซิร์ฟเวอร์ระบบ AI กำลังรับคำสั่งจำนวนมาก กรุณาลองใหม่อีกครั้งในภายหลังครับ 😅",
      }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => {
       const form = document.getElementById("ai-chat-form") as HTMLFormElement;
       if(form) form.requestSubmit();
    }, 100);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 w-[95vw] md:w-[450px] h-[85vh] md:h-[650px] max-h-[850px] bg-white rounded-3xl shadow-floating flex flex-col z-[9999] overflow-hidden border border-border transition-all duration-300 transform origin-bottom-right">
          
          {/* Header - Premium SaaS look */}
          <div className="bg-trust-900 p-4 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2">Jongtour AI Elite <Badge variant="success" className="py-0 px-1.5 text-[10px] h-4">Online</Badge></h3>
                <p className="text-xs text-trust-300">Intelligent Travel Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
               <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-trust-200 hover:text-white" title="ติดต่อพนักงาน">
                 <HeadphonesIcon className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-trust-200 hover:text-white"
               >
                 <ChevronDown className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-muted px-4 py-2 border-b border-border flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
             <button onClick={() => handleSuggestion("จัดกรุ๊ปส่วนตัว")} className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-trust-700 hover:text-primary hover:border-primary/50 shadow-sm transition-colors">
                <Wand2 className="w-3.5 h-3.5" /> จัดกรุ๊ปเหมา
             </button>
             <button onClick={() => handleSuggestion("ขอใบเสนอราคา")} className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-trust-700 hover:text-primary hover:border-primary/50 shadow-sm transition-colors">
                <FileText className="w-3.5 h-3.5" /> ขอใบเสนอราคา
             </button>
             <button onClick={() => handleSuggestion("เปรียบเทียบทัวร์")} className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-trust-700 hover:text-primary hover:border-primary/50 shadow-sm transition-colors">
                <Compare className="w-3.5 h-3.5" /> เปรียบเทียบ
             </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-background custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center shrink-0 mt-1 shadow-sm ring-1 ring-primary/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.text && (
                    <div className={`p-3.5 text-[14px] leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-trust-900 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white text-trust-900 border border-border rounded-2xl rounded-tl-sm whitespace-pre-line"
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Smart Tour Card (Horizontal Scroll) */}
                  {msg.tours && msg.tours.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 w-[80vw] md:w-[350px] snap-x custom-scrollbar">
                      {msg.tours.map(tour => (
                        <Card key={tour.id} className="w-[240px] overflow-hidden shrink-0 snap-start border-border hover:border-primary/40 transition-colors shadow-sm">
                          <div className="relative w-full h-32 bg-muted flex items-center justify-center overflow-hidden group">
                            <img src={tour.imageUrl || ''} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 bg-trust-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1 font-medium">
                              <Map className="w-3 h-3" /> {tour.durationDays} วัน
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-bold text-trust-900 text-xs line-clamp-2 mb-2 leading-tight hover:text-primary transition-colors cursor-pointer">{tour.title}</h3>
                            <div className="flex justify-between items-end mt-3 border-t border-border/50 pt-2">
                              <span className="text-[10px] text-muted-foreground">เริ่มต้น</span>
                              <span className="text-sm font-black text-primary">฿{tour.price.toLocaleString()}</span>
                            </div>
                            <Button size="sm" className="w-full mt-2 text-xs h-7" asChild>
                               <Link href={`/tour/${tour.id}`}>ดูรายละเอียด</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* AI Suggested Quick Reply Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.chips.map((chip, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleSuggestion(chip)}
                          className="px-3 py-1.5 bg-white border border-border hover:border-primary hover:bg-primary-50 text-trust-700 hover:text-primary rounded-full text-xs font-medium transition-all shadow-sm flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-primary/70" /> {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Tool Searching State */}
            {toolStatus && (
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0 mt-1 ring-1 ring-primary/20">
                   <Globe2 className="w-4 h-4 animate-spin-slow" />
                 </div>
                 <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-border shadow-sm flex items-center gap-2">
                   <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                   <span className="text-xs font-medium text-primary">{toolStatus}</span>
                 </div>
               </div>
            )}

            {/* Normal Typing Indicator */}
            {!toolStatus && isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center shrink-0 mt-1 shadow-sm ring-1 ring-primary/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-border shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-border shrink-0">
            <form id="ai-chat-form" onSubmit={handleSubmit} className="flex gap-2 relative items-end">
              <button type="button" className="p-2.5 text-muted-foreground hover:text-primary bg-muted rounded-full transition-colors shrink-0" title="อัปโหลดรูปภาพ / ไฟล์ PDF">
                 <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                 <textarea 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSubmit();
                      }
                   }}
                   placeholder="ถาม Jongtour AI ได้เลย..."
                   className="w-full bg-muted/50 border border-border rounded-2xl py-2.5 pl-4 pr-12 outline-none focus:border-primary focus:bg-white transition-all text-sm resize-none max-h-32 hide-scrollbar"
                   rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
                   disabled={isLoading}
                 />
                 <button 
                   type="submit" 
                   disabled={!input.trim() || isLoading}
                   className="absolute right-1.5 bottom-1.5 w-8 h-8 bg-primary hover:bg-primary-600 disabled:bg-muted-foreground/30 disabled:text-white disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                 >
                   <Send className="w-4 h-4 ml-0.5" />
                 </button>
              </div>
            </form>
            <div className="text-center mt-2">
               <span className="text-[10px] text-muted-foreground">AI อาจให้ข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญอีกครั้ง</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button with Pulse Effect */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-trust-900 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(15,23,42,0.3)] hover:scale-105 transition-all duration-300 z-[9999] group ${isOpen ? 'rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'}`}
        style={{ transformOrigin: 'center' }}
      >
        <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Sparkles className="w-6 h-6 md:w-7 md:h-7 relative z-10 text-primary group-hover:text-white transition-colors duration-300" />
        
        {/* Glow behind */}
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Notification badge */}
        <span className="absolute top-0 right-0 flex h-4 w-4 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-trust-900"></span>
        </span>
      </button>
    </>
  );
}
