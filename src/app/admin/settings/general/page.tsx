"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, UploadCloud, CheckCircle2, Globe, Building, Mail, Phone, MapPin } from "lucide-react";

export default function GeneralSettingsPage() {
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
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            การตั้งค่าทั่วไป (General Settings)
          </h2>
          <p className="text-gray-500 mt-1">ข้อมูลพื้นฐานของบริษัท, โลโก้, และการตั้งค่าภาษี</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">ข้อมูลบริษัท (Company Information)</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors">
                <UploadCloud className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold">อัปโหลดโลโก้</span>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อบริษัท (ภาษาไทย)</label>
                    <input type="text" defaultValue="บริษัท จงทัวร์ จำกัด" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อบริษัท (ภาษาอังกฤษ)</label>
                    <input type="text" defaultValue="Jongtour Co., Ltd." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                  <input type="text" defaultValue="0105566778899" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-lg text-gray-900">ข้อมูลติดต่อ (Contact Information)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> เบอร์โทรศัพท์</label>
                <input type="text" defaultValue="02-123-4567" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> อีเมลติดต่อ</label>
                <input type="email" defaultValue="support@jongtour.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> ที่อยู่บริษัท</label>
              <textarea rows={3} defaultValue="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* System Defaults */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-900">การตั้งค่าระบบ (System Defaults)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">สกุลเงินหลัก (Default Currency)</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white">
                  <option value="THB">THB - Thai Baht</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">อัตราภาษีมูลค่าเพิ่ม (VAT %)</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white">
                  <option value="7">7% (มาตรฐาน)</option>
                  <option value="0">0% (ยกเว้นภาษี)</option>
                </select>
              </div>
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
          className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-gray-800 shadow-xl shadow-gray-900/30 transition-all disabled:opacity-70"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
