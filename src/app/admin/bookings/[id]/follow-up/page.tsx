"use client";

import Link from "next/link";
import { ChevronLeft, FileWarning, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function FollowUpPage({ params }: { params: { id: string } }) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ติดตามเอกสาร (Follow Up)
          </h2>
          <p className="text-gray-500 mt-1">รหัสการจอง: {params.id}</p>
        </div>
      </div>

      {isSent ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ส่งข้อความติดตามสำเร็จ</h2>
          <p className="text-gray-500 mb-8">ระบบได้ส่งข้อความแจ้งเตือนไปยังลูกค้าเรียบร้อยแล้ว</p>
          <Link href="/admin" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-colors">
            กลับไปหน้า Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shrink-0 shadow-sm">
              <FileWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-lg">เอกสารที่ขาดหาย</h3>
              <p className="text-red-600 text-sm mt-1">ลูกค้ายังไม่อัปโหลดพาสปอร์ตจำนวน 2 ท่าน (จากทั้งหมด 4 ท่าน)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">ข้อความที่จะส่งให้ลูกค้า</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-700 text-sm mb-6">
              <p>เรียน คุณธนาธร สว่างจิต</p>
              <br/>
              <p>ตามที่ท่านได้จองทัวร์จอร์เจีย (BK-240407) ไว้ ทางบริษัทขอความกรุณาท่านอัปโหลดเอกสารพาสปอร์ตสำหรับผู้เดินทางอีก 2 ท่าน เพื่อดำเนินการจองตั๋วเครื่องบินและโรงแรมต่อไป</p>
              <br/>
              <p>ท่านสามารถคลิกที่ลิงก์ด้านล่างเพื่ออัปโหลดเอกสารได้ทันที</p>
              <p className="text-blue-600 underline">https://jongtour.com/user/bookings/BK-240407/visa</p>
            </div>

            <h3 className="font-bold text-gray-900 mb-4">ช่องทางการแจ้งเตือน</h3>
            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-3 p-3 border border-indigo-200 bg-indigo-50 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                <Mail className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-900 text-sm">ส่งทางอีเมล</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-900 text-sm">ส่งทางข้อความระบบ (Inbox)</span>
              </label>
            </div>

            <button 
              onClick={handleSend}
              disabled={isSending}
              className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
            >
              {isSending ? (
                "กำลังส่งข้อความ..."
              ) : (
                <><Send className="w-5 h-5" /> ยืนยันการส่งข้อความติดตาม</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
