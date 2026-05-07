"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Users, MapPin, ChevronRight, Loader2, Minus, Plus, ShieldCheck, Car } from "lucide-react";
import { setBookingSession } from "@/lib/bookingSession";

interface Departure {
  id: string;
  startDate: string;
  endDate: string;
  priceAdult: number;
  priceChild: number;
  priceSingle: number;
  priceInfant: number;
  deposit: number;
  totalSeats: number;
  booked: number;
  remainingSeats: number;
  status: string;
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

const ADD_ONS = [
  { id: "insurance", label: "ประกันภัยการเดินทาง", desc: "คุ้มครอง 2 ล้านบาท ทุกเหตุการณ์ไม่คาดคิด", price: 800, unit: "ท่าน", perPerson: true, icon: ShieldCheck },
  { id: "airport", label: "รถรับส่งสนามบิน", desc: "รับ-ส่งถึงหน้าบ้าน สะดวกสบาย", price: 1500, unit: "เที่ยว", perPerson: false, icon: Car },
];

const price = (n: number) => n > 0 ? `฿${n.toLocaleString()}` : '-';
const fmtDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export default function BookTourPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  // Quantity state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [singleRooms, setSingleRooms] = useState(0);

  // Add-ons
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});

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

  const totalPrice = useMemo(() => {
    if (!selectedDep) return 0;
    let total = 0;
    total += adults * selectedDep.priceAdult;
    total += children * (selectedDep.priceChild || selectedDep.priceAdult);
    total += singleRooms * (selectedDep.priceSingle || 0);
    ADD_ONS.forEach(a => { if (addOns[a.id]) total += a.perPerson ? a.price * (adults + children) : a.price; });
    return total;
  }, [selectedDep, adults, children, singleRooms, addOns]);

  const totalDeposit = useMemo(() => {
    if (!selectedDep || !selectedDep.deposit) return 0;
    return selectedDep.deposit * (adults + children);
  }, [selectedDep, adults, children]);

  const handleProceed = () => {
    if (!tour || !selectedDep) return;
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
      adults,
      children,
      singleRooms,
      addOns: Object.entries(addOns).filter(([, v]) => v).map(([k]) => k),
      totalPrice,
      totalDeposit,
      travelers: [],
      contactEmail: "",
      contactPhone: "",
    });
    router.push("/book/checkout/travelers");
  };

  if (loading) return <div className="bg-white min-h-[60vh] flex items-center justify-center"><div className="text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" /><p className="text-slate-500 font-medium">กำลังโหลดข้อมูลทัวร์...</p></div></div>;
  if (error || !tour) return <div className="bg-white min-h-[60vh] flex items-center justify-center"><div className="text-center"><div className="text-5xl mb-4">🔍</div><h2 className="text-xl font-bold text-slate-900 mb-2">ไม่พบโปรแกรมทัวร์</h2><p className="text-slate-500 mb-6">{error}</p><Link href="/search" className="btn-primary">กลับหน้าค้นหา</Link></div></div>;

  const availableDepartures = tour.departures.filter(d => d.remainingSeats > 0);
  const maxPax = selectedDep ? selectedDep.remainingSeats : 20;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">หน้าแรก</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/tour/${tour.slug}`} className="hover:text-primary-600 transition-colors">{tour.code}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">จองทัวร์</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tour Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">{tour.code}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">🏢 {tour.supplier.name}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{tour.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.country} {tour.city && `• ${tour.city}`}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {tour.duration.days} วัน {tour.duration.nights} คืน</span>
              </div>
            </div>

            {/* Departure Selection */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  📅 เลือกวันเดินทาง
                  <span className="text-xs text-slate-400 font-normal">({availableDepartures.length} รอบ)</span>
                </h2>
              </div>
              {availableDepartures.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {availableDepartures.map(dep => (
                    <label key={dep.id} className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-primary-50/50 ${selectedDeparture === dep.id ? "bg-primary-50 border-l-4 border-primary-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="departure" checked={selectedDeparture === dep.id} onChange={() => setSelectedDeparture(dep.id)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                        <div>
                          <div className="font-semibold text-slate-900">{fmtDate(dep.startDate)} → {fmtDate(dep.endDate)}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dep.remainingSeats <= 5 ? <span className="text-amber-600 font-medium">🔥 เหลือ {dep.remainingSeats} ที่นั่ง!</span> : <span>เหลือ {dep.remainingSeats} ที่นั่ง</span>}</span>
                            {dep.deposit > 0 && <span className="text-orange-600">มัดจำ {price(dep.deposit)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-primary-600">{price(dep.priceAdult)}</div>
                        <div className="text-[10px] text-slate-400">/ท่าน</div>
                        {dep.priceChild > 0 && dep.priceChild !== dep.priceAdult && <div className="text-[10px] text-slate-400">เด็ก {price(dep.priceChild)}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-slate-500 font-medium">ยังไม่มีรอบเดินทาง</p>
                </div>
              )}
            </div>

            {/* Quantity Selectors */}
            {selectedDep && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">👥 จำนวนผู้เดินทาง</h2>
                {/* Adults */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">ผู้ใหญ่</div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceAdult)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={adults <= 1}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(Math.min(maxPax, adults + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={adults + children >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Children */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">เด็ก <span className="text-xs text-slate-400 font-normal">(2-11 ปี)</span></div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceChild || selectedDep.priceAdult)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={children <= 0}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(Math.min(maxPax - adults, children + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={adults + children >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Single Room */}
                {selectedDep.priceSingle > 0 && (
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold text-slate-800">ห้องพักเดี่ยว</div>
                      <div className="text-xs text-slate-400">{price(selectedDep.priceSingle)} / ห้อง (เพิ่มเติม)</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSingleRooms(Math.max(0, singleRooms - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={singleRooms <= 0}><Minus className="w-4 h-4" /></button>
                      <span className="font-bold text-lg w-8 text-center">{singleRooms}</span>
                      <button onClick={() => setSingleRooms(singleRooms + 1)} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add-on Services */}
            {selectedDep && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">✨ บริการเสริมพิเศษ (Add-on)</h2>
                {ADD_ONS.map(addon => (
                  <label key={addon.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${addOns[addon.id] ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={!!addOns[addon.id]} onChange={() => setAddOns(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))} className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                      <addon.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">{addon.label}</div>
                      <div className="text-xs text-slate-400">{addon.desc}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary-600 text-sm">+฿{addon.price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">/{addon.unit}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">🧾 สรุปการจอง</h3>
              {selectedDep ? (
                <>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">รหัสทัวร์</span>
                      <span className="font-bold text-primary-600">{tour.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">วันเดินทาง</span>
                      <span className="font-medium">{fmtShort(selectedDep.startDate)}</span>
                    </div>
                    <hr className="border-slate-100" />
                    <div className="flex justify-between">
                      <span className="text-slate-500">ผู้ใหญ่ ×{adults}</span>
                      <span className="font-medium">{price(selectedDep.priceAdult * adults)}</span>
                    </div>
                    {children > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">เด็ก ×{children}</span>
                      <span className="font-medium">{price((selectedDep.priceChild || selectedDep.priceAdult) * children)}</span>
                    </div>}
                    {singleRooms > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">พักเดี่ยว ×{singleRooms}</span>
                      <span className="font-medium">{price(selectedDep.priceSingle * singleRooms)}</span>
                    </div>}
                    {ADD_ONS.map(a => addOns[a.id] && <div key={a.id} className="flex justify-between text-xs">
                      <span className="text-slate-400">{a.label}{a.perPerson ? ` ×${adults + children}` : ''}</span>
                      <span className="text-slate-500">{price(a.perPerson ? a.price * (adults + children) : a.price)}</span>
                    </div>)}
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
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>ที่นั่งเหลือ</span>
                      <span>{selectedDep.remainingSeats} ที่</span>
                    </div>
                  </div>
                  <button onClick={handleProceed} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all">
                    ดำเนินการจอง →
                  </button>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-sm text-slate-400">กรุณาเลือกวันเดินทางก่อน</p>
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
