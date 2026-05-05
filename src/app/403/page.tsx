"use client";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">403 — Access Denied</h1>
        <p className="text-slate-500 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-outline flex items-center gap-2">
            <Home className="w-4 h-4" /> หน้าหลัก
          </Link>
          <button onClick={() => history.back()} className="btn-primary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}
