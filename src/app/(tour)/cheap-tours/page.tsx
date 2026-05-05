import React from "react";
import Link from "next/link";

export const metadata = {
  title: "ทัวร์ราคาดี — โปรแกรมคุณภาพในราคาประหยัด",
  description: "รวมทัวร์ต่างประเทศราคาดี คุณภาพคุ้มค่า จากทุก Wholesale",
};

export default function CheapToursPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="g-container py-16 text-center">
          <span className="text-5xl mb-4 block">💰</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            ทัวร์ราคาดี
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            โปรแกรมทัวร์คุณภาพในราคาประหยัด คัดสรรจากทุก Wholesale
          </p>
        </div>
      </section>

      <section className="g-container py-16">
        <div className="g-card p-12 text-center">
          <div className="g-empty">
            <span className="text-5xl mb-4">🔍</span>
            <p className="g-empty-title">กำลังรวบรวมทัวร์ราคาดี</p>
            <p className="g-empty-desc mb-6">ระบบกำลังรวบรวมโปรแกรมทัวร์ราคาพิเศษจากทุก Wholesale กรุณากลับมาตรวจสอบอีกครั้ง</p>
            <Link href="/search" className="btn-primary">
              ค้นหาทัวร์ทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
