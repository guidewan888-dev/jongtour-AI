"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

export default function LineCrmPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/admin/line-crm')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LINE AI CRM Dashboard</h1>
          <p className="text-gray-500 text-sm">ติดตามการทำงานของ AI และประวัติการสนทนากับลูกค้าผ่าน LINE</p>
        </div>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          &larr; กลับหน้าแอดมิน
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Session List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ยังไม่มีการสนทนา</div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => setSelectedSession(session)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800 truncate pr-2">LINE User: {session.lineUserId.substring(0, 8)}...</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: th })}
                  </span>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 line-clamp-2">
                  {session.summary ? (
                    <span className="flex items-start gap-1">
                      <span className="text-blue-500">🤖</span> {session.summary}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">ยังไม่มีการสรุปข้อมูล</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${session.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {session.status}
                  </span>
                  <span className="text-xs text-gray-500">{session.messages?.length || 0} ข้อความ</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Content: Chat History */}
        <div className="w-2/3 bg-gray-50 flex flex-col">
          {selectedSession ? (
            <>
              <div className="bg-white p-4 border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-800">แชทของ User: {selectedSession.lineUserId}</h2>
                  <p className="text-xs text-gray-500">อัปเดตล่าสุด: {new Date(selectedSession.updatedAt).toLocaleString('th-TH')}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedSession.messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'assistant' && <div className="text-xs text-gray-400 font-bold mb-1">🤖 AI Planner</div>}
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('th-TH')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p>เลือกรายการสนทนาด้านซ้ายเพื่อดูรายละเอียด</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
