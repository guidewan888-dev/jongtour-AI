"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Check, X, Star, Download, Loader2, Sparkles } from "lucide-react";
import { FitProposalPDF } from "./FitProposalPDF";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";

const MapRoute = dynamic(() => import("./MapRoute"), { ssr: false });

export default function InteractiveItinerary({ itinerary }: { itinerary: any }) {
  const [days, setDays] = useState(itinerary?.days || []);
  const [localAirline, setLocalAirline] = useState(itinerary?.airlineCode || itinerary?.recommendedFlight?.airlineCode || "");
  const [preferredWholesale, setPreferredWholesale] = useState("ไม่ระบุ (หาที่ราคาดีที่สุดให้)");
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [pax, setPax] = useState(2);
  const [hotelStars, setHotelStars] = useState(itinerary?.hotelStars || 3);
  const [estimatedPrice, setEstimatedPrice] = useState(itinerary?.estimatedPrice || "");
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isRegeneratingFullPlan, setIsRegeneratingFullPlan] = useState(false);

  const handleRegenerateFullPlan = async () => {
    setIsRegeneratingFullPlan(true);
    try {
      const country = itinerary?.country || itinerary?.title || "Unknown";
      const res = await fetch("/api/fit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: country,
          durationDays: days.length,
          pax: pax,
          hotelStars: hotelStars,
          airlineCode: localAirline,
          isPreview: true,
          prompt: `ลูกค้าปรับแก้ไขแผนเดิม รบกวนเขียนแผนการเดินทางใหม่ให้ครอบคลุม ${days.length} วัน โรงแรม ${hotelStars} ดาว สายการบิน ${localAirline}`
        })
      });
      const data = await res.json();
      if (data.success && data.itinerary) {
        setDays(data.itinerary.days || []);
        if (data.itinerary.recommendedFlight) {
           setRecommendedFlight(data.itinerary.recommendedFlight);
           if (data.itinerary.recommendedFlight.airlineCode) {
             setLocalAirline(data.itinerary.recommendedFlight.airlineCode);
           }
        }
        if (data.itinerary.estimatedPrice) setEstimatedPrice(data.itinerary.estimatedPrice);
      } else {
        alert("ขออภัย ไม่สามารถสร้างแผนใหม่ได้ในขณะนี้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setIsRegeneratingFullPlan(false);
    }
  };

  useEffect(() => {
    const fetchNewPrice = async () => {
      setIsCalculatingPrice(true);
      try {
        const country = itinerary?.country || itinerary?.title || "Unknown";
        const res = await fetch("/api/fit-request/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            durationDays: days.length,
            pax: pax,
            hotelStars: hotelStars,
            country: country,
            airlineCode: localAirline
          })
        });
        const data = await res.json();
        if (data.success && data.estimatedPrice) {
          setEstimatedPrice(data.estimatedPrice);
        }
      } catch (err) {
        console.error("Price recalculation failed", err);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    const timer = setTimeout(() => {
      fetchNewPrice();
    }, 600);

    return () => clearTimeout(timer);
  }, [days.length, pax, localAirline, hotelStars, itinerary?.country, itinerary?.title]);

  const addDay = () => {
    const newDayNum = days.length + 1;
    setDays([...days, {
      day: newDayNum,
      title: "วันที่ว่าง (แก้ไขหรือกด AI ด้านขวาเพื่อสร้างแผน)",
      detail: "รอการเพิ่มสถานที่และรายละเอียด...",
      meals: { breakfast: false, lunch: false, dinner: false },
      hotel: "-",
    }]);
  };

  const removeDay = () => {
    if (days.length > 1) {
      setDays(days.slice(0, -1));
    }
  };

  const [recommendedFlight, setRecommendedFlight] = useState<any>(itinerary?.recommendedFlight || null);
  const [editingFlight, setEditingFlight] = useState(false);
  const [flightEditPrompt, setFlightEditPrompt] = useState("");
  const [isRegeneratingFlight, setIsRegeneratingFlight] = useState(false);

  const handleRegenerateFlight = async () => {
    if (!flightEditPrompt.trim()) return;
    setIsRegeneratingFlight(true);
    try {
      const country = itinerary.country || itinerary.title;
      const res = await fetch("/api/chat/regenerate-flight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, currentFlight: recommendedFlight, instruction: flightEditPrompt })
      });
      const data = await res.json();
      if (data.success && data.newFlight) {
        setRecommendedFlight(data.newFlight);
        setLocalAirline(data.newFlight.airlineCode || "");
        setEditingFlight(false);
        setFlightEditPrompt("");
      } else {
        alert("ขออภัย ไม่สามารถปรับแก้เที่ยวบินได้ในขณะนี้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setIsRegeneratingFlight(false);
    }
  };

  const handleRegenerateDay = async (index: number) => {
    if (!editPrompt.trim()) return;
    setIsRegenerating(true);
    try {
      const country = itinerary.country || itinerary.title;
      const res = await fetch("/api/chat/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, dayObject: days[index], instruction: editPrompt })
      });
      const data = await res.json();
      if (data.success && data.newDay) {
        const newDays = [...days];
        newDays[index] = data.newDay;
        setDays(newDays);
        setEditingDayIndex(null);
        setEditPrompt("");
      } else {
        alert("ขออภัย ไม่สามารถปรับแก้ได้ในขณะนี้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
    } finally {
      setIsRegenerating(false);
    }
  };

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "", pax: "2" });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      const country = itinerary.country || itinerary.title; 
      const res = await fetch("/api/fit-request/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          pax: pax.toString(),
          durationDays: days.length,
          country,
          preferredAirline: localAirline,
          preferredWholesale,
          itinerary: { ...itinerary, days, airlineCode: localAirline, recommendedFlight, estimatedPrice }
        })
      });
      if (res.ok) {
        setLeadSuccess(true);
        setTimeout(() => {
          setShowLeadForm(false);
          setLeadSuccess(false);
          setLeadForm({ name: "", phone: "", email: "", pax: "2" });
        }, 3000);
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index - 1];
      newDays[index - 1] = temp;
      newDays.forEach((d: any, i: number) => d.day = i + 1);
      setDays(newDays);
    } else if (direction === 'down' && index < days.length - 1) {
      const newDays = [...days];
      const temp = newDays[index];
      newDays[index] = newDays[index + 1];
      newDays[index + 1] = temp;
      newDays.forEach((d: any, i: number) => d.day = i + 1);
      setDays(newDays);
    }
  };

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Jongtour_FIT_Proposal_${itinerary.title}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!itinerary) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Promotional Banner Header - Flight Info Centric */}
      <div className="relative min-h-[420px] w-full bg-gradient-to-br from-orange-50 to-rose-50 overflow-hidden no-print border-b border-gray-100 flex flex-col md:flex-row">
        {/* Decorative CSS Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-200/40 to-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/4 -translate-x-1/4"></div>

        {/* Content Left Side */}
        <div className="relative z-40 p-6 md:p-10 md:w-3/5 h-full flex flex-col justify-center">
          {/* Jongtour Logo */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 uppercase tracking-widest">
              JONGTOUR
            </span>
          </div>

          {/* Ribbon Badge */}
          <div className="inline-flex bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-r-full shadow-md mb-6 -ml-6 md:-ml-10 items-center gap-1 w-max">
            <span>🔥</span> แผนการเดินทางส่วนตัว (F.I.T.)
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight drop-shadow-sm outline-none focus:bg-white/50 focus:ring-2 focus:ring-orange-200 rounded px-2 -mx-2" contentEditable suppressContentEditableWarning>
            {itinerary.marketingHeadline}
          </h1>
          <h2 className="text-lg md:text-xl text-orange-600 font-bold mb-5 drop-shadow-sm outline-none focus:bg-white/50 focus:ring-2 focus:ring-orange-200 rounded px-2 -mx-2" contentEditable suppressContentEditableWarning>
            {itinerary.title}
          </h2>

          {/* Highlights Glassmorphism Card */}
          {(itinerary.highlights?.length > 0) ? (
            <div className="bg-white/60 backdrop-blur-md border border-white/80 shadow-sm rounded-xl p-4 mb-5 inline-block w-max max-w-full">
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">✨ Tour Highlights</h3>
               <ul className="space-y-1.5">
                 {itinerary.highlights.map((hl: string, i: number) => (
                   <li key={i} className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                      <span className="text-green-500">✔️</span> {hl}
                   </li>
                 ))}
               </ul>
            </div>
          ) : (
            <div className="mb-4"></div> /* Spacer if no highlights */
          )}

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-3 mt-auto">
            {/* Duration Badge */}
            <div className="bg-gray-900 text-white text-xs font-bold px-1 py-1 rounded-lg flex items-center shadow-sm">
              <button className="px-2 py-1 hover:bg-white/20 rounded no-print" onClick={removeDay}>-</button>
              <div className="flex items-center gap-1.5 px-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {days.length} วัน {days.length > 1 ? days.length - 1 : 0} คืน
              </div>
              <button className="px-2 py-1 hover:bg-white/20 rounded no-print" onClick={addDay}>+</button>
            </div>

            {/* Pax Badge */}
            <div className="bg-white border border-gray-200 text-gray-800 text-xs font-bold px-1 py-1 rounded-lg flex items-center shadow-sm">
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setPax(Math.max(1, pax - 1))}>-</button>
              <div className="flex items-center gap-1.5 px-2">
                👥 {pax} ท่าน
              </div>
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setPax(pax + 1)}>+</button>
            </div>

            {/* Hotel Stars Badge */}
            <div className="bg-white border border-gray-200 text-gray-800 text-xs font-bold px-1 py-1 rounded-lg flex items-center shadow-sm">
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setHotelStars(Math.max(1, hotelStars - 1))}>-</button>
              <div className="flex items-center gap-0.5 px-2 min-w-[60px] justify-center">
                {[...Array(hotelStars)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-500 no-print" onClick={() => setHotelStars(Math.min(5, hotelStars + 1))}>+</button>
            </div>
          </div>
          
          {/* Regenerate AI Plan Button */}
          <div className="mt-4 flex w-full no-print">
            <button 
              onClick={handleRegenerateFullPlan} 
              disabled={isRegeneratingFullPlan}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              {isRegeneratingFullPlan ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {isRegeneratingFullPlan ? "กำลังเขียนแผนใหม่..." : "✨ ให้ AI อัปเดตสถานที่และโรงแรมให้ตรงกับเงื่อนไขนี้"}
            </button>
          </div>
        </div>

        {/* Right Side - Flight Info & Price */}
        <div className="relative z-40 p-6 md:p-10 md:w-2/5 flex flex-col justify-center items-center md:items-end gap-6">
          
          {/* Price Badge Moved to Right Side */}
          <div className="w-full max-w-sm bg-white/90 backdrop-blur-md shadow-md rounded-xl p-4 border border-orange-100 flex flex-col items-center md:items-end transform transition hover:scale-105">
            <div className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
              ราคาประเมินเริ่มต้น
              {isCalculatingPrice && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
            </div>
            <div key={estimatedPrice} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg md:text-xl font-bold rounded-lg px-4 py-1.5 shadow-sm outline-none focus:ring-2 focus:ring-orange-300 transition-colors text-center md:text-right" contentEditable suppressContentEditableWarning>
              {estimatedPrice}
            </div>
          </div>
          {recommendedFlight ? (
            <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 w-full max-w-sm border border-gray-100 transform transition hover:scale-105 relative group">
              {/* Edit Button */}
              <button 
                onClick={() => { setEditingFlight(true); setFlightEditPrompt(""); }}
                className="absolute top-2 right-2 p-1.5 bg-gray-100 text-gray-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600 no-print"
                title="เปลี่ยนเที่ยวบิน (AI)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>

              {editingFlight ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-blue-600 mb-2">🤖 แจ้ง AI เปลี่ยนสายการบิน/เที่ยวบิน</div>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="เช่น ขอเปลี่ยนเป็น การบินไทย, ขอไฟล์ทดึก"
                    value={flightEditPrompt}
                    onChange={(e) => setFlightEditPrompt(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                    onKeyDown={(e) => { if(e.key === 'Enter') handleRegenerateFlight(); }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingFlight(false)} className="text-xs text-gray-500 hover:underline">ยกเลิก</button>
                    <button onClick={handleRegenerateFlight} disabled={isRegeneratingFlight || !flightEditPrompt.trim()} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
                      {isRegeneratingFlight && <Loader2 className="w-3 h-3 animate-spin" />}
                      เปลี่ยน
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-blue-50 rounded-lg text-blue-500">✈️</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">เที่ยวบินแนะนำ</h3>
                        <p className="text-xs text-gray-500">{recommendedFlight.airline}</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-center min-w-[40px] min-h-[32px] cursor-pointer">
                      {localAirline ? (
                        <img 
                          src={`https://images.kiwi.com/airlines/64/${localAirline.substring(0, 2).toUpperCase()}.png`} 
                          alt={localAirline}
                          className="h-8 object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">สายการบิน</span>
                      )}
                      <select 
                        value={localAirline}
                        onChange={e => setLocalAirline(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="คลิกเพื่อเปลี่ยนสายการบิน"
                      >
                         <option value="">-- เลือกสายการบิน --</option>
                         <option value="TG">Thai Airways (TG)</option>
                         <option value="XJ">Thai AirAsia X (XJ)</option>
                         <option value="VZ">Thai Vietjet (VZ)</option>
                         <option value="EK">Emirates (EK)</option>
                         <option value="QR">Qatar Airways (QR)</option>
                         <option value="SQ">Singapore Airlines (SQ)</option>
                         <option value="CX">Cathay Pacific (CX)</option>
                         <option value="BR">EVA Air (BR)</option>
                         <option value="CI">China Airlines (CI)</option>
                         <option value="JX">STARLUX Airlines (JX)</option>
                         <option value="PG">Bangkok Airways (PG)</option>
                         <option value="FD">Thai AirAsia (FD)</option>
                         <option value="SL">Thai Lion Air (SL)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                        🛫 เที่ยวบินขาไป
                      </div>
                      <div key={recommendedFlight.outbound} className="text-sm text-gray-800 font-medium whitespace-pre-line" contentEditable suppressContentEditableWarning>
                        {recommendedFlight.outbound}
                      </div>
                    </div>
                    
                    <div className="bg-green-50/50 rounded-lg p-3 border border-green-100/50">
                      <div className="flex items-center gap-2 text-xs font-bold text-green-600 mb-1">
                        🛬 เที่ยวบินขากลับ
                      </div>
                      <div key={recommendedFlight.inbound} className="text-sm text-gray-800 font-medium whitespace-pre-line" contentEditable suppressContentEditableWarning>
                        {recommendedFlight.inbound}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 w-full max-w-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[200px]">
              <span className="p-3 bg-gray-50 rounded-full text-gray-400 mb-3">✈️</span>
              <p className="text-sm text-gray-500 font-medium">กำลังประมวลผลเที่ยวบิน...</p>
              <p className="text-xs text-gray-400 mt-1">กรุณาสร้างแผนการเดินทางใหม่<br/>เพื่อดูเที่ยวบินแนะนำ</p>
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Table */}
      <div className="p-0 print-itinerary-body overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="py-3 px-4 w-16 text-center font-bold text-sm">วันที่</th>
              <th className="py-3 px-4 font-bold text-sm">รายการทัวร์</th>
              <th className="py-3 px-2 w-32 text-center border-l border-white/20">
                <div className="text-sm font-bold mb-1">อาหาร</div>
                <div className="flex justify-between text-[10px] px-2 font-normal">
                  <span>เช้า</span>
                  <span>กลางวัน</span>
                  <span>ค่ำ</span>
                </div>
              </th>
              <th className="py-3 px-4 w-48 text-center font-bold text-sm border-l border-white/20">โรงแรม</th>
              <th className="w-12 border-l border-white/20 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {days.map((d: any, index: number) => (
              <tr key={d.day} className="border-b border-gray-200 hover:bg-gray-50 group">
                {/* Day Number */}
                <td className="py-4 px-4 text-center font-bold text-lg text-orange-500 align-top">
                  {d.day}
                </td>
                
                {/* Tour Program */}
                <td className="py-4 px-4 align-top max-w-[350px]">
                  {editingDayIndex === index ? (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg animate-in fade-in zoom-in-95">
                      <div className="text-xs font-bold text-blue-600 mb-2">🤖 แจ้ง AI เปลี่ยนสถานที่ของวันนี้</div>
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="เช่น ขอเปลี่ยนไปเที่ยวดิสนีย์แลนด์, ขอไม่เข้าวัด"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                        onKeyDown={(e) => { if(e.key === 'Enter') handleRegenerateDay(index); }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingDayIndex(null)} className="text-xs text-gray-500 hover:underline">ยกเลิก</button>
                        <button onClick={() => handleRegenerateDay(index)} disabled={isRegenerating || !editPrompt.trim()} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
                          {isRegenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                          เปลี่ยนแผน
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-gray-800 text-sm mb-1 outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1 -mx-1" contentEditable suppressContentEditableWarning>
                        {d.title}
                      </h3>
                      <p className="text-gray-600 text-[13px] leading-relaxed outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1 -mx-1 whitespace-pre-line mb-3" contentEditable suppressContentEditableWarning>
                        {d.detail}
                      </p>
                    </>
                  )}
                </td>

                {/* Meals */}
                <td className="py-4 px-2 align-middle border-l border-gray-100">
                  <div className="flex justify-between items-center px-4">
                    {/* Breakfast */}
                    <div>
                      {d.meals?.breakfast ? (
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    {/* Lunch */}
                    <div>
                      {d.meals?.lunch ? (
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    {/* Dinner */}
                    <div>
                      {d.meals?.dinner ? (
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </td>

                {/* Hotel */}
                <td className="py-4 px-4 text-center align-middle border-l border-gray-100">
                  {d.hotel && d.hotel !== "-" && (
                    <div className="flex justify-center gap-0.5 mb-1.5">
                      {[...Array(hotelStars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                  )}
                  <p className="text-[13px] font-bold text-orange-600 outline-none focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-1" contentEditable suppressContentEditableWarning>
                    {d.hotel || "-"}
                  </p>
                  {d.hotel && d.hotel !== "-" && (
                    <span className="block text-[10px] text-gray-400 font-normal mt-1 leading-tight">
                      หรือเทียบเท่าระดับเดียวกัน
                    </span>
                  )}
                </td>

                {/* Action Controls */}
                <td className="py-4 px-2 align-middle border-l border-gray-100 no-print">
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveDay(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded disabled:opacity-30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button onClick={() => moveDay(index, 'down')} disabled={index === days.length - 1} className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded disabled:opacity-30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <button onClick={() => {setEditingDayIndex(index); setEditPrompt("");}} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded mt-1" title="เปลี่ยนสถานที่ (ใช้ AI)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inclusions & Exclusions */}
      {(itinerary.inclusions || itinerary.exclusions) && (
        <div className="bg-gray-50 px-6 md:px-8 py-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-[13px]">
          {/* Inclusions */}
          {itinerary.inclusions && itinerary.inclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> สิ่งที่รวมในราคาทัวร์
              </h4>
              <ul className="space-y-2">
                {itinerary.inclusions.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {itinerary.exclusions && itinerary.exclusions.length > 0 && (
            <div>
              <h4 className="font-bold text-red-500 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> รายการที่ราคาทัวร์มักไม่รวม
              </h4>
              <ul className="space-y-2">
                {itinerary.exclusions.map((item: string, idx: number) => {
                  const parts = item.split(':');
                  return (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>
                        {parts.length > 1 ? (
                          <>
                            <strong className="text-gray-800">{parts[0]}:</strong> {parts.slice(1).join(':')}
                          </>
                        ) : (
                          item
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Map Route */}
      {days.some((d: any) => d.coordinates) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2">🗺️ แผนที่เส้นทางการเดินทาง</h4>
          <MapRoute days={days} />
        </div>
      )}



      {/* Footer / Export */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 no-print flex justify-between items-center px-6">
        <p className="text-gray-500 text-xs">Generated by Jongtour AI</p>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            พิมพ์
          </button>
          <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGeneratingPDF ? "สร้าง PDF..." : "ดาวน์โหลด PDF"}
          </button>
          <button onClick={() => setShowLeadForm(true)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            สนใจจองทริปนี้
          </button>
        </div>
      </div>

      {/* Lead Generation Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowLeadForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            
            {leadSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">ส่งข้อมูลสำเร็จ!</h3>
                <p className="text-gray-500">เจ้าหน้าที่จะติดต่อกลับเพื่อเสนอราคาอย่างเป็นทางการโดยเร็วที่สุดครับ</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">📝 สนใจจองทริปส่วนตัวนี้</h3>
                <p className="text-sm text-gray-500 mb-6">กรอกข้อมูลเพื่อให้เจ้าหน้าที่ประเมินราคาและยืนยันการเดินทาง</p>
                
                <form onSubmit={submitLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                    <input type="text" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
                    <input type="tel" required value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สายการบินที่ต้องการ (อัปเดตโลโก้บนแผน)</label>
                    <select 
                      id="airline-select"
                      value={localAirline}
                      onChange={e => setLocalAirline(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                       <option value="">-- ไม่ระบุสายการบิน --</option>
                       <option value="TG">Thai Airways (TG)</option>
                       <option value="XJ">Thai AirAsia X (XJ)</option>
                       <option value="VZ">Thai Vietjet (VZ)</option>
                       <option value="EK">Emirates (EK)</option>
                       <option value="QR">Qatar Airways (QR)</option>
                       <option value="SQ">Singapore Airlines (SQ)</option>
                       <option value="CX">Cathay Pacific (CX)</option>
                       <option value="BR">EVA Air (BR)</option>
                       <option value="CI">China Airlines (CI)</option>
                       <option value="JX">STARLUX Airlines (JX)</option>
                       <option value="PG">Bangkok Airways (PG)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เดินทาง (ท่าน) *</label>
                    <input type="number" min="1" required value={pax} onChange={e => setPax(parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">โฮลเซลล์ที่ต้องการให้เสนอราคา</label>
                    <select 
                      value={preferredWholesale}
                      onChange={e => setPreferredWholesale(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                       <option value="ไม่ระบุ (หาที่ราคาดีที่สุดให้)">ไม่ระบุ (หาที่ราคาดีที่สุดให้)</option>
                       <option value="Let's Go Group">Let's Go Group</option>
                       <option value="GO 365 Travel">GO 365 Travel</option>
                       <option value="Check In Group">Check In Group</option>
                       <option value="Tour Factory">Tour Factory</option>
                    </select>
                  </div>
                  
                  <button type="submit" disabled={isSubmittingLead} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:bg-gray-400">
                    {isSubmittingLead ? "กำลังส่งข้อมูล..." : "ให้เจ้าหน้าที่ติดต่อกลับ"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <FitProposalPDF ref={pdfRef} itinerary={{...itinerary, days, airlineCode: localAirline, recommendedFlight, estimatedPrice}} />
    </div>
  );
}
