import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-md">
        <div className="text-6xl font-black text-slate-200 mb-4">404</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">ไม่พบข้อมูลที่ต้องการ</h2>
        <p className="text-slate-500 text-sm mb-6">รายการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition-colors inline-block">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
