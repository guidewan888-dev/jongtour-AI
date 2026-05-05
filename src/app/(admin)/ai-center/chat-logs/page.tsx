export default function ChatLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <a href="/ai-center" className="text-xs font-bold text-blue-600 hover:underline">← AI Center</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">AI Chat Logs</h1>
        <p className="text-sm text-slate-500 mt-1">ประวัติการสนทนากับ AI Assistant</p>
      </div>
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-4xl mb-4">💬</p>
        <h2 className="text-xl font-black text-slate-700 mb-2">Chat Logs อยู่ระหว่างพัฒนา</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">ระบบบันทึกการสนทนา AI จะเปิดใช้เมื่อเพิ่ม AiChatSession model ใน Prisma schema</p>
      </div>
    </div>
  );
}
