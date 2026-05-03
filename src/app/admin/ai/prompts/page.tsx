"use client";

import { useState } from "react";
import { Plus, GitCommit, FileCheck, CheckCircle2, Copy, History } from "lucide-react";

type PromptVersion = {
  version: number;
  isActive: boolean;
  content: string;
  updatedAt: string;
};

type PromptTemplate = {
  id: string;
  name: string;
  type: string;
  description: string;
  versions: PromptVersion[];
};

export default function PromptManagerPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  const [activeVersion, setActiveVersion] = useState<PromptVersion | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/admin/ai/prompts");
      const data = await res.json();
      if (data.templates) {
        // Map the DB structure to the UI structure
        const formattedPrompts = data.templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: "SYSTEM", // MVP default
          description: "Database Prompt",
          versions: t.versions.map((v: any) => ({
            id: v.id,
            version: v.version,
            isActive: v.version === t.currentVersion,
            content: v.content,
            updatedAt: new Date(v.createdAt).toLocaleDateString()
          }))
        }));
        setPrompts(formattedPrompts);
        
        if (formattedPrompts.length > 0 && !activePrompt) {
          const first = formattedPrompts[0];
          setActivePrompt(first);
          const activeVer = first.versions.find((v: any) => v.isActive) || first.versions[0];
          setActiveVersion(activeVer);
          setEditContent(activeVer.content);
        }
      }
    } catch (err) {
      console.error("Fetch prompts error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    setActivePrompt(prompt);
    const activeVer = prompt.versions.find(v => v.isActive) || prompt.versions[0];
    setActiveVersion(activeVer);
    setEditContent(activeVer?.content || "");
  };

  const handleSelectVersion = (version: PromptVersion) => {
    setActiveVersion(version);
    setEditContent(version.content);
  };

  const handleSaveNewVersion = async () => {
    if (!activePrompt) return;
    try {
      await fetch("/api/admin/ai/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: activePrompt.name, content: editContent, createdBy: "Admin" })
      });
      fetchPrompts(); // Refresh
      alert("Saved new version successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  const handleSetActiveVersion = async () => {
    if (!activeVersion) return;
    try {
      // Assuming version object has the database ID mapped as `id`
      await fetch(`/api/admin/ai/prompts/${(activeVersion as any).id}/activate`, {
        method: "POST"
      });
      fetchPrompts(); // Refresh
      alert("Activated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to activate.");
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Loading Prompts...</div>;
  if (!activePrompt || !activeVersion) return <div className="p-8">No Prompts Found.</div>;

  return (
    <div className="flex h-full">
      {/* Left Sidebar: Prompts List */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800">Prompt Templates</h2>
          <button className="bg-white border border-gray-200 p-1.5 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {prompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => handleSelectPrompt(prompt)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${activePrompt.id === prompt.id ? 'border-orange-500 bg-orange-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{prompt.type}</span>
                <span className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> v{prompt.versions.find(v => v.isActive)?.version}
                </span>
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{prompt.name}</h3>
              <p className="text-[11px] text-gray-500 line-clamp-2">{prompt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area: Prompt Editor */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {/* Header Options */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{activePrompt.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{activePrompt.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
              <History className="w-4 h-4" /> Compare Versions
            </button>
            <button onClick={handleSaveNewVersion} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-orange-500/30 transition-colors">
              <FileCheck className="w-4 h-4" /> Save as New Version (Draft)
            </button>
          </div>
        </div>

        {/* Version Control Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <GitCommit className="w-4 h-4" /> Versions
          </span>
          <div className="flex gap-2">
            {activePrompt.versions.map(v => (
              <button 
                key={v.version}
                onClick={() => handleSelectVersion(v)}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${activeVersion.version === v.version ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                v{v.version} {v.isActive && '(Active)'}
              </button>
            ))}
          </div>
          {!activeVersion.isActive && (
            <button onClick={handleSetActiveVersion} className="ml-auto flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-3 h-3" /> Set as Active Version
            </button>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-gray-700">System Instruction</label>
            <button className="text-xs font-bold text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors">
              <Copy className="w-3 h-3" /> Copy Prompt
            </button>
          </div>
          <textarea 
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-800 outline-none focus:bg-white focus:border-orange-500 transition-colors resize-none leading-relaxed"
            placeholder="Type your prompt instructions here..."
          />
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <strong>💡 Pro Tip:</strong> You can use variables like <code>&#123;&#123;customer_name&#125;&#125;</code> or <code>&#123;&#123;today_date&#125;&#125;</code> in your prompt.
          </div>
        </div>
      </div>
    </div>
  );
}
