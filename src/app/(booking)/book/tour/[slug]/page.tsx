"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Users, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { setBookingSession } from "@/lib/bookingSession";

interface Departure {
  id: string;
  startDate: string;
  endDate: string;
  priceAdult: number;
  priceChild: number;
  priceSingle: number;
  status: string;
  remainingSeats: number;
}

interface TourData {
  id: string;
  slug: string;
  code: string;
  title: string;
  supplier: { id: string; name: string };
  country: string;
  city: string;
  duration: { days: number; nights: number };
  images: string[];
  price: { starting: number };
  departures: Departure[];
}

export default function BookTourPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tours/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tour) setTour(data.tour);
        else setError(data.error || "ไม่พบโปรแกรมทัวร์");
      })
      .catch(() => setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const selectedDep = tour?.departures.find((d) => d.id === selectedDeparture);

  const handleProceed = () => {
    if (!tour || !selectedDep) return;

    // Save tour + departure info to sessionStorage
    setBookingSession({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourCode: tour.code,
      tourName: tour.title,
      supplier: tour.supplier.name,
      country: tour.country,
      durationDays: tour.duration.days,
      durationNights: tour.duration.nights,
      imageUrl: tour.images[0] || "",
      departureId: selectedDep.id,
      departureDate: selectedDep.startDate,
      departureEndDate: selectedDep.endDate,
      priceAdult: selectedDep.priceAdult,
      priceChild: selectedDep.priceChild || selectedDep.priceAdult,
      remainingSeats: selectedDep.remainingSeats,
      travelers: [],
      contactEmail: "",
      contactPhone: "",
    });

    router.push("/book/checkout/travelers");
  };

  if (loading) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลทัวร์...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ไม่พบโปรแกรมทัวร์</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link>
        </div>
      </div>
    );
  }

  const availableDepartures = tour.departures.filter(d => d.remainingSeats > 0);

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
            <Link href={`/tour/${tour.slug}`} className="hover:text-primary transition-colors">{tour.code}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">เลือกวันเดินทาง</span>
          </nav>
        </div>
      </div>

      <div className="g-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tour Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">{tour.code}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">🏢 {tour.supplier.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{tour.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.country} {tour.city && `• ${tour.city}`}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {tour.duration.days} วัน {tour.duration.nights} คืน</span>
              </div>
            </div>

            {/* Departure Table */}
            <div className="g-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  เลือกวันเดินทาง
                  <span className="text-xs text-slate-400 font-normal ml-2">({availableDepartures.length} รอบ)</span>
                </h2>
              </div>
              {availableDepartures.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {availableDepartures.map((dep) => (
                    <label
                      key={dep.id}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-primary-50/50 ${
                        selectedDeparture === dep.id ? "bg-primary-50 border-l-4 border-primary" : ""
                      }`}
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
                          <div className="font-semibold text-slate-900">
                            {new Date(dep.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                            {" → "}
                            {new Date(dep.endDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                            <Users className="w-3.5 h-3.5" />
                            {dep.remainingSeats <= 5 ? (
                              <span className="text-amber-600 font-medium">🔥 เหลือ {dep.remainingSeats} ที่นั่ง!</span>
                            ) : (
                              <span>เหลือ {dep.remainingSeats} ที่นั่ง</span>
                            )}
                            {dep.status === "CONFIRMED" && (
                              <span className="text-emerald-600 font-medium">• ยืนยันออกเดินทาง</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {dep.priceAdult > 0 ? (
                          <div className="text-xl font-bold text-primary">฿{dep.priceAdult.toLocaleString()}</div>
                        ) : (
                          <div className="text-sm text-slate-400">สอบถามราคา</div>
                        )}
                        <div className="text-xs text-slate-400">/ท่าน</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-slate-500 font-medium">ยังไม่มีรอบเดินทาง</p>
                  <p className="text-sm text-slate-400 mt-1">ติดต่อสอบถามรอบเดินทางเพิ่มเติม</p>
                  <Link href={`/contact?tour=${tour.code}`} className="btn-secondary mt-4 inline-block">ติดต่อสอบถาม</Link>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="g-card p-6 sticky top-24 space-y-4">
              <h3 className="font-bold text-slate-900">สรุปการจอง</h3>
              {selectedDep ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">รหัสทัวร์</span>
                      <span className="font-semibold text-primary">{tour.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">วันเดินทาง</span>
                      <span className="font-medium">{new Date(selectedDep.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ราคา/ท่าน</span>
                      <span className="font-bold text-primary">฿{selectedDep.priceAdult.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ที่นั่งเหลือ</span>
                      <span className="font-medium">{selectedDep.remainingSeats} ที่</span>
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <button
                    onClick={handleProceed}
                    className="btn-primary w-full text-center block"
                  >
                    ดำเนินการจอง →
                  </button>
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
