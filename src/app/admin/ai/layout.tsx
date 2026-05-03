import Link from "next/link";
import { LayoutDashboard, MessageSquareText, Search, Settings, ShieldAlert, Bot, ListTodo, Wrench, Users, FileText } from "lucide-react";

export default function AICenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
            <Bot className="w-6 h-6 text-orange-500" />
            AI Center
          </h2>
          <p className="text-xs text-gray-500 mt-1">Jongtour Elite Sales OS</p>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          
          {/* Analytics Section */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Analytics</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/ai" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/cost" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <span className="w-4 h-4 flex items-center justify-center font-bold">฿</span> Cost Control
                </Link>
              </li>
            </ul>
          </div>

          {/* Logs & Monitoring Section */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Monitoring</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/ai/chat-logs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <MessageSquareText className="w-4 h-4" /> Chat Logs
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/search-logs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <Search className="w-4 h-4" /> Search & Evidence Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Sales & Action Queue */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Sales Queue</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/ai/human-review" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4" /> Human Review
                  </div>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/private-groups" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <Users className="w-4 h-4" /> Private Groups Draft
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/quotations" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <FileText className="w-4 h-4" /> Quotation Drafts
                </Link>
              </li>
            </ul>
          </div>

          {/* Configuration Section */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">AI Engineering</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/ai/prompts" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <ListTodo className="w-4 h-4" /> Prompt Manager
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/tools" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <Wrench className="w-4 h-4" /> Tool Control
                </Link>
              </li>
              <li>
                <Link href="/admin/ai/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <Settings className="w-4 h-4" /> Model & Guardrails
                </Link>
              </li>
            </ul>
          </div>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
