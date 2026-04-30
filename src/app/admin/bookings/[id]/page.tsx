"use client";

import Link from "next/link";
import { ChevronLeft, Calendar, Users, MapPin, CreditCard, Clock, FileText, CheckCircle2, Download, AlertCircle, Plane } from "lucide-react";

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  // Mock data
  const bookingData = {
    id: params.id,
    tourName: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ คาวากุจิโกะ (6D4N)",
    travelDate: "15 พ.ย. 2026 - 20 พ.ย. 2026",
    status: "AWAITING_CONFIRMATION",
    customer: {
      name: "คุณสมชาย ใจดี",
      phone: "081-234-5678",
      email: "somchai@email.com",
      address: "123/45 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110"
    },
    payment: {
      total: 45900,
      paid: 0,
      balance: 45900,
      history: [
        { date: "12 ต.ค. 26 14:35 น.", type: "โอนเงินเข้าธนาคารกสิกรไทย", amount: 45900, status: "รอตรวจสอบสลิป" }
      ]
    },
    travelers: [
      { id: 1, name: "นายสมชาย ใจดี", type: "ผู้ใหญ่", passportId: "AA1234567" },
      { id: 2, name: "นางสมหญิง ใจดี", type: "ผู้ใหญ่", passportId: "AA9876543" }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              รายละเอียดการจอง
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                รอตรวจสลิป
              </span>
            </h2>
            <p className="text-gray-500 mt-1 font-mono tracking-wide">รหัส: {bookingData.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/bookings/${bookingData.id}/verify-slip`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all">
            <CheckCircle2 className="w-5 h-5" /> ตรวจสอบสลิปด่วน
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Package Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-indigo-500" /> ข้อมูลทัวร์ (Tour Package)
            </h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-indigo-100 rounded-xl shrink-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" alt="Japan" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-bold text-lg text-gray-800">{bookingData.tourName}</p>
                <p className="text-gray-600 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-gray-400" /> วันเดินทาง: <span className="font-bold">{bookingData.travelDate}</span></p>
                <p className="text-gray-600 flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-gray-400" /> ผู้เดินทางทั้งหมด: <span className="font-bold">{bookingData.travelers.length} ท่าน</span></p>
              </div>
            </div>
          </div>

          {/* Travelers List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" /> รายชื่อผู้เดินทาง (Travelers)
              </h3>
              <Link href="/admin/wholesale" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                ไปหน้าจัดการเอกสาร <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {bookingData.travelers.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold">{t.id}</div>
                    <div>
                      <p className="font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Passport No.</p>
                    <p className="font-mono text-sm font-bold text-gray-700">{t.passportId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ข้อมูลผู้ติดต่อหลัก</h3>
            <div className="space-y-3 text-sm">
              <p className="font-bold text-lg text-gray-800">{bookingData.customer.name}</p>
              <p className="text-gray-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-400" /> {bookingData.customer.phone}</p>
              <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {bookingData.customer.email}</p>
              <div className="pt-2">
                <p className="text-gray-400 text-xs mb-1">ที่อยู่ออกใบเสร็จ:</p>
                <p className="text-gray-700 leading-relaxed">{bookingData.customer.address}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">สถานะการชำระเงิน</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ยอดรวมทั้งสิ้น</span>
                <span className="font-bold text-gray-800">฿{bookingData.payment.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ชำระแล้ว</span>
                <span className="font-bold text-emerald-600">฿{bookingData.payment.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800">ยอดค้างชำระ</span>
                <span className="font-black text-red-600">฿{bookingData.payment.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ประวัติการชำระเงิน</p>
              {bookingData.payment.history.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">฿{h.amount.toLocaleString()} <span className="text-xs font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded ml-1">{h.status}</span></p>
                    <p className="text-xs text-gray-500">{h.type}</p>
                    <p className="text-xs text-gray-400">{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
            <Link href={`/admin/bookings/${bookingData.id}/send-document?type=invoice1`} className="w-full text-center py-2.5 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex justify-center items-center gap-2">
              <FileText className="w-4 h-4" /> ออกอินวอยซ์มัดจำ
            </Link>
            <Link href={`/admin/wholesale`} className="w-full text-center py-2.5 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex justify-center items-center gap-2">
              <Download className="w-4 h-4" /> ไปหน้าจัดการ Wholesale
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
