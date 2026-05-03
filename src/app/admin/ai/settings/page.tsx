"use client";

import { useState, useEffect } from "react";
import { Settings, ShieldAlert, Cpu, Save } from "lucide-react";

export default function SettingsPage() {
  const [modelSettings, setModelSettings] = useState<any[]>([]);
  const [guardrails, setGuardrails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [modelsRes, guardrailsRes] = await Promise.all([
        fetch("/api/admin/ai/model-settings"),
        fetch("/api/admin/ai/guardrails")
      ]);
      const modelsData = await modelsRes.json();
      const guardrailsData = await guardrailsRes.json();
      
      if (modelsData.settings) setModelSettings(modelsData.settings);
      if (guardrailsData.guardrails) setGuardrails(guardrailsData.guardrails);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleGuardrail = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/ai/guardrails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      // Optimistic update
      setGuardrails(prev => prev.map(g => g.id === id ? { ...g, isActive: !currentStatus } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const updateModelSetting = async (id: string, field: string, value: any) => {
    try {
      await fetch("/api/admin/ai/model-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value })
      });
      // Optimistic update
      setModelSettings(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Settings...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col space-y-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" />
          AI Engine Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure models, parameters, and safety guardrails.</p>
      </div>

      {/* Model Settings Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-gray-800">Model Configuration</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelSettings.map(setting => (
            <div key={setting.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{setting.feature} Engine</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Model Version</label>
                  <select 
                    value={setting.model}
                    onChange={(e) => updateModelSetting(setting.id, 'model', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="gpt-4o">GPT-4o (Smart)</option>
                    <option value="gpt-4o-mini">GPT-4o-mini (Fast)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Temperature ({setting.temperature})
                  </label>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.1" 
                    value={setting.temperature}
                    onChange={(e) => updateModelSetting(setting.id, 'temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guardrails Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-gray-800">Safety Guardrails (Anti-Hallucination)</h2>
        </div>
        <div className="p-0">
          {guardrails.map(guardrail => (
            <div key={guardrail.id} className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-gray-900">{guardrail.ruleName}</h3>
                  {guardrail.severity === "critical" && <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full uppercase">Critical</span>}
                  {guardrail.severity === "high" && <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-full uppercase">High</span>}
                </div>
                <p className="text-xs text-gray-500">{guardrail.description}</p>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => toggleGuardrail(guardrail.id, guardrail.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${guardrail.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${guardrail.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
