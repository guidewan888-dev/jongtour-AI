"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles, User, Map, Loader2 } from "lucide-react";

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
};

export default function AIPlannerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "สวัสดีครับ! ผมคือ จองทัวร์ AI 🤖✨\nบอกผมมาได้เลยว่าคุณอยากไปที่ไหน หรือทริปในฝันของคุณเป็นยังไง ผมจะคัดสรรแพ็กเกจทัวร์ที่ตรงใจที่สุดมาให้ครับ!",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add User Message
    const userMessageObj: Message = { id: Date.now().toString(), role: "user", text: userMsg };
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      // Map messages to a simpler format for the backend
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, chatHistory })
      });
      
      if (!response.ok) throw new Error("API failed");
      
      // If it's returning JSON directly (fallback mode)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
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
      let buffer = "";
      let dataParsed = false;
      
      const aiMsgId = (Date.now() + 1).toString();
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
          const match = buffer.match(/__DATA__(.*?)__DATA__\n/s);
          if (match) {
            try { toursData = JSON.parse(match[1]).tours || []; } catch(e) {}
            aiText = buffer.slice(match[0].length);
            dataParsed = true;
          }
        } else {
          aiText += chunk;
        }

        if (dataParsed) {
          // Check for chips
          const chipsMatch = aiText.match(/__CHIPS__\[(.*?)\]/s);
          let displayText = aiText;
          if (chipsMatch) {
            try {
              chipsData = JSON.parse(`[${chipsMatch[1]}]`);
              displayText = aiText.replace(chipsMatch[0], "").trim();
            } catch(e) {}
          }
          
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, text: displayText, tours: toursData, chips: chipsData } : m
          ));
        }
      }
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "ขออภัยครับ ตอนนี้เซิร์ฟเวอร์ระบบ AI กำลังปรับปรุง ลองใหม่อีกครั้งนะครับ 😅",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col pt-8 pb-4">
      <div className="max-w-4xl mx-auto w-full px-4 flex-1 flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="bg-white rounded-t-3xl p-6 border-b border-gray-100 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">จองทัวร์ AI Planner</h1>
              <p className="text-sm text-gray-500">ผู้ช่วยจัดทริปอัจฉริยะ (ค้นหาจากฐานข้อมูลจริง)</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === "ai" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                {msg.role === "ai" ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-3`}>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-gray-900 text-white rounded-tr-sm" 
                    : "bg-orange-50/50 text-gray-800 border border-orange-100/50 rounded-tl-sm whitespace-pre-line"
                }`}>
                  {msg.text}
                </div>

                {/* Tour Cards (If AI returns tours) */}
                {msg.tours && msg.tours.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 w-full max-w-[600px] snap-x">
                    {msg.tours.map(tour => (
                      <Link href={`/tour/${tour.id}`} key={tour.id} className="w-[280px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group snap-start block shrink-0">
                        <div className="relative w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100 p-2">
                          <img src={tour.imageUrl || ''} alt={tour.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg" />
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                            <Map className="w-3 h-3" /> {tour.durationDays} วัน
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">{tour.title}</h3>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-xs text-gray-500">เริ่มต้นท่านละ</span>
                            <span className="text-lg font-bold text-orange-500">{tour.price.toLocaleString()} ฿</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Quick Reply Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.chips.map((chip, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSuggestion(chip)}
                        className="px-4 py-2 bg-white border border-orange-200 hover:border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full text-sm font-medium transition-colors shadow-sm"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl rounded-tl-sm border border-orange-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                <span className="text-sm text-gray-500">AI กำลังค้นหาแพ็กเกจที่ดีที่สุด...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="bg-white px-6 py-3 border-t border-gray-50 flex gap-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => handleSuggestion("แนะนำทัวร์ยุโรป ช่วงหน้าหนาวหน่อยครับ")} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
            🏰 แนะนำทัวร์ยุโรป
          </button>
          <button onClick={() => handleSuggestion("อยากไปญี่ปุ่น มีงบ 4 หมื่น ไปไหนได้บ้าง?")} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
            🌸 อยากไปญี่ปุ่น งบ 4 หมื่น
          </button>
          <button onClick={() => handleSuggestion("มีทัวร์เกาหลีใต้ โปรไฟล์ไหม้ไหมช่วงนี้")} className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors">
            🔥 โปรไฟไหม้เกาหลี
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 rounded-b-3xl border-t border-gray-100 shadow-sm shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="อยากไปเที่ยวไหน พิมพ์บอก จองทัวร์ AI ได้เลย..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-orange-500 focus:bg-white transition-all text-[15px]"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
