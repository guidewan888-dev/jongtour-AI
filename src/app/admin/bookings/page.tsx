"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Clock, Calendar, FileText, Receipt, PlaneTakeoff, Copy, Send, ExternalLink, Globe } from "lucide-react";

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const bookings = [
    { id: "BK-240408", date: "10 ต.ค. 26", customer: "คุณแพรวา สุขใจ", tour: "ทัวร์ยุโรปตะวันออก (8D5N)", travelDate: "15 พ.ย. 26", amount: 159000, status: "AWAITING_APPOINTMENT", wholesaleType: "API", wholesaleStatus: "BOOKED" },
    { id: "BK-240407", date: "09 ต.ค. 26", customer: "คุณธนาธร สว่างจิต", tour: "ทัวร์จอร์เจีย (6D4N)", travelDate: "20 พ.ย. 26", amount: 89000, status: "MISSING_DOCS", wholesaleType: "MANUAL", wholesaleStatus: "PENDING" },
    { id: "BK-12345678", date: "08 ต.ค. 26", customer: "คุณสมชาย ใจดี", tour: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (6D4N)", travelDate: "05 ธ.ค. 26", amount: 45900, status: "AWAITING_CONFIRMATION", wholesaleType: "MANUAL", wholesaleStatus: "BOOKED" },
    { id: "BK-99887766", date: "05 ต.ค. 26", customer: "คุณสมชาย ใจดี", tour: "ทัวร์เยอรมัน สวิส ฝรั่งเศส (9D6N)", travelDate: "10 ธ.ค. 26", amount: 89900, status: "FULL_PAID", wholesaleType: "API", wholesaleStatus: "DOCS_SENT" },
    { id: "BK-240405", date: "01 ต.ค. 26", customer: "คุณวิภาวรรณ สมบูรณ์", tour: "ทัวร์เกาหลี โซล (5D3N)", travelDate: "15 ต.ค. 26", amount: 25900, status: "READY_TO_TRAVEL", wholesaleType: "MANUAL", wholesaleStatus: "PENDING" },
    { id: "BK-240403", date: "28 ก.ย. 26", customer: "นพดล ทองแท้", tour: "ทัวร์ไต้หวัน ไทเป (4D3N)", travelDate: "20 ธ.ค. 26", amount: 31800, status: "PENDING", wholesaleType: "API", wholesaleStatus: "PENDING" },
    { id: "BK-240001", date: "01 ส.ค. 26", customer: "ลูกค้าเก่า 01", tour: "ทัวร์สิงคโปร์ (3D2N)", travelDate: "15 ส.ค. 26", amount: 15000, status: "COMPLETED", wholesaleType: "API", wholesaleStatus: "BOOKED" },
    { id: "BK-239998", date: "15 ก.ค. 26", customer: "ลูกค้าเก่า 02", tour: "ทัวร์ฮ่องกง ดิสนีย์ (4D3N)", travelDate: "05 ส.ค. 26", amount: 28900, status: "CANCELLED", wholesaleType: "MANUAL", wholesaleStatus: "PENDING" },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">รอชำระเงิน</span>;
      case 'AWAITING_CONFIRMATION': return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">รอตรวจสลิป</span>;
      case 'MISSING_DOCS': return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">รอเอกสาร</span>;
      case 'FULL_PAID': return <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">รอจัดการวีซ่า</span>;
      case 'AWAITING_APPOINTMENT': return <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">รอออกใบนัดหมาย</span>;
      case 'READY_TO_TRAVEL': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200">พร้อมเดินทาง</span>;
      case 'COMPLETED': return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">เดินทางแล้ว</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 line-through">ยกเลิก</span>;
      default: return null;
    }
  };

  const filteredBookings = activeTab === "all" ? bookings : 
                           activeTab === "pending" ? bookings.filter(b => ["PENDING", "AWAITING_CONFIRMATION"].includes(b.status)) :
                           activeTab === "processing" ? bookings.filter(b => ["MISSING_DOCS", "FULL_PAID", "AWAITING_APPOINTMENT"].includes(b.status)) :
                           bookings.filter(b => ["READY_TO_TRAVEL", "COMPLETED"].includes(b.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">จัดการการจอง (Bookings)</h2>
          <p className="text-gray-500">ระบบจัดการออเดอร์และการจองทัวร์ทั้งหมดของลูกค้า</p>
        </div>
        <Link href="/admin/bookings/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg shadow-gray-900/20 inline-block">
          + สร้างการจองใหม่ (Manual)
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab("all")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>ทั้งหมด</button>
            <button onClick={() => setActiveTab("pending")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>รอชำระเงิน/ตรวจสลิป</button>
            <button onClick={() => setActiveTab("processing")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'processing' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>กำลังดำเนินการ</button>
            <button onClick={() => setActiveTab("done")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'done' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>สำเร็จแล้ว</button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="ค้นหารหัสจอง, ชื่อลูกค้า..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold border-b border-gray-100">รหัสจอง / วันที่จอง</th>
                <th className="p-4 font-bold border-b border-gray-100">ลูกค้า</th>
                <th className="p-4 font-bold border-b border-gray-100">ทัวร์ / วันเดินทาง</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">ยอดชำระ</th>
                <th className="p-4 font-bold border-b border-gray-100">สถานะ</th>
                <th className="p-4 font-bold border-b border-gray-100 text-center w-36">จัดการโฮลเซล</th>
                <th className="p-4 font-bold border-b border-gray-100 text-center w-40">ส่งเอกสารให้ลูกค้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-gray-900 font-bold">{b.id}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {b.date}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{b.customer}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-700">{b.tour}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {b.travelDate}</p>
                  </td>
                  <td className="p-4 font-bold text-gray-900 text-right">฿{b.amount.toLocaleString()}</td>
                  <td className="p-4">{getStatusBadge(b.status)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-center w-full">
                      {b.wholesaleType === 'MANUAL' ? (
                        b.wholesaleStatus === 'PENDING' ? (
                          <button onClick={() => alert("ระบบจะพาไปยังหน้าเว็บไซต์ของ Wholesale เพื่อทำการจองรายการนี้ด้วยตนเอง (Manual Booking)")} className="flex items-center justify-center gap-1 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-[10px] font-bold py-1.5 px-2 rounded border border-orange-200 transition-colors">
                            <ExternalLink className="w-3 h-3" /> ต้องจองมือ (Web)
                          </button>
                        ) : (
                          <span className="flex items-center justify-center gap-1 w-full bg-gray-100 text-gray-600 text-[10px] font-bold py-1.5 px-2 rounded border border-gray-200">
                            <Globe className="w-3 h-3" /> จองมือเรียบร้อย
                          </span>
                        )
                      ) : (
                        <span className="flex items-center justify-center gap-1 w-full bg-emerald-50 text-emerald-600 text-[10px] font-bold py-1.5 px-2 rounded border border-emerald-100">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> API Sync แล้ว
                        </span>
                      )}
                      
                      <button onClick={() => alert("ระบบจะรวบรวมไฟล์พาสปอร์ต, วีซ่า, และรายชื่อลูกค้า บีบอัดเป็น .ZIP และแนบส่ง Email ให้ Wholesale พร้อมข้อมูลการจองอัตโนมัติ")} className="flex items-center justify-center gap-1 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold py-1.5 px-2 rounded transition-colors border border-blue-100">
                        <Send className="w-3 h-3" /> เมลส่งเอกสาร
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <Link href={`/admin/bookings/${b.id}/send-document?type=invoice1`} title="ส่ง Invoice ครั้งที่ 1 (มัดจำ)" className="group relative">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border border-blue-100">
                          <FileText className="w-4 h-4" />
                        </div>
                      </Link>
                      <Link href={`/admin/bookings/${b.id}/send-document?type=invoice2`} title="ส่ง Invoice ครั้งที่ 2 (งวดสุดท้าย)" className="group relative">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100 relative">
                          <FileText className="w-4 h-4" />
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-indigo-600 text-white w-3 h-3 rounded-full flex items-center justify-center">2</span>
                        </div>
                      </Link>
                      <Link href={`/admin/bookings/${b.id}/send-document?type=receipt`} title="ส่งใบเสร็จรับเงิน (Receipt)" className="group relative">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-100">
                          <Receipt className="w-4 h-4" />
                        </div>
                      </Link>
                      <Link href={`/admin/bookings/${b.id}/send-document?type=appointment`} title="ส่งใบนัดหมายเดินทาง" className="group relative">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors border border-amber-100">
                          <PlaneTakeoff className="w-4 h-4" />
                        </div>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <p>แสดง {filteredBookings.length} รายการ</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50">ก่อนหน้า</button>
            <button className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}
