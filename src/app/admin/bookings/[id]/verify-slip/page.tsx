"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle, Search, Sparkles, ScanLine, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function VerifySlipPage({ params }: { params: { id: string } }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // AI State
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<null | 'success'>(null);

  const handleApprove = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleAiScan = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiResult('success');
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ตรวจสอบสลิปโอนเงิน (Verify Payment)
          </h2>
          <p className="text-gray-500 mt-1">รหัสการจอง: {params.id}</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">อนุมัติการชำระเงินสำเร็จ</h2>
          <p className="text-gray-500 mb-8">สถานะการจองถูกเปลี่ยนเป็น "ชำระเงินแล้ว" และระบบได้ส่งใบเสร็จให้ลูกค้าเรียบร้อย</p>
          <Link href="/admin" className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/30">
            กลับไปหน้า Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Slip Image Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">สลิปที่ลูกค้าแนบมา</h3>
              {!aiResult && !isAiScanning && (
                <button 
                  onClick={handleAiScan}
                  className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  <Sparkles className="w-3.5 h-3.5" /> ใช้ AI ตรวจสอบ
                </button>
              )}
            </div>
            
            <div className="relative w-full max-w-sm aspect-[1/2] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center group">
              {/* Slip Content Mockup */}
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4 relative z-10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-600 relative z-10">โอนเงินสำเร็จ</p>
              <p className="text-2xl font-black text-gray-800 mt-2 relative z-10">45,900.00</p>
              <div className="mt-8 text-xs text-gray-400 space-y-1 text-center relative z-10">
                <p>ธ.กสิกรไทย (KBANK)</p>
                <p>12 ต.ค. 26 - 14:35 น.</p>
              </div>

              {/* View Overlay (Only when not scanning) */}
              {!isAiScanning && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                  <Search className="w-8 h-8 text-white" />
                </div>
              )}

              {/* AI Scanning Animation Overlay */}
              {isAiScanning && (
                <div className="absolute inset-0 bg-indigo-900/20 z-30 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                  <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] absolute animate-[scan_2s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <ScanLine className="w-12 h-12 text-indigo-600 animate-pulse drop-shadow-md" />
                    <span className="bg-white/90 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                      Jongtour AI กำลังวิเคราะห์...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">รายละเอียดการจอง</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">ลูกค้า</span>
                  <span className="font-bold text-gray-800">คุณสมชาย ใจดี</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">แพ็กเกจ</span>
                  <span className="font-bold text-gray-800">ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (6D4N)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">ยอดที่ต้องชำระ</span>
                  <span className="font-black text-blue-600 text-lg">45,900 ฿</span>
                </div>
              </div>
            </div>

            {/* AI Result Panel */}
            {aiResult && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="w-16 h-16" />
                </div>
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> ผลการวิเคราะห์จาก AI
                </h3>
                <div className="space-y-3 text-sm text-indigo-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p><strong>ยอดเงินตรงกัน:</strong> 45,900.00 ฿ (ครบถ้วน)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p><strong>ชื่อผู้โอน:</strong> สมชาย ใจดี (ตรงกับฐานข้อมูลลูกค้า)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p><strong>ตรวจสอบ e-Slip:</strong> สแกน QR Code ตรงกับข้อมูลธนาคาร (แท้ 100%)</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">AI Recommendation: อนุมัติได้ทันที</p>
                </div>
              </div>
            )}

            <div className={`border rounded-2xl p-6 transition-colors ${aiResult ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'}`}>
              <h3 className={`font-bold mb-4 ${aiResult ? 'text-gray-900' : 'text-blue-900'}`}>การตัดสินใจ (Action)</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleApprove}
                  disabled={isVerifying || isAiScanning}
                  className={`text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                    isVerifying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                  }`}
                >
                  {isVerifying ? "กำลังบันทึก..." : <><CheckCircle2 className="w-5 h-5" /> อนุมัติสลิปนี้</>}
                </button>
                <button 
                  disabled={isAiScanning}
                  className="bg-white text-red-600 border border-red-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" /> ปฏิเสธ (สลิปไม่ถูกต้อง)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add custom CSS for the scan animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
