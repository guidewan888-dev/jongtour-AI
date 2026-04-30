"use client";

import Link from "next/link";
import { Download, Printer, CheckCircle2, FileText, Map } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DocumentPreviewClient({ 
  docType, 
  bookingData,
  docId
}: { 
  docType: string, 
  bookingData: any,
  docId: string
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const getDocDetails = () => {
    if (docType.includes('invoice')) return { title: docType === 'invoice2' ? 'ใบแจ้งหนี้ ครั้งที่ 2' : 'ใบแจ้งหนี้', subtitle: 'INVOICE', color: 'text-indigo-600', bg: 'bg-indigo-600', icon: <FileText className="w-10 h-10 text-indigo-100" /> };
    if (docType === 'receipt') return { title: 'ใบเสร็จรับเงิน', subtitle: 'RECEIPT', color: 'text-emerald-600', bg: 'bg-emerald-600', icon: <CheckCircle2 className="w-10 h-10 text-emerald-100" /> };
    if (docType === 'program') return { title: 'โปรแกรมทัวร์', subtitle: 'ITINERARY', color: 'text-blue-600', bg: 'bg-blue-600', icon: <Map className="w-10 h-10 text-blue-100" /> };
    if (docType === 'appointment') return { title: 'ใบนัดหมาย', subtitle: 'APPOINTMENT', color: 'text-orange-600', bg: 'bg-orange-600', icon: <FileText className="w-10 h-10 text-orange-100" /> };
    return { title: 'เอกสาร', subtitle: 'DOCUMENT', color: 'text-gray-600', bg: 'bg-gray-600', icon: <FileText className="w-10 h-10 text-gray-100" /> };
  };

  const doc = getDocDetails();

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [794, 1123] });
      pdf.addImage(imgData, "JPEG", 0, 0, 794, 1123);
      pdf.save(`${docId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch for dates
  useEffect(() => {
    setMounted(true);
  }, []);

  const dateStr = mounted 
    ? (bookingData ? new Date(bookingData.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '12 ตุลาคม 2569')
    : '12 ตุลาคม 2569';

  const travelersCount = bookingData?.travelers?.length || 1;
  const tourTitle = bookingData?.departure?.tour?.title || "แพ็กเกจทัวร์ต่างประเทศ (Premium)";
  const customerName = bookingData?.user?.name || bookingData?.user?.email || "คุณลูกค้าคนสำคัญ";
  const customerPhone = bookingData?.user?.phone || "-";
  const customerEmail = bookingData?.user?.email || "customer@example.com";
  const bookingCode = bookingData?.id?.slice(-8).toUpperCase() || 'BK-12345678';
  const totalPrice = bookingData?.totalPrice?.toLocaleString() || '45,900.00';

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-4">
        <div className="flex items-center gap-4">
          <Link href={`/user/bookings/${bookingData?.id || ''}`} className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-800 hover:shadow-md transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{doc.title}</h1>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Ref: {docId}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> พิมพ์
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 md:flex-none text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 ${isDownloading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
          >
            {isDownloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download className="w-4 h-4" />}
            {isDownloading ? 'กำลังประมวลผล...' : 'ดาวน์โหลด PDF'}
          </button>
        </div>
      </div>

      <div className="bg-gray-100/50 rounded-3xl p-4 md:p-10 border border-gray-200 flex justify-center overflow-x-auto backdrop-blur-sm">
        {/* EXACT A4 PIXEL DIMENSIONS (794x1123) */}
        <div 
          ref={pdfRef} 
          style={{ width: '794px', minHeight: '1123px' }}
          className="bg-white shadow-2xl relative flex flex-col shrink-0 overflow-hidden"
        >
          {/* Top Color Accent */}
          <div className={`h-4 w-full ${doc.bg}`}></div>

          <div className="p-10 flex flex-col flex-grow text-gray-800">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-200">
              <div className="flex flex-col">
                <h2 className={`text-3xl font-black tracking-tighter ${doc.color} mb-1`}>JONGTOUR</h2>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  บริษัท จงทัวร์ จำกัด (สำนักงานใหญ่)<br/>
                  123/45 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110<br/>
                  เลขประจำตัวผู้เสียภาษี: 0105555555555<br/>
                  โทร: 02-123-4567 | info@jongtour.com
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <h1 className={`text-2xl font-bold ${doc.color} uppercase tracking-wider mb-2`}>{doc.subtitle}</h1>
                <h2 className="text-lg font-bold text-gray-700 mb-4">{doc.title}</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-left">
                  <span className="text-gray-500 font-semibold">เลขที่เอกสาร (No):</span>
                  <span className="font-bold">{docId}</span>
                  <span className="text-gray-500 font-semibold">วันที่ (Date):</span>
                  <span className="font-bold">{dateStr}</span>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">ลูกค้า (Billed To)</h3>
                <p className="font-bold text-gray-900 text-sm mb-1">{customerName}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  โทรศัพท์: {customerPhone}<br/>
                  อีเมล: {customerEmail}
                </p>
              </div>
              
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">รายละเอียดการจอง (Booking Details)</h3>
                <p className="font-bold text-gray-900 text-sm mb-1">{tourTitle}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  รหัสอ้างอิง: <span className="font-semibold text-gray-800">{bookingCode}</span><br/>
                  จำนวนผู้เดินทาง: <span className="font-semibold text-gray-800">{travelersCount} ท่าน</span>
                </p>
              </div>
            </div>

            {/* Content Table for Invoice/Receipt */}
            {(docType.includes('invoice') || docType === 'receipt') && (
              <div className="mb-10 flex-grow">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-y-2 border-gray-800 bg-gray-50/50">
                      <th className="py-3 px-3 text-left font-bold text-gray-800 w-12">ลำดับ</th>
                      <th className="py-3 px-3 text-left font-bold text-gray-800">รายการ (Description)</th>
                      <th className="py-3 px-3 text-center font-bold text-gray-800 w-24">จำนวน (Qty)</th>
                      <th className="py-3 px-3 text-right font-bold text-gray-800 w-32">จำนวนเงิน (Amount)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-3 text-gray-600 text-center">1</td>
                      <td className="py-4 px-3 text-gray-800 font-medium">แพ็กเกจ {tourTitle}</td>
                      <td className="py-4 px-3 text-gray-600 text-center">{travelersCount}</td>
                      <td className="py-4 px-3 text-gray-900 text-right font-bold">{totalPrice}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="flex justify-end mt-6">
                  <div className="w-64">
                    <div className="flex justify-between mb-2 text-xs text-gray-600">
                      <span>ยอดรวม (Subtotal)</span>
                      <span>{totalPrice} THB</span>
                    </div>
                    <div className="flex justify-between mb-3 text-xs text-gray-600">
                      <span>ภาษีมูลค่าเพิ่ม (VAT 0%)</span>
                      <span>0.00 THB</span>
                    </div>
                    <div className="flex justify-between items-end border-t-2 border-gray-800 pt-2 pb-1">
                      <span className="text-gray-900 font-bold text-sm">ยอดสุทธิ (Total)</span>
                      <span className={`text-lg font-black ${doc.color}`}>{totalPrice} THB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Specific Content */}
            {docType === 'program' && (
              <div className="flex-grow space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Map className="w-4 h-4 text-gray-600" />
                    สรุปแผนการเดินทาง (Itinerary Overview)
                  </h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gray-200">
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow shrink-0 z-10 font-bold text-[10px]">1</div>
                      <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm w-full">
                        <p className="font-bold text-gray-900 text-xs mb-1">พบกันที่สนามบินสุวรรณภูมิ</p>
                        <p className="text-[11px] text-gray-500">เช็คอินและเตรียมตัวออกเดินทาง</p>
                      </div>
                    </div>
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white shadow shrink-0 z-10 font-bold text-[10px]">2</div>
                      <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm w-full">
                        <p className="font-bold text-gray-900 text-xs mb-1">เดินทางถึงที่หมาย</p>
                        <p className="text-[11px] text-gray-500">ท่องเที่ยวตามโปรแกรมแบบจัดเต็ม</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-[10px] text-gray-400 italic">
                    (รายละเอียดแบบเจาะลึกจะถูกส่งให้ผ่านทางอีเมลอีกครั้ง)
                  </div>
                </div>
              </div>
            )}

            {docType === 'appointment' && (
              <div className="flex-grow space-y-6">
                 <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-bold text-lg text-gray-900 mb-1">ใบนัดหมายเตรียมตัวเดินทาง</h3>
                    <p className="text-gray-600 mb-6 text-sm font-medium">{tourTitle}</p>

                    <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto mb-6">
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">วันนัดพบ</p>
                        <p className="font-bold text-gray-900 text-xs">โปรดรอการยืนยัน</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">สถานที่</p>
                        <p className="font-bold text-gray-900 text-xs">สนามบินสุวรรณภูมิ</p>
                      </div>
                    </div>

                    <div className="bg-red-50 text-red-700 p-3 rounded border border-red-100 text-xs font-medium text-left flex gap-2">
                      <span className="text-sm">⚠️</span>
                      <p>สิ่งสำคัญ: กรุณานำหนังสือเดินทาง (Passport) ตัวจริงที่มีอายุเหลืออย่างน้อย 6 เดือน มาด้วยในวันเดินทาง</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Bottom Footer Section */}
            <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between items-end relative">
              
              {/* Note / Terms */}
              <div className="flex-1 pr-8">
                <p className="text-[10px] font-bold text-gray-600 mb-1">หมายเหตุ (Remarks):</p>
                <p className="text-[9px] text-gray-500 leading-relaxed">
                  1. การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินโอนเข้าบัญชีเรียบร้อยแล้ว<br/>
                  2. กรุณาตรวจสอบความถูกต้องของชื่อ-นามสกุล ก่อนการเดินทาง<br/>
                  3. เอกสารนี้จัดทำด้วยระบบอิเล็กทรอนิกส์
                </p>
              </div>
              
              {/* Signature area */}
              <div className="text-center w-40 z-10">
                <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center relative">
                  {(docType === 'receipt' || docType.includes('invoice')) && (
                    <span className="font-serif text-2xl text-blue-900/40 italic absolute bottom-1">Jongtour</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-800">ผู้รับมอบอำนาจ</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Authorized Signature</p>
              </div>

              {/* Watermark / Stamp */}
              {docType === 'receipt' && (
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-32 h-32 border-[3px] border-emerald-500/30 rounded-full flex flex-col items-center justify-center rotate-[-15deg] pointer-events-none z-0">
                  <p className="text-emerald-500/30 font-black text-2xl tracking-widest uppercase m-0 leading-none">PAID</p>
                  <p className="text-emerald-500/30 font-bold text-[10px] uppercase tracking-widest mt-1">Jongtour</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
