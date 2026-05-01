"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Check, X, Star, Download, Loader2 } from "lucide-react";
import { FitProposalPDF } from "./FitProposalPDF";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";

const MapRoute = dynamic(() => import("./MapRoute"), { ssr: false });

export default function InteractiveItinerary({ itinerary }: { itinerary: any }) {
  const [days, setDays] = useState(itinerary?.days || []);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

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
          durationDays: days.length,
          country,
          itinerary: { ...itinerary, days }
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
      
      {/* Promotional Banner Header */}
      <div className="relative w-full h-[250px] sm:h-[300px] overflow-hidden group">
        {/* Background Image */}
        <img 
          src={itinerary.coverImagePrompt 
            ? `https://image.pollinations.ai/prompt/${encodeURIComponent(itinerary.coverImagePrompt + ", travel photography, beautiful scenery, 4k, hyperrealistic")}?width=1200&height=400&nologo=true`
            : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80"}
          alt="Destination Cover"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          crossOrigin="anonymous"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              {/* Marketing Headline */}
              {itinerary.marketingHeadline && (
                <div className="inline-block bg-orange-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-3 shadow-lg">
                  🔥 {itinerary.marketingHeadline}
                </div>
              )}
              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md outline-none focus:bg-white/10 rounded px-1 -mx-1" contentEditable suppressContentEditableWarning>
                {itinerary.title}
              </h2>
              {/* Airline Badge */}
              {itinerary.airlineCode && (
                <div className="flex items-center gap-2 mt-2 bg-white/10 backdrop-blur-md w-max px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                  <span className="text-white text-xs">เดินทางกับ</span>
                  <img 
                    src={`https://images.kiwi.com/airlines/64/${itinerary.airlineCode}.png`} 
                    alt={itinerary.airlineCode}
                    className="h-5 bg-white rounded-sm px-1"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>
            {/* Price Badge */}
            <div className="shrink-0 text-right">
              <div className="text-white/90 text-xs mb-1 drop-shadow-sm">ราคาประเมินเริ่มต้น</div>
              <div className="bg-white text-orange-600 font-bold rounded-xl px-4 py-2 shadow-xl border-b-4 border-orange-200 outline-none focus:ring-2 focus:ring-orange-500" contentEditable suppressContentEditableWarning>
                {itinerary.estimatedPrice}
              </div>
            </div>
          </div>
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
                      {[...Array(itinerary.hotelStars || 3)].map((_, i) => (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เดินทาง (ท่าน) *</label>
                    <input type="number" min="1" required value={leadForm.pax} onChange={e => setLeadForm({...leadForm, pax: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" />
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

      <FitProposalPDF ref={pdfRef} itinerary={{...itinerary, days}} />
    </div>
  );
}
