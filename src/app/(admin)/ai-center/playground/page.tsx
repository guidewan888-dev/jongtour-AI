'use client';
import React, { useState } from 'react';

export default function AdminAIPlaygroundPage() {
  const [model, setModel] = useState('gpt-4o-mini');
  const [promptId, setPromptId] = useState('PR-001');
  const [temperature, setTemperature] = useState(0.7);
  const [userMessage, setUserMessage] = useState('มีทัวร์ญี่ปุ่นช่วงสงกรานต์ไหมครับ ไปกัน 3 คน ขอแบบราคาไม่เกิน 4 หมื่น');
  
  // Execution State
  const [isSimulating, setIsSimulating] = useState(false);
  const [toolCall, setToolCall] = useState<any>(null);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRunSimulation = () => {
    if (!userMessage) return;
    setIsSimulating(true);
    setToolCall(null);
    setFinalAnswer('');
    setSavedSuccess(false);

    // Simulate Tool Call step (takes 1.5s)
    setTimeout(() => {
      setToolCall({
        tool: 'search_tours_rag',
        arguments: {
          destination: 'Japan',
          month: 'April',
          minPax: 3,
          budgetLimit: 40000
        },
        database_response: 'Found 2 matching packages: [TYO-FUJI-5D3N, KIX-OSAKA-4D3N]'
      });

      // Simulate Final Answer generation (takes another 1s)
      setTimeout(() => {
        setFinalAnswer('สวัสดีครับช่วงสงกรานต์เรามีทัวร์ญี่ปุ่นว่างอยู่ 2 โปรแกรมที่อยู่ในงบ 40,000 บาทครับ!\n\n1. โตเกียว ฟูจิ ชินจูกุ (5 วัน 3 คืน) ราคา 35,900 บ.\n2. โอซาก้า เกียวโต (4 วัน 3 คืน) ราคา 32,900 บ.\n\nสนใจดูรายละเอียดโปรแกรมไหนดีครับ? ทางเรารับบัตรเครดิตไม่ชาร์จเพิ่มด้วยนะครับ');
        setIsSimulating(false);
      }, 1500);

    }, 1500);
  };

  const handleSaveTestCase = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced AI Playground</h1>

        {/* Layout Wrapper */}
        <div className="flex-1 flex flex-col lg:flex-row max-h-[calc(100vh-64px)] overflow-hidden">
          
          {/* Left Panel: Configuration & Input */}
          <div className="w-full lg:w-1/3 xl:w-96 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
<div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Select System Prompt</label>
                <select 
                  value={promptId} 
                  onChange={(e) => setPromptId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                >
                  <option value="PR-001">Sales Agent Core System (v3.2)</option>
                  <option value="PR-002">RAG Query Extractor (v1.5)</option>
                  <option value="PR-003">Tour Itinerary Summarizer (v2.0-draft)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Select LLM Model</label>
                <select 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                >
                  <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fastest)</option>
                  <option value="gpt-4o">OpenAI GPT-4o (Most Capable)</option>
                  <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Temperature ({temperature})</label>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-violet-600" 
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">User Message (Input)</label>
                <textarea 
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type a message to simulate..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-shadow resize-none h-32 shadow-inner"
                />
              </div>

              <button 
                onClick={handleRunSimulation}
                disabled={isSimulating || !userMessage}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl text-sm font-black transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isSimulating ? (
                  <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Executing Pipeline...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Run Simulation</>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Execution Output */}
          <div className="flex-1 bg-slate-900 flex flex-col min-w-0">
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              
              {!toolCall && !finalAnswer && !isSimulating && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  <p className="font-bold text-lg">Waiting for Execution</p>
                  <p className="text-sm">Click "Run Simulation" to execute the pipeline.</p>
                </div>
              )}

              {/* Tool Call Preview (Intermediate step) */}
              {(toolCall || isSimulating) && (
                <div className="animate-fade-in-up">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    Intermediate: Tool Execution
                  </h3>
                  <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm shadow-inner relative">
                    {toolCall ? (
                      <pre className="text-emerald-200 overflow-x-auto custom-scrollbar">
                        {JSON.stringify(toolCall, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500 py-4">
                        <svg className="w-4 h-4 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Determining required tool calls...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Final Answer Preview */}
              {(finalAnswer || (toolCall && isSimulating)) && (
                <div className="animate-fade-in-up">
                  <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Final Output: AI Response
                  </h3>
                  <div className="bg-violet-900/30 border border-violet-800 rounded-xl p-5 shadow-inner">
                    {finalAnswer ? (
                      <div className="text-violet-100 whitespace-pre-wrap leading-relaxed">
                        {finalAnswer}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-violet-400 py-4">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Generating final natural language response...
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Action Bar */}
            {finalAnswer && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-end gap-4 animate-fade-in-up">
                {savedSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Added to E2E Test Suite!
                  </div>
                )}
                <button 
                  onClick={handleSaveTestCase}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Save as Automated Test Case
                </button>
              </div>
            )}

          </div>

        </div>
  );
}
