"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Link as LinkIcon, Search, CheckCircle2, AlertCircle, FileText, Camera, Building, CreditCard, Filter, ChevronRight, Copy, Check } from "lucide-react";

export default function WholesaleAdminPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock Admin Data
  const bookingData = {
    id: "99887766",
    tourName: "ทัวร์เยอรมัน สวิตเซอร์แลนด์ ฝรั่งเศส 9 วัน 6 คืน",
    travelDate: "15 พ.ย. 2026 - 23 พ.ย. 2026",
    customerName: "คุณสมชาย ใจดี (คนจอง)",
    wholesaleCode: "WS-EU-GER-001",
    totalTravelers: 6,
    completeDocs: 3,
    missingDocs: 3
  };

  const travelers = [
    { id: 1, name: 'คุณสมชาย ใจดี', type: 'Adult', docs: { passport: true, photo: true, employment: true, bank: true } },
    { id: 2, name: 'คุณสมหญิง รักดี', type: 'Adult', docs: { passport: true, photo: true, employment: false, bank: false } },
    { id: 3, name: 'ด.ช.สมบูรณ์ ใจดี', type: 'Child', docs: { passport: true, photo: true, employment: true, bank: true } },
    { id: 4, name: 'คุณปู่สมศักดิ์ ใจดี', type: 'Senior', docs: { passport: true, photo: true, employment: true, bank: true } },
    { id: 5, name: 'คุณย่าสมศรี ใจดี', type: 'Senior', docs: { passport: true, photo: true, employment: true, bank: true } },
    { id: 6, name: 'คุณน้าสมหวัง รักดี', type: 'Adult', docs: { passport: false, photo: false, employment: false, bank: false } },
  ];

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadAll = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("ดาวน์โหลดไฟล์ Jongtour_Booking_99887766_AllDocs.zip เรียบร้อยแล้ว (จำลอง)");
    }, 2000);
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? 
      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-4 h-4" /></div> : 
      <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto"><AlertCircle className="w-4 h-4" /></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
                <span className="font-bold text-xl tracking-tighter">JONGTOUR <span className="text-[#5392f9]">ADMIN</span></span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="font-bold text-gray-800 text-lg">ระบบรวบรวมเอกสารยื่นวีซ่า / ส่งโฮลเซลล์</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#5392f9] flex items-center justify-center font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/admin" className="hover:text-blue-600">แดชบอร์ด</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="#" className="hover:text-blue-600">รายการจองทั้งหมด</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">เอกสาร Booking #{bookingData.id}</span>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{bookingData.wholesaleCode}</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอเอกสารครบ</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{bookingData.tourName}</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600">
                <p><span className="text-gray-400">หัวหน้าผู้จอง:</span> <span className="font-medium text-gray-800">{bookingData.customerName}</span></p>
                <p><span className="text-gray-400">วันเดินทาง:</span> <span className="font-medium text-gray-800">{bookingData.travelDate}</span></p>
                <p><span className="text-gray-400">จำนวน:</span> <span className="font-medium text-gray-800">{bookingData.totalTravelers} ท่าน</span></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button 
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
              >
                {copiedLink ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
                {copiedLink ? 'คัดลอกลิงก์แล้ว' : 'สร้าง Secure Link'}
              </button>
              
              <button 
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
                  ${isDownloading ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'}
                `}
              >
                {isDownloading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> บีบอัดไฟล์ .ZIP...</>
                ) : (
                  <><Download className="w-5 h-5" /> ดาวน์โหลดทั้งหมด (.ZIP)</>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 md:px-8 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-indigo-500" />
            <p className="text-sm text-gray-600">
              เมื่อกด <span className="font-bold text-gray-800">ดาวน์โหลดทั้งหมด</span> ระบบจะจัดโฟลเดอร์แยกตามชื่อผู้เดินทางให้อัตโนมัติ พร้อมตั้งชื่อไฟล์ให้เป็นระบบ (เช่น <code className="bg-gray-200 px-1 rounded">1_Somchai_Passport.pdf</code>)
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">สถานะเอกสารรายบุคคล</h3>
              <p className="text-sm text-gray-500">เอกสารครบ {bookingData.completeDocs}/{bookingData.totalTravelers} ท่าน</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="ค้นหาชื่อ..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="p-4 font-bold">รายชื่อผู้เดินทาง</th>
                  <th className="p-4 text-center font-bold">พาสปอร์ต</th>
                  <th className="p-4 text-center font-bold">รูปถ่าย</th>
                  <th className="p-4 text-center font-bold">รับรองการทำงาน</th>
                  <th className="p-4 text-center font-bold">สเตทเม้นท์</th>
                  <th className="p-4 text-center font-bold">สถานะ</th>
                  <th className="p-4 text-right font-bold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {travelers.map((traveler) => {
                  const isComplete = traveler.docs.passport && traveler.docs.photo && traveler.docs.employment && traveler.docs.bank;
                  
                  return (
                    <tr key={traveler.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${isComplete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
                          `}>
                            {traveler.id}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{traveler.name}</p>
                            <p className="text-[10px] text-gray-500">{traveler.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><StatusIcon status={traveler.docs.passport} /></td>
                      <td className="p-4"><StatusIcon status={traveler.docs.photo} /></td>
                      <td className="p-4"><StatusIcon status={traveler.docs.employment} /></td>
                      <td className="p-4"><StatusIcon status={traveler.docs.bank} /></td>
                      <td className="p-4 text-center">
                        {isComplete ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">พร้อมยื่นวีซ่า</span>
                        ) : (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold">รอเอกสารเพิ่มเติม</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border
                              ${isComplete ? 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                            disabled={!isComplete}
                            title={isComplete ? "ดาวน์โหลดไฟล์ของคนนี้" : "ยังอัปโหลดไม่ครบ"}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">โหลดแยก</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
