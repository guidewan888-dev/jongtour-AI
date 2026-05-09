"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Users, MapPin, ChevronRight, Loader2, Minus, Plus } from "lucide-react";
import { setBookingSession } from "@/lib/bookingSession";

interface TourPeriod {
  id: number;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  seatsLeft: number | null;
  status: string;
  rawText: string;
}

interface ScraperTour {
  id: string;
  code: string;
  title: string;
  site: string;
  country: string;
  duration: string;
  durationDays: number;
  durationNights: number;
  airline: string;
  price: number;
  imageUrl: string;
  sourceUrl: string;
  pdfUrl: string;
  deposit: number;
  hotelRating: number;
  highlights: string[];
  lastScraped: string;
  periods: TourPeriod[];
}

const LINE_URL = "https://line.me/R/ti/p/@jongtour";
const price = (n: number) => (n > 0 ? `฿${n.toLocaleString()}` : "-");
const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return s;
  }
};

export default function ScraperBookTourPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tour, setTour] = useState<ScraperTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    fetch(`/api/tours/scraper/${params.code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tour) {
          setTour(data.tour);
          // Auto-select period from URL param
          const periodParam = searchParams.get("period");
          if (periodParam) setSelectedPeriod(parseInt(periodParam));
        } else setError(data.error || "ไม่พบโปรแกรมทัวร์");
      })
      .catch(() => setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"))
      .finally(() => setLoading(false));
  }, [params.code, searchParams]);

  const selPeriod = tour?.periods.find((p) => p.id === selectedPeriod);
  const unitPrice = selPeriod?.price || tour?.price || 0;

  const totalPrice = useMemo(() => {
    return unitPrice * (adults + children);
  }, [unitPrice, adults, children]);

  const totalDeposit = useMemo(() => {
    if (!tour?.deposit) return 0;
    return tour.deposit * (adults + children);
  }, [tour?.deposit, adults, children]);

  const handleProceed = () => {
    if (!tour) return;
    setBookingSession({
      tourId: tour.id,
      tourSlug: `s/${tour.code.toLowerCase()}`,
      tourCode: tour.code,
      tourName: tour.title,
      supplier: tour.site,
      country: tour.country,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      imageUrl: tour.imageUrl || "",
      departureId: selPeriod ? `scraper_${selPeriod.id}` : "scraper_inquiry",
      departureDate: selPeriod?.startDate || "",
      departureEndDate: selPeriod?.endDate || "",
      priceAdult: unitPrice,
      priceChild: unitPrice,
      priceSingle: 0,
      deposit: tour.deposit || 0,
      remainingSeats: selPeriod?.seatsLeft || 99,
      adults,
      children,
      singleRooms: 0,
      addOns: [],
      totalPrice,
      totalDeposit,
      travelers: [],
      contactEmail: "",
      contactPhone: "",
    });
    router.push("/book/checkout/travelers");
  };

  if (loading)
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลทัวร์...</p>
        </div>
      </div>
    );

  if (error || !tour)
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

  const availablePeriods = tour.periods.filter((p) => p.status !== "full" && (p.seatsLeft === null || p.seatsLeft > 0));
  const maxPax = selPeriod?.seatsLeft || 20;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">หน้าแรก</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/tour/s/${tour.code.toLowerCase()}`} className="hover:text-primary-600 transition-colors">{tour.code}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">จองทัวร์</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tour Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">{tour.code}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">🏢 {tour.site}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{tour.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.country}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {tour.duration || `${tour.durationDays} วัน ${tour.durationNights} คืน`}</span>
                {tour.airline && <span className="flex items-center gap-1">✈️ {tour.airline}</span>}
              </div>
            </div>

            {/* Period Selection */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  📅 เลือกวันเดินทาง
                  <span className="text-xs text-slate-400 font-normal">({availablePeriods.length} รอบ)</span>
                </h2>
              </div>
              {availablePeriods.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {availablePeriods.map((p) => {
                    let dateLabel = p.rawText || "สอบถามวันเดินทาง";
                    if (p.startDate && p.endDate) {
                      try {
                        dateLabel = `${fmtDate(p.startDate)} → ${fmtDate(p.endDate)}`;
                      } catch { /* keep rawText */ }
                    }
                    if (dateLabel.length > 80) dateLabel = dateLabel.slice(0, 77) + "...";
                    return (
                      <label key={p.id} className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-primary-50/50 ${selectedPeriod === p.id ? "bg-primary-50 border-l-4 border-primary-500" : ""}`}>
                        <div className="flex items-center gap-4">
                          <input type="radio" name="period" checked={selectedPeriod === p.id} onChange={() => setSelectedPeriod(p.id)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{dateLabel}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                              {p.seatsLeft !== null && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {p.seatsLeft <= 5 ? <span className="text-amber-600 font-medium">🔥 เหลือ {p.seatsLeft} ที่นั่ง!</span> : <span>เหลือ {p.seatsLeft} ที่นั่ง</span>}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {p.price && p.price > 0 ? (
                            <>
                              <div className="text-lg font-bold text-primary-600">{price(p.price)}</div>
                              <div className="text-[10px] text-slate-400">/ท่าน</div>
                            </>
                          ) : (
                            <div className="text-sm text-slate-400">สอบถาม</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-slate-500 font-medium">ยังไม่มีรอบเดินทาง</p>
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-4 h-4" /> สอบถามวันเดินทาง
                  </a>
                </div>
              )}
            </div>

            {/* Quantity Selectors */}
            {(selPeriod || unitPrice > 0) && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">👥 จำนวนผู้เดินทาง</h2>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">ผู้ใหญ่</div>
                    <div className="text-xs text-slate-400">{price(unitPrice)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={adults <= 1}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(Math.min(maxPax, adults + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={adults + children >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-slate-800">เด็ก <span className="text-xs text-slate-400 font-normal">(2-11 ปี)</span></div>
                    <div className="text-xs text-slate-400">{price(unitPrice)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={children <= 0}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(Math.min(maxPax - adults, children + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={adults + children >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">🧾 สรุปการจอง</h3>
              {unitPrice > 0 ? (
                <>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">รหัสทัวร์</span>
                      <span className="font-bold text-primary-600">{tour.code}</span>
                    </div>
                    {selPeriod?.startDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">วันเดินทาง</span>
                        <span className="font-medium text-xs">{fmtDate(selPeriod.startDate)}</span>
                      </div>
                    )}
                    <hr className="border-slate-100" />
                    <div className="flex justify-between">
                      <span className="text-slate-500">ผู้ใหญ่ ×{adults}</span>
                      <span className="font-medium">{price(unitPrice * adults)}</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">เด็ก ×{children}</span>
                        <span className="font-medium">{price(unitPrice * children)}</span>
                      </div>
                    )}
                    <hr className="border-slate-100" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-slate-800">ราคารวม</span>
                      <span className="text-primary-600">{price(totalPrice)}</span>
                    </div>
                    {totalDeposit > 0 && (
                      <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                        <span className="text-orange-700 font-medium text-xs">💰 ชำระมัดจำ</span>
                        <span className="text-orange-700 font-bold">{price(totalDeposit)}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={handleProceed} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all">
                    ดำเนินการจอง →
                  </button>
                  <div className="text-center">
                    <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
                      💬 หรือจองผ่าน LINE
                    </a>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm text-slate-500 mb-4">สอบถามราคาและจองผ่าน LINE</p>
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-4 h-4" /> แอดไลน์จอง
                  </a>
                </div>
              )}
              <p className="text-[10px] text-slate-400 text-center">🔒 ข้อมูลปลอดภัย 100% ด้วยการเข้ารหัส SSL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
