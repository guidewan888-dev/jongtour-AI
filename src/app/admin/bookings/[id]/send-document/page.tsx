"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, FileText, Send, CheckCircle2, AlertCircle, PlaneTakeoff, Receipt, Mail, MessageSquare } from "lucide-react";

export default function SendDocumentPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const docType = searchParams.get('type') || 'invoice1'; // invoice1, invoice2, receipt, appointment
  
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock data mapping
  const docInfo = {
    invoice1: { title: "ใบอินวอยซ์ ครั้งที่ 1 (มัดจำ)", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
    invoice2: { title: "ใบอินวอยซ์ ครั้งที่ 2 (ส่วนที่เหลือ)", icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    receipt: { title: "ใบเสร็จรับเงิน (Receipt)", icon: Receipt, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    appointment: { title: "ใบนัดหมายเดินทาง (Travel Appointment)", icon: PlaneTakeoff, color: "text-amber-600 bg-amber-50 border-amber-200" }
  };

  const currentDoc = docInfo[docType as keyof typeof docInfo] || docInfo.invoice1;
  const Icon = currentDoc.icon;

  const handleSend = () => {
    setIsSending(true);
    // Simulate API request
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/bookings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            พรีวิวและส่งเอกสารให้ลูกค้า
          </h2>
          <p className="text-gray-500 mt-1">รหัสการจอง: {params.id}</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-xl overflow-hidden p-12 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">ส่งเอกสารสำเร็จ!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            ระบบได้จัดส่ง <span className="font-bold text-gray-800">{currentDoc.title}</span> ให้กับลูกค้าเรียบร้อยแล้ว ผ่านช่องทางที่เลือกไว้
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/admin/bookings" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-colors">
              กลับไปหน้าจัดการจอง
            </Link>
            <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/30">
              ดูประวัติการแชทกับลูกค้า
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl border-2 border-dashed ${currentDoc.color}`}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <Icon className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-center font-bold text-lg mb-2">{currentDoc.title}</h3>
              <p className="text-center text-sm opacity-80 mb-6">รหัสอ้างอิง: DOC-{params.id.replace('BK-', '')}-{Date.now().toString().slice(-4)}</p>
              
              {/* Fake PDF Preview Area */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 h-[400px] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className="text-6xl font-black">JONGTOUR</span>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-3 mb-10">
                  <div className="w-1/3 h-4 bg-gray-100 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-100 rounded"></div>
                </div>
                <div className="w-full h-px bg-gray-100 mb-6"></div>
                <div className="space-y-4">
                  <div className="w-full h-8 bg-gray-50 rounded"></div>
                  <div className="w-full h-8 bg-gray-50 rounded"></div>
                  <div className="w-full h-8 bg-gray-50 rounded"></div>
                </div>
                <div className="absolute bottom-8 right-8 w-1/4 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">ช่องทางการจัดส่ง</h3>
              
              <div className="space-y-3 mb-8">
                <label className="flex items-center gap-3 p-3 border border-indigo-200 bg-indigo-50 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-bold text-indigo-900 text-sm">ส่งทางอีเมล (Email)</p>
                      <p className="text-xs text-indigo-600">somchai@email.com</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-bold text-green-900 text-sm">ส่งเข้าแชทลูกค้า (Inbox)</p>
                      <p className="text-xs text-green-600">แจ้งเตือนผ่านเว็บและแอป</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6">
                <p className="text-xs text-amber-800 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ระบบจะทำการแนบไฟล์ PDF และสร้างลิงก์สำหรับดาวน์โหลดให้อัตโนมัติ
                </p>
              </div>

              <button 
                onClick={handleSend}
                disabled={isSending}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70"
              >
                {isSending ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> กำลังส่งเอกสาร...</>
                ) : (
                  <><Send className="w-5 h-5" /> ยืนยันการส่งให้ลูกค้า</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
