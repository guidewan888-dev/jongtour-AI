export default function ReviewQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <a href="/ai-center" className="text-xs font-bold text-blue-600 hover:underline">← AI Center</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">AI Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">ตรวจสอบ AI Responses ก่อนส่งให้ลูกค้า</p>
      </div>
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-4xl mb-4">📋</p>
        <h2 className="text-xl font-black text-slate-700 mb-2">Review Queue อยู่ระหว่างพัฒนา</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">คิวตรวจสอบ AI responses จะเปิดใช้เมื่อ Human-in-the-loop workflow ถูก implement</p>
      </div>
    </div>
  );
}
