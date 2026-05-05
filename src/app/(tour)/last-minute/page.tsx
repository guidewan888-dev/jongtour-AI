import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Last Minute Deal — ทัวร์นาทีสุดท้าย ราคาพิเศษ",
  description: "ทัวร์ Last Minute ราคาพิเศษ ที่นั่งเหลือน้อย จองเลยก่อนหมด",
};

export default function LastMinutePage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-amber-50 to-yellow-50 border-b border-amber-100">
        <div className="g-container py-16 text-center">
          <span className="text-5xl mb-4 block">⏰</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Last Minute Deal
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            ทัวร์นาทีสุดท้าย ที่นั่งเหลือน้อย ราคาลดพิเศษ ช้าอด!
          </p>
        </div>
      </section>

      <section className="g-container py-16">
        <div className="g-card p-12 text-center">
          <div className="g-empty">
            <span className="text-5xl mb-4">📋</span>
            <p className="g-empty-title">ยังไม่มีดีล Last Minute ในขณะนี้</p>
            <p className="g-empty-desc mb-6">ดีล Last Minute จะปรากฏที่นี่เมื่อมีโปรแกรมเดินทางด่วนในราคาพิเศษ</p>
            <div className="flex gap-3 justify-center">
              <Link href="/deals/flash-sale" className="btn-primary">
                ดูทัวร์ไฟไหม้
              </Link>
              <Link href="/search" className="btn-outline">
                ค้นหาทัวร์
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
