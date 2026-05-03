import Link from "next/link";
import { Brain, Search, MessageSquare, AlertTriangle, Filter, Database, Activity, ToggleRight } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function AdminAICenterPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const activeTab = searchParams.tab || "search-logs";
  const searchQuery = searchParams.q || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const tabs = [
    { id: "search-logs", name: "AI Search Logs", icon: Search },
    { id: "chat-logs", name: "Chat Logs", icon: MessageSquare },
    { id: "failed-searches", name: "Failed Searches", icon: AlertTriangle },
    { id: "hallucinations", name: "Hallucination Warnings", icon: Brain },
    { id: "supplier-filters", name: "Supplier Filter Logs", icon: Filter },
    { id: "settings", name: "AI Settings", icon: Database },
  ];

  let activeData: any = null;

  if (activeTab === "search-logs") {
    const { data: searchLogs } = await supabase
      .from('ai_search_logs')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50);
    activeData = searchLogs;
  } else if (activeTab === "chat-logs") {
    const { data: chatLogs } = await supabase
      .from('ai_conversations')
      .select('*, user:users(email)')
      .order('updatedAt', { ascending: false })
      .limit(50);
    activeData = chatLogs;
  } else if (activeTab === "failed-searches") {
    const { data: failedLogs } = await supabase
      .from('ai_search_logs')
      .select('*')
      .eq('resultCount', 0)
      .order('createdAt', { ascending: false })
      .limit(50);
    activeData = failedLogs;
  }

  // Search filter
  if (searchQuery && activeData) {
    const q = searchQuery.toLowerCase();
    activeData = activeData.filter((item: any) => 
      item.queryText?.toLowerCase().includes(q) || 
      item.sessionId?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ศูนย์ควบคุม AI (AI Center)</h2>
          <p className="text-gray-500">ตรวจสอบการทำงานของ AI แชทบอท, Vector Search และบันทึกประวัติการค้นหา</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            AI CORE: ONLINE
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                  ${isActive ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Content Area */}
        {activeTab === 'settings' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 min-h-[500px]">
            {/* Semantic Search */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Vector Search Engine</h2>
                  <p className="text-xs text-gray-500">ควบคุมระบบค้นหาด้วยความหมาย</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800">Tour Semantic Search</p>
                    <p className="text-xs text-gray-500">ใช้งานบน tour.jongtour.com</p>
                  </div>
                  <ToggleRight className="text-emerald-500" size={32} />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800">Auto-generate Embeddings</p>
                    <p className="text-xs text-gray-500">ทำงานอัตโนมัติหลังดึง API เสร็จ</p>
                  </div>
                  <ToggleRight className="text-emerald-500" size={32} />
                </div>
                <button className="w-full text-center text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 py-2 rounded-lg transition-colors">
                  Rebuild Vector Index
                </button>
              </div>
            </div>

            {/* Chatbot Prompt */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Elite AI Prompt</h2>
                  <p className="text-xs text-gray-500">จัดการ System Prompt เริ่มต้นของบอท</p>
                </div>
              </div>

              <div className="space-y-4">
                <textarea 
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                  defaultValue="You are Jongtour Elite AI Sales Agent..."
                  readOnly
                ></textarea>
                <Link href="/admin/ai/prompts" className="block w-full text-center text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg transition-colors">
                  Edit Prompt
                </Link>
              </div>
            </div>
          </div>
        ) : activeTab === 'search-logs' || activeTab === 'failed-searches' ? (
          <div>
            <form className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
              <input type="hidden" name="tab" value={activeTab} />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={searchQuery}
                  placeholder={`ค้นหาประวัติ Query...`} 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100">
                ค้นหา
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Query</th>
                    <th className="px-6 py-4 font-bold">Result Count</th>
                    <th className="px-6 py-4 font-bold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeData && activeData.length > 0 ? activeData.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">"{log.queryText}"</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.resultCount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.resultCount} found
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString('th-TH')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">ไม่มีข้อมูล Search Logs</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'chat-logs' ? (
          <div>
            <form className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
              <input type="hidden" name="tab" value={activeTab} />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={searchQuery}
                  placeholder={`ค้นหาในแชท...`} 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100">
                ค้นหา
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Session / User</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Summary</th>
                    <th className="px-6 py-4 font-bold">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeData && activeData.length > 0 ? activeData.map((chat: any) => (
                    <tr key={chat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-gray-500">{chat.sessionId.substring(0, 8)}...</p>
                        <p className="font-bold text-gray-800">{chat.user?.email || "Guest"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${chat.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {chat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{chat.summary || "ไม่มีบทสรุป"}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(chat.updatedAt).toLocaleString('th-TH')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">ไม่มีข้อมูลแชท</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 h-[500px]">
            {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              ประวัติ: {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <p className="max-w-md text-sm">
              กำลังรอทีมพัฒนาต่อเชื่อมข้อมูลในส่วนนี้ <br/><br/>(ระบบได้เตรียม API ไว้แล้ว)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
