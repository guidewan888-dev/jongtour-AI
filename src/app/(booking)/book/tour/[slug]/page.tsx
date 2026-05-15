"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Users, MapPin, ChevronRight, Loader2, Minus, Plus, ShieldCheck, Car } from "lucide-react";
import { setBookingSession } from "@/lib/bookingSession";

const LINE_CONTACT_URL = "https://line.me/R/ti/p/@jongtour";

interface Departure {
  id: string;
  wholesaleId?: string;
  wholesaleName?: string;
  wholesaleSourceType?: string;
  startDate: string;
  endDate: string;
  priceAdult: number;
  priceChildWithBed?: number;
  priceChildWithoutBed?: number;
  priceChild: number;
  priceSingle: number;
  priceInfant: number;
  deposit: number;
  depositType?: 'per_person' | 'per_booking' | 'unknown';
  pdfUrl?: string;
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
  { id: "insurance", label: "เธเธฃเธฐเธเธฑเธเธ เธฑเธขเธเธฒเธฃเน€เธ”เธดเธเธ—เธฒเธ", desc: "เธเธธเนเธกเธเธฃเธญเธ 2 เธฅเนเธฒเธเธเธฒเธ— เธ—เธธเธเน€เธซเธ•เธธเธเธฒเธฃเธ“เนเนเธกเนเธเธฒเธ”เธเธดเธ”", price: 800, unit: "เธ—เนเธฒเธ", perPerson: true, icon: ShieldCheck },
  { id: "airport_transfer", label: "เธฃเธ–เธฃเธฑเธเธชเนเธเธชเธเธฒเธกเธเธดเธ", desc: "เธฃเธฑเธ-เธชเนเธเธ–เธถเธเธซเธเนเธฒเธเนเธฒเธ เธชเธฐเธ”เธงเธเธชเธเธฒเธข", price: 1500, unit: "เน€เธ—เธตเนเธขเธง", perPerson: false, icon: Car },
];

