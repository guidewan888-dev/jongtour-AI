import Link from "next/link";

export default function AdminNotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">404 — ไม่พบหน้านี้</h1>
      <p className="text-slate-500 mb-6 max-w-md">หน้าที่คุณกำลังค้นหาอาจถูกย้ายหรือลบออกแล้ว</p>
      <Link href="/dashboard" className="bg-primary hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
        กลับหน้า Dashboard
      </Link>
    </div>
  );
}
