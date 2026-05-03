"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, Search, Zap, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function AIDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch("/api/admin/ai/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Fallback to 0 if error occurs
        setStats({
          totalConversations: 0,
          hotLeads: 0,
          searchToursCalled: 0,
          privateGroupDrafts: 0,
          aiCostToday: 0,
          conversionRate: 0,
          hallucinationWarnings: 0,
          humanTakeovers: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading Dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of Jongtour Elite Sales OS performance</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.totalConversations}</h3>
          <p className="text-sm text-gray-500 font-medium">Total AI Chats</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +24%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.hotLeads}</h3>
          <p className="text-sm text-gray-500 font-medium">Hot Leads Created</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +1.2%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-4">{stats.conversionRate}%</h3>
          <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mt-4">${stats.aiCostToday.toFixed(2)}</h3>
          <p className="text-sm text-gray-500 font-medium">API Cost Today</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">System Health & Guardrails</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-gray-900">search_tours Calls</p>
                  <p className="text-xs text-gray-500">Number of times AI queried database</p>
                </div>
              </div>
              <div className="font-mono font-bold text-gray-900">{stats.searchToursCalled}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Human Takeovers</p>
                  <p className="text-xs text-gray-500">Sales staff manually took over the chat</p>
                </div>
              </div>
              <div className="font-mono font-bold text-amber-600">{stats.humanTakeovers}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Hallucination Warnings</p>
                  <p className="text-xs text-gray-500">Blocked AI from guessing prices</p>
                </div>
              </div>
              <div className="font-mono font-bold text-emerald-500">{stats.hallucinationWarnings} (Safe)</div>
            </div>
          </div>
        </div>

        {/* Action Queue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Pending Action</h2>
          
          <div className="flex flex-col gap-3">
            <Link href="/admin/ai/human-review" className="p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors flex justify-between items-center group">
              <div>
                <p className="text-sm font-bold text-red-700">Human Review</p>
                <p className="text-xs text-red-500/80 mt-0.5">Sensitive cases waiting</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">3</span>
            </Link>

            <Link href="/admin/ai/private-groups" className="p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors flex justify-between items-center group">
              <div>
                <p className="text-sm font-bold text-orange-700">Private Group</p>
                <p className="text-xs text-orange-500/80 mt-0.5">Drafts waiting for Sale</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">{stats.privateGroupDrafts}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
