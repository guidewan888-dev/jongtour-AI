"use client";

import { useState } from "react";
import { Search, Flame, Snowflake, Coffee, Hand, MessageSquareText, FileText, CheckCircle2 } from "lucide-react";

type MockChat = {
  id: string;
  customerName: string;
  lastMessage: string;
  time: string;
  status: "ACTIVE" | "HANDOFF" | "CLOSED";
  temperature: "HOT" | "WARM" | "COLD";
  tokenUsed: number;
};

export default function ChatLogsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/admin/ai/conversations");
      const data = await res.json();
      if (data.conversations) {
        const mapped = data.conversations.map((c: any) => ({
          id: c.id,
          customerName: c.customerName || "คุณลูกค้า (Unknown)",
          lastMessage: c.messages?.[0]?.content || "No message",
          time: new Date(c.updatedAt).toLocaleTimeString(),
          status: c.status === "human_takeover" ? "HANDOFF" : "ACTIVE",
          temperature: c.bookingIntent ? "HOT" : "WARM",
          tokenUsed: 0
        }));
        setChats(mapped);
        if (mapped.length > 0 && !activeChat) {
          setActiveChat(mapped[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleTakeover = async () => {
    if (!activeChat) return;
    try {
      await fetch(`/api/admin/ai/conversations/${activeChat.id}/takeover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "Admin_123" })
      });
      fetchChats();
      alert("Takeover successful! You can now chat.");
    } catch (err) {
      console.error(err);
      alert("Failed to takeover");
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Chat Logs...</div>;
  if (!activeChat) return <div className="p-8">No Active Chats.</div>;

  return (
    <div className="flex h-full">
      {/* Left Sidebar: Chat List */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Chat & Takeover Logs</h2>
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search customer..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-orange-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat: any) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full text-left p-4 border-b border-gray-50 hover:bg-orange-50 transition-colors ${activeChat.id === chat.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-gray-900">{chat.customerName}</span>
                <span className="text-[10px] text-gray-500">{chat.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mb-2">{chat.lastMessage}</p>
              <div className="flex gap-2">
                {chat.temperature === "HOT" && <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold"><Flame className="w-3 h-3" /> HOT LEAD</span>}
                {chat.temperature === "WARM" && <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold"><Coffee className="w-3 h-3" /> WARM</span>}
                {chat.temperature === "COLD" && <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold"><Snowflake className="w-3 h-3" /> COLD</span>}
                
                {chat.status === "HANDOFF" && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Needs Review</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Chat Details */}
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="font-black text-lg text-gray-900">{activeChat.customerName}</h2>
            <p className="text-xs text-gray-500">ID: {activeChat.id} • Tokens Used: {activeChat.tokenUsed}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
              <FileText className="w-4 h-4" /> Convert to Quotation
            </button>
            <button onClick={handleTakeover} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-orange-500/30 transition-colors">
              <Hand className="w-4 h-4" /> Takeover Chat
            </button>
          </div>
        </div>

        {/* Chat Transcript */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-center">
            <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Today</span>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">U</div>
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-xl">
              <p className="text-sm text-gray-800">{activeChat.lastMessage}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2 items-center text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
              <Search className="w-3 h-3 text-orange-500" /> 
              <span>Tool Call: <code className="text-orange-500 font-mono">search_tours(&#123; destination: "Japan" &#125;)</code></span>
              <span>• Latency 450ms</span>
            </div>
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white shrink-0"><MessageSquareText className="w-4 h-4" /></div>
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-xl text-orange-900 text-sm">
                ได้เลยครับ! สำหรับช่วงสงกรานต์ที่ญี่ปุ่น ตอนนี้ผมค้นหาทัวร์ที่มีที่นั่งว่างมาให้แล้วครับ มี 3 โปรแกรมที่น่าสนใจ...
              </div>
            </div>
          </div>

          {activeChat.status === "HANDOFF" && (
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 border-t border-amber-200"></div>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
                <Hand className="w-4 h-4" /> AI Handed over to Human
              </span>
              <div className="flex-1 border-t border-amber-200"></div>
            </div>
          )}
        </div>

        {/* Input Area (Only active if Taken Over) */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder={activeChat.status === "HANDOFF" ? "พิมพ์ข้อความตอบกลับลูกค้า..." : "กด Takeover ก่อนเพื่อพิมพ์ตอบลูกค้า..."} 
              disabled={activeChat.status !== "HANDOFF"}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-24 outline-none focus:bg-white focus:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              disabled={activeChat.status !== "HANDOFF"}
              className="absolute right-2 top-2 bottom-2 px-4 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
