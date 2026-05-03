import Link from "next/link";
import { BarChart3, PieChart, TrendingUp, Download, Ticket, Users, FileText, Search, Activity, SearchIcon } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function ConsolidatedReportsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab = searchParams.tab || "sales";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const tabs = [
    { id: "sales", name: "Sales Report", icon: TrendingUp },
    { id: "bookings", name: "Booking Report", icon: Ticket },
    { id: "suppliers", name: "Supplier Report", icon: FileText },
    { id: "agents", name: "Agent Report", icon: Users },
    { id: "profits", name: "Profit Report", icon: BarChart3 },
    { id: "ai-searches", name: "AI Search Report", icon: SearchIcon },
  ];

  let metrics = {
    totalRevenue: 0,
    totalBookings: 0,
    totalSuppliers: 0,
    totalAgents: 0,
    totalAiSearches: 0
  };

  if (activeTab === "sales" || activeTab === "profits") {
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'COMPLETED');
    metrics.totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  }
  
  if (activeTab === "bookings") {
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    metrics.totalBookings = count || 0;
  }

  if (activeTab === "suppliers") {
    const { count } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });
    metrics.totalSuppliers = count || 0;
  }

  if (activeTab === "agents") {
    const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
    metrics.totalAgents = count || 0;
  }

  if (activeTab === "ai-searches") {
    const { count } = await supabase.from('ai_search_logs').select('*', { count: 'exact', head: true });
    metrics.totalAiSearches = count || 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ศูนย์รวมรายงาน (Reports Hub)</h2>
          <p className="text-gray-500">รายงานสรุปผลประกอบการดึงข้อมูลจากระบบ Real-time</p>
        </div>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
          <Download size={16} /> Export Master Report
        </button>
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
        {activeTab === 'sales' ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-50">
            {/* Chart 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center h-64">
               <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <BarChart3 className="text-orange-500" size={20} /> Total Revenue
               </h2>
               <p className="text-4xl font-black text-green-600">฿{metrics.totalRevenue.toLocaleString()}</p>
            </div>
            {/* Placeholder Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center h-64">
                <p className="text-gray-500">More charts coming soon...</p>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 h-[500px]">
            {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              รายงาน: {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            
            {activeTab === 'bookings' && <p className="text-3xl font-black text-blue-600 my-4">{metrics.totalBookings} <span className="text-lg text-gray-500 font-normal">Bookings</span></p>}
            {activeTab === 'suppliers' && <p className="text-3xl font-black text-blue-600 my-4">{metrics.totalSuppliers} <span className="text-lg text-gray-500 font-normal">Suppliers</span></p>}
            {activeTab === 'agents' && <p className="text-3xl font-black text-blue-600 my-4">{metrics.totalAgents} <span className="text-lg text-gray-500 font-normal">Agents</span></p>}
            {activeTab === 'ai-searches' && <p className="text-3xl font-black text-blue-600 my-4">{metrics.totalAiSearches} <span className="text-lg text-gray-500 font-normal">AI Queries</span></p>}

            <p className="max-w-md text-sm">
              กำลังรวบรวมข้อมูลดิบสำหรับการสร้าง {tabs.find(t => t.id === activeTab)?.name} 
              <br/><br/>(ระบบดึงข้อมูล Real-time แล้ว)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
