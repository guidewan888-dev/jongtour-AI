export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">กล่องข้อความ (Inbox)</h1>
        <p className="text-sm text-slate-500 mt-1">Omnichannel messaging — LINE, Facebook Messenger, Email</p>
      </div>

      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">ระบบ Inbox อยู่ระหว่างพัฒนา</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          ระบบ Omnichannel Inbox สำหรับรับ-ส่งข้อความจากทุกช่องทาง (LINE OA, Facebook Messenger, Email) จะเปิดใช้งานเร็วๆ นี้
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
            <span className="text-lg">💬</span>
            <span className="text-sm font-bold text-emerald-700">LINE Bot ทำงานอยู่</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
            <span className="text-lg">📧</span>
            <span className="text-sm font-bold text-slate-500">Email — รอเปิด</span>
          </div>
        </div>
      </div>
    </div>
  );
}
