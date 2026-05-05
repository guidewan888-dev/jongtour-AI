import React from "react";
import { Key, Plus, Shield, RefreshCw, Copy } from "lucide-react";

const integrations = [
  { name: "OpenAI", key: "sk-...4f8a", status: "active", lastUsed: "5 พ.ค.", type: "AI" },
  { name: "Supabase", key: "eyJhbG...xk2s", status: "active", lastUsed: "5 พ.ค.", type: "Database" },
  { name: "LINE Messaging API", key: "Ch...9a2b", status: "active", lastUsed: "4 พ.ค.", type: "Messaging" },
  { name: "Omise (Payment)", key: "pkey_...r4f1", status: "inactive", lastUsed: "1 เม.ย.", type: "Payment" },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">API Keys & Integrations</h1><p className="text-slate-500 text-sm mt-1">จัดการ API Keys และเชื่อมต่อระบบภายนอก</p></div>
        <button className="bg-primary hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> เพิ่ม Integration</button>
      </div>
      <div className="space-y-3">
        {integrations.map(i => (
          <div key={i.name} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Key className="w-5 h-5 text-slate-500" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="font-bold text-slate-900">{i.name}</span><span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-xs">{i.type}</span></div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{i.key}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${i.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{i.status}</span>
            <div className="text-xs text-slate-400">Last: {i.lastUsed}</div>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
