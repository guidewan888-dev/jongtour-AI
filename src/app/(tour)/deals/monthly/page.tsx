import React from "react";
import Link from "next/link";

export const metadata = {
  title: "ราคาพิเศษเดือนนี้ — โปรโมชั่นทัวร์ประจำเดือน",
  description: "รวมโปรโมชั่นทัวร์ต่างประเทศราคาพิเศษประจำเดือน จาก Wholesale ชั้นนำ",
};

export default function MonthlyDealsPage() {
  const currentMonth = new Date().toLocaleString("th-TH", { month: "long", year: "numeric" });

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-violet-50 border-b border-purple-100">
        <div className="g-container py-16 text-center">
          <span className="text-5xl mb-4 block">💰</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            ราคาพิเศษเดือนนี้
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            โปรโมชั่นทัวร์ประจำ{currentMonth} คัดสรรจากทุก Wholesale
          </p>
        </div>
      </section>

      <section className="g-container py-16">
        <div className="g-card p-12 text-center">
          <div className="g-empty">
            <span className="text-5xl mb-4">📆</span>
            <p className="g-empty-title">ยังไม่มีโปรโมชั่นเดือนนี้</p>
            <p className="g-empty-desc mb-6">โปรโมชั่นจะปรากฏเมื่อมีดีลราคาพิเศษจาก Wholesale ในเดือนนี้</p>
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
