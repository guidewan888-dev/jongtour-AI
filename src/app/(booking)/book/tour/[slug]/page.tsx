"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Plane, MapPin, Star, ChevronRight } from "lucide-react";

export default function BookTourPage({ params }: { params: { slug: string } }) {
  const tourName = params.slug.replace(/-/g, " ");
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  const departures = [
    { id: "dep-1", date: "15 มิ.ย. 2026", seats: 8, price: 29900, status: "confirmed" },
    { id: "dep-2", date: "22 มิ.ย. 2026", seats: 12, price: 29900, status: "confirmed" },
    { id: "dep-3", date: "6 ก.ค. 2026", seats: 4, price: 31900, status: "almost-full" },
    { id: "dep-4", date: "20 ก.ค. 2026", seats: 15, price: 28900, status: "open" },
  ];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="g-container py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/search" className="hover:text-primary transition-colors">ค้นหาทัวร์</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium capitalize">{tourName}</span>
          </nav>
        </div>
      </div>

      <div className="g-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tour Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ยืนยันเดินทาง</span>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">LETGO</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 capitalize">ทัวร์{tourName}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> ญี่ปุ่น</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 6 วัน 4 คืน</span>
                <span className="flex items-center gap-1"><Plane className="w-4 h-4" /> Thai Airways (TG)</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> 4.8</span>
              </div>
            </div>

            {/* Departure Table */}
            <div className="g-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  เลือกวันเดินทาง
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {departures.map((dep) => (
                  <label
                    key={dep.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-primary-50/50 ${selectedDeparture === dep.id ? "bg-primary-50 border-l-4 border-primary" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="departure"
                        checked={selectedDeparture === dep.id}
                        onChange={() => setSelectedDeparture(dep.id)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{dep.date}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          เหลือ {dep.seats} ที่นั่ง
                          {dep.status === "confirmed" && <span className="text-emerald-600 font-medium">• ยืนยันออกเดินทาง</span>}
                          {dep.status === "almost-full" && <span className="text-amber-600 font-medium">• ใกล้เต็ม!</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">฿{dep.price.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">/ท่าน</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="g-card p-6 sticky top-24 space-y-4">
              <h3 className="font-bold text-slate-900">สรุปการจอง</h3>
              {selectedDeparture ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">วันเดินทาง</span><span className="font-medium">{departures.find(d => d.id === selectedDeparture)?.date}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">ราคา/ท่าน</span><span className="font-bold text-primary">฿{departures.find(d => d.id === selectedDeparture)?.price.toLocaleString()}</span></div>
                  </div>
                  <hr className="border-slate-100" />
                  <Link
                    href={`/book/checkout/travelers?tour=${params.slug}&departure=${selectedDeparture}`}
                    className="btn-primary w-full text-center block"
                  >
                    ดำเนินการจอง →
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">กรุณาเลือกวันเดินทางก่อน</p>
              )}
              <p className="text-xs text-slate-400 text-center">🔒 ข้อมูลปลอดภัย 100% ด้วยการเข้ารหัส SSL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
