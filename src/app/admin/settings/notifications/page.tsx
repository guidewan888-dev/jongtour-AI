"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Bell, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            การแจ้งเตือน (Notifications)
          </h2>
          <p className="text-gray-500 mt-1">ตั้งค่าเทมเพลตอีเมล, Line OA และ SMS</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Templates */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <h3 className="font-bold text-lg text-gray-900">Email Notifications</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <p className="font-bold text-gray-800">ยืนยันการจอง (Booking Confirmation)</p>
                <p className="text-sm text-gray-500 mt-1">ส่งเมื่อลูกค้าทำรายการจองสำเร็จ</p>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:underline">แก้ไข Template</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <p className="font-bold text-gray-800">แจ้งเตือนชำระเงิน (Payment Reminder)</p>
                <p className="text-sm text-gray-500 mt-1">ส่งเมื่อใกล้ถึงกำหนดชำระเงิน</p>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:underline">แก้ไข Template</button>
            </div>
          </div>
        </div>

        {/* LINE OA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-green-500" />
              <h3 className="font-bold text-lg text-gray-900">LINE Official Account</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Channel Access Token</label>
              <input type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5c..." className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Channel Secret</label>
              <input type="password" defaultValue="84abc123def456..." className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-4 z-50">
        {saved && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5" /> บันทึกสำเร็จ
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-amber-700 shadow-xl shadow-amber-600/30 transition-all disabled:opacity-70"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