const price = (n: number) => n > 0 ? `เธฟ${n.toLocaleString()}` : '-';
const fmtDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export default function BookTourPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);

  // Quantity state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenNoBed, setChildrenNoBed] = useState(0);
  const [infants, setInfants] = useState(0);
  const [singleRooms, setSingleRooms] = useState(0);

  // Add-ons
  const [addOns, setAddOns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/tours/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tour) {
          setTour(data.tour);
          const depId = String(searchParams.get("dep") || "").trim();
          const wholesaleId = String(searchParams.get("wholesale") || "").trim();
          const departures = Array.isArray(data.tour.departures) ? data.tour.departures : [];
          const filtered = wholesaleId
            ? departures.filter((d: any) => (d.wholesaleId || data.tour.supplier?.id) === wholesaleId)
            : departures;
          const selectable = filtered.filter((d: any) => Number(d.remainingSeats || 0) > 0);
          if (depId && selectable.some((d: any) => d.id === depId)) {
            setSelectedDeparture(depId);
          } else if (selectable.length > 0) {
            setSelectedDeparture(selectable[0].id);
          }
        }
        else setError(data.error || "เนเธกเนเธเธเนเธเธฃเนเธเธฃเธกเธ—เธฑเธงเธฃเน");
      })
      .catch(() => setError("เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ"))
      .finally(() => setLoading(false));
  }, [params.slug, searchParams]);

  const selectedDep = tour?.departures.find((d) => d.id === selectedDeparture);
  const totalTravelers = adults + children + childrenNoBed + infants;

  const totalPrice = useMemo(() => {
    if (!selectedDep) return 0;
    let total = 0;
    total += adults * selectedDep.priceAdult;
    total += children * (selectedDep.priceChildWithBed || selectedDep.priceChild || selectedDep.priceAdult);
    total += childrenNoBed * (selectedDep.priceChildWithoutBed || selectedDep.priceChild || selectedDep.priceAdult);
    total += infants * (selectedDep.priceInfant || 0);
    total += singleRooms * (selectedDep.priceSingle || 0);
    ADD_ONS.forEach(a => { if (addOns[a.id]) total += a.perPerson ? a.price * totalTravelers : a.price; });
    return total;
  }, [selectedDep, adults, children, childrenNoBed, infants, singleRooms, addOns, totalTravelers]);

  const totalDeposit = useMemo(() => {
    if (!selectedDep || !selectedDep.deposit) return 0;
    if (selectedDep.depositType === 'per_booking') return selectedDep.deposit;
    if (selectedDep.depositType === 'per_person') return selectedDep.deposit * totalTravelers;
    return 0;
  }, [selectedDep, totalTravelers]);

  const handleProceed = () => {
    if (!tour || !selectedDep) return;
    const hasSeatForOnline = Number(selectedDep.remainingSeats || 0) >= totalTravelers;
    if (bookingMode === "ONLINE" && !hasSeatForOnline) return;
    setBookingSession({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourCode: tour.code,
      tourName: tour.title,
      supplier: tour.supplier.name,
      wholesaleId: selectedDep.wholesaleId || tour.supplier.id,
      wholesaleSourceType: selectedDep.wholesaleSourceType || "api",
      country: tour.country,
      durationDays: tour.duration.days,
      durationNights: tour.duration.nights,
      imageUrl: tour.images[0] || "",
      bookingMode,
      bookingHint,
      lineContactUrl: LINE_CONTACT_URL,
      departureId: selectedDep.id,
      departureDate: selectedDep.startDate,
      departureEndDate: selectedDep.endDate,
      priceAdult: selectedDep.priceAdult,
      priceChildWithBed: selectedDep.priceChildWithBed || selectedDep.priceChild || selectedDep.priceAdult,
      priceChildWithoutBed: selectedDep.priceChildWithoutBed || selectedDep.priceChild || selectedDep.priceAdult,
      priceInfant: selectedDep.priceInfant || 0,
      priceChild: selectedDep.priceChild || selectedDep.priceAdult,
      priceSingle: selectedDep.priceSingle || 0,
      deposit: selectedDep.deposit || 0,
      depositType: selectedDep.depositType || 'unknown',
      pdfUrl: selectedDep.pdfUrl || "",
      remainingSeats: selectedDep.remainingSeats,
      adults,
      children,
      childWithBedCount: children,
      childWithoutBedCount: childrenNoBed,
      infantCount: infants,
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

  if (loading) return <div className="bg-white min-h-[60vh] flex items-center justify-center"><div className="text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" /><p className="text-slate-500 font-medium">เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเธ—เธฑเธงเธฃเน...</p></div></div>;
  if (error || !tour) return <div className="bg-white min-h-[60vh] flex items-center justify-center"><div className="text-center"><div className="text-5xl mb-4">๐”</div><h2 className="text-xl font-bold text-slate-900 mb-2">เนเธกเนเธเธเนเธเธฃเนเธเธฃเธกเธ—เธฑเธงเธฃเน</h2><p className="text-slate-500 mb-6">{error}</p><Link href="/search" className="btn-primary">เธเธฅเธฑเธเธซเธเนเธฒเธเนเธเธซเธฒ</Link></div></div>;

  const requestedWholesale = String(searchParams.get("wholesale") || "").trim();
  const departuresByWholesale = requestedWholesale
    ? tour.departures.filter(d => (d.wholesaleId || tour.supplier.id) === requestedWholesale)
    : tour.departures;
  const availableDepartures = departuresByWholesale;
  const maxPax = selectedDep ? selectedDep.remainingSeats : 20;
  const isApiSource = !selectedDep || !selectedDep.wholesaleSourceType || selectedDep.wholesaleSourceType === "api";
  const hasKnownDeposit = !!selectedDep && Number(selectedDep.deposit || 0) > 0 && selectedDep.depositType && selectedDep.depositType !== "unknown";
  const hasCorePrice = !!selectedDep && Number(selectedDep.priceAdult || 0) > 0;
  const hasPdfSource = !!selectedDep && !!String(selectedDep.pdfUrl || "").trim();
  const hasSeatForOnline = !!selectedDep && Number(selectedDep.remainingSeats || 0) > 0;
  const bookingMode: "ONLINE" | "PAY_LATER_ONLY" | "CONTACT_STAFF" = !selectedDep
    ? "ONLINE"
    : !isApiSource || !hasSeatForOnline
      ? "CONTACT_STAFF"
      : (!hasCorePrice || !hasKnownDeposit || !hasPdfSource)
        ? "PAY_LATER_ONLY"
        : "ONLINE";
  const bookingHint =
    bookingMode === "CONTACT_STAFF"
      ? "รอบนี้ให้เจ้าหน้าที่ช่วยจองผ่าน LINE ได้ทันที"
      : bookingMode === "PAY_LATER_ONLY"
        ? "ข้อมูลบางส่วนยังไม่ครบ ระบบจะพาไปจองก่อนและชำระภายหลัง"
        : "";
  const canProceed = !!selectedDep && (bookingMode !== "ONLINE" || (totalTravelers <= maxPax && maxPax > 0));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">เธซเธเนเธฒเนเธฃเธ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/tour/${tour.slug}`} className="hover:text-primary-600 transition-colors">{tour.code}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">เธเธญเธเธ—เธฑเธงเธฃเน</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* โ”€โ”€โ”€ LEFT COLUMN โ”€โ”€โ”€ */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tour Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">{tour.code}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">๐ข {tour.supplier.name}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{tour.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.country} {tour.city && `โ€ข ${tour.city}`}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {tour.duration.days} เธงเธฑเธ {tour.duration.nights} เธเธทเธ</span>
              </div>
            </div>

            {/* Departure Selection */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  ๐“… เน€เธฅเธทเธญเธเธงเธฑเธเน€เธ”เธดเธเธ—เธฒเธ
                  <span className="text-xs text-slate-400 font-normal">({availableDepartures.length} เธฃเธญเธ)</span>
                </h2>
              </div>
              {availableDepartures.length > 0 ? (
                <>
                <div className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '304px' }}>
                  {availableDepartures.map(dep => (
                    <label key={dep.id} className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-primary-50/50 ${selectedDeparture === dep.id ? "bg-primary-50 border-l-4 border-primary-500" : ""}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="departure" checked={selectedDeparture === dep.id} onChange={() => setSelectedDeparture(dep.id)} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                        <div>
                          <div className="font-semibold text-slate-900">{fmtDate(dep.startDate)} โ’ {fmtDate(dep.endDate)}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dep.remainingSeats <= 5 ? <span className="text-amber-600 font-medium">๐”ฅ เน€เธซเธฅเธทเธญ {dep.remainingSeats} เธ—เธตเนเธเธฑเนเธ!</span> : <span>เน€เธซเธฅเธทเธญ {dep.remainingSeats} เธ—เธตเนเธเธฑเนเธ</span>}</span>
                            {dep.deposit > 0 && <span className="text-orange-600">เธกเธฑเธ”เธเธณ {price(dep.deposit)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-primary-600">{price(dep.priceAdult)}</div>
                        <div className="text-[10px] text-slate-400">/เธ—เนเธฒเธ</div>
                        {(dep.priceChildWithBed || dep.priceChild) > 0 && (dep.priceChildWithBed || dep.priceChild) !== dep.priceAdult && <div className="text-[10px] text-slate-400">เน€เธ”เนเธ {price(dep.priceChildWithBed || dep.priceChild)}</div>}
                      </div>
                    </label>
                  ))}
                </div>
                {availableDepartures.length > 4 && (
                  <div className="text-center py-2 text-xs text-slate-400 bg-gradient-to-t from-white to-transparent border-t border-slate-100">
                    โ• เน€เธฅเธทเนเธญเธเน€เธเธทเนเธญเธ”เธนเธฃเธญเธเน€เธ”เธดเธเธ—เธฒเธเน€เธเธดเนเธกเน€เธ•เธดเธก ({availableDepartures.length} เธฃเธญเธ)
                  </div>
                )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">๐“…</div>
                  <p className="text-slate-500 font-medium">เธขเธฑเธเนเธกเนเธกเธตเธฃเธญเธเน€เธ”เธดเธเธ—เธฒเธ</p>
                </div>
              )}
            </div>

            {/* Quantity Selectors */}
            {selectedDep && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">๐‘ฅ เธเธณเธเธงเธเธเธนเนเน€เธ”เธดเธเธ—เธฒเธ</h2>
                {/* Adults */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">เธเธนเนเนเธซเธเน</div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceAdult)} / เธ—เนเธฒเธ</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={adults <= 1}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(Math.min(maxPax, adults + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={totalTravelers >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                                {/* Children With Bed */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">เด็กมีเตียง <span className="text-xs text-slate-400 font-normal">(2-11 ปี)</span></div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceChildWithBed || selectedDep.priceChild || selectedDep.priceAdult)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={children <= 0}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(Math.min(maxPax, children + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={totalTravelers >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Children No Bed */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">เด็กไม่มีเตียง</div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceChildWithoutBed || selectedDep.priceChild || selectedDep.priceAdult)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChildrenNoBed(Math.max(0, childrenNoBed - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={childrenNoBed <= 0}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{childrenNoBed}</span>
                    <button onClick={() => setChildrenNoBed(Math.min(maxPax, childrenNoBed + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={totalTravelers >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Infants */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800">ทารก</div>
                    <div className="text-xs text-slate-400">{price(selectedDep.priceInfant || 0)} / ท่าน</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setInfants(Math.max(0, infants - 1))} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30" disabled={infants <= 0}><Minus className="w-4 h-4" /></button>
                    <span className="font-bold text-lg w-8 text-center">{infants}</span>
                    <button onClick={() => setInfants(Math.min(maxPax, infants + 1))} className="w-8 h-8 rounded-full border border-primary-300 bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors disabled:opacity-30" disabled={totalTravelers >= maxPax}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Single Room */}
                {selectedDep.priceSingle > 0 && (
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold text-slate-800">เธซเนเธญเธเธเธฑเธเน€เธ”เธตเนเธขเธง</div>
                      <div className="text-xs text-slate-400">{price(selectedDep.priceSingle)} / เธซเนเธญเธ (เน€เธเธดเนเธกเน€เธ•เธดเธก)</div>
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
                <h2 className="font-bold text-slate-900 flex items-center gap-2">โจ เธเธฃเธดเธเธฒเธฃเน€เธชเธฃเธดเธกเธเธดเน€เธจเธฉ (Add-on)</h2>
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
                      <div className="font-bold text-primary-600 text-sm">+เธฟ{addon.price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">/{addon.unit}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* โ”€โ”€โ”€ RIGHT SIDEBAR โ”€โ”€โ”€ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20 space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">๐งพ เธชเธฃเธธเธเธเธฒเธฃเธเธญเธ</h3>
              {selectedDep ? (
                <>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">เธฃเธซเธฑเธชเธ—เธฑเธงเธฃเน</span>
                      <span className="font-bold text-primary-600">{tour.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">เธงเธฑเธเน€เธ”เธดเธเธ—เธฒเธ</span>
                      <span className="font-medium">{fmtShort(selectedDep.startDate)}</span>
                    </div>
                    <hr className="border-slate-100" />
                    <div className="flex justify-between">
                      <span className="text-slate-500">เธเธนเนเนเธซเธเน ร—{adults}</span>
                      <span className="font-medium">{price(selectedDep.priceAdult * adults)}</span>
                    </div>
                    {children > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">เด็กมีเตียง ร—{children}</span>
                      <span className="font-medium">{price((selectedDep.priceChildWithBed || selectedDep.priceChild || selectedDep.priceAdult) * children)}</span>
                    </div>}
                    {childrenNoBed > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">เด็กไม่มีเตียง ร—{childrenNoBed}</span>
                      <span className="font-medium">{price((selectedDep.priceChildWithoutBed || selectedDep.priceChild || selectedDep.priceAdult) * childrenNoBed)}</span>
                    </div>}
                    {infants > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">ทารก ร—{infants}</span>
                      <span className="font-medium">{price((selectedDep.priceInfant || 0) * infants)}</span>
                    </div>}
                    {singleRooms > 0 && <div className="flex justify-between">
                      <span className="text-slate-500">เธเธฑเธเน€เธ”เธตเนเธขเธง ร—{singleRooms}</span>
                      <span className="font-medium">{price(selectedDep.priceSingle * singleRooms)}</span>
                    </div>}
                    {ADD_ONS.map(a => addOns[a.id] && <div key={a.id} className="flex justify-between text-xs">
                      <span className="text-slate-400">{a.label}{a.perPerson ? ` ร—${totalTravelers}` : ''}</span>
                      <span className="text-slate-500">{price(a.perPerson ? a.price * totalTravelers : a.price)}</span>
                    </div>)}
                    <hr className="border-slate-100" />
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-slate-800">เธฃเธฒเธเธฒเธฃเธงเธก</span>
                      <span className="text-primary-600">{price(totalPrice)}</span>
                    </div>
                    {totalDeposit > 0 && (
                      <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2">
                        <span className="text-orange-700 font-medium text-xs">๐’ฐ เธเธณเธฃเธฐเธกเธฑเธ”เธเธณ</span>
                        <span className="text-orange-700 font-bold">{price(totalDeposit)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>เธ—เธตเนเธเธฑเนเธเน€เธซเธฅเธทเธญ</span>
                      <span>{selectedDep.remainingSeats} เธ—เธตเน</span>
                    </div>
                  </div>
                  {bookingMode !== "ONLINE" && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                      {bookingHint}
                    </div>
                  )}
                  <button onClick={handleProceed} disabled={!canProceed} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {bookingMode === "CONTACT_STAFF" ? "ไปหน้าติดต่อเจ้าหน้าที่เพื่อจอง →" : bookingMode === "PAY_LATER_ONLY" ? "จองก่อน ชำระทีหลัง →" : "ดำเนินการจอง →"}
                  </button>
                  {bookingMode === "CONTACT_STAFF" && (
                    <a href={LINE_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="w-full mt-2 inline-flex items-center justify-center py-2.5 rounded-xl border border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50">
                      ติดต่อ LINE เจ้าหน้าที่
                    </a>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">๐“…</div>
                  <p className="text-sm text-slate-400">เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธงเธฑเธเน€เธ”เธดเธเธ—เธฒเธเธเนเธญเธ</p>
                </div>
              )}
              <p className="text-[10px] text-slate-400 text-center">๐”’ เธเนเธญเธกเธนเธฅเธเธฅเธญเธ”เธ เธฑเธข 100% เธ”เนเธงเธขเธเธฒเธฃเน€เธเนเธฒเธฃเธซเธฑเธช SSL</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}





