"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Webhook, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";

export default function ApiSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      alert("เชื่อมต่อ API สำเร็จ! ดึงข้อมูลได้ 1,420 รายการทัวร์");
    }, 1500);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            เชื่อมต่อ Wholesale API (Integrations)
          </h2>
          <p className="text-gray-500 mt-1">ตั้งค่า API Keys เพื่อดึงข้อมูลทัวร์จากระบบส่วนกลาง</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Go365 API */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G3</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">ระบบ Go365</h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-green-600 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  เชื่อมต่อล่าสุด: วันนี้ 08:00 น.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Active</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">API Endpoint URL</label>
                <input type="text" defaultValue="https://api.go365.com/v2/tours" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Code</label>
                <input type="text" defaultValue="JT-BKK-001" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Bearer Token / API Key</label>
              <div className="relative">
                <input type="password" defaultValue="API_KEY_PLACEHOLDER_REDACTED" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> ห้ามแชร์ API Key นี้ให้บุคคลภายนอกเด็ดขาด</p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button onClick={handleTest} disabled={isTesting} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                <Webhook className={`w-4 h-4 ${isTesting ? 'animate-pulse' : ''}`} /> 
                {isTesting ? 'กำลังทดสอบการเชื่อมต่อ...' : 'ทดสอบการเชื่อมต่อ (Test Connection)'}
              </button>
            </div>
          </div>
        </div>

        {/* Zego API */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">ZG</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">ระบบ Zego</h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-green-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  เชื่อมต่อล่าสุด: วันนี้ 08:05 น.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">Active</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">API Endpoint URL</label>
                <input type="text" defaultValue="https://www.zegoapi.com/v1.5/programtours" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Code</label>
                <input type="text" defaultValue="JT-BKK-002" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Bearer Token / API Key</label>
              <div className="relative">
                <input type="password" defaultValue="ZG_MOCK_API_KEY_987654321" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> ห้ามแชร์ API Key นี้ให้บุคคลภายนอกเด็ดขาด</p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <button onClick={handleTest} disabled={isTesting} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                <Webhook className={`w-4 h-4 ${isTesting ? 'animate-pulse' : ''}`} /> 
                {isTesting ? 'กำลังทดสอบการเชื่อมต่อ...' : 'ทดสอบการเชื่อมต่อ (Test Connection)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 flex items-center gap-4">
        {saved && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5" /> บันทึกการตั้งค่าเรียบร้อย
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-gray-800 shadow-xl shadow-gray-900/30 transition-all disabled:opacity-70"
        >
          {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </div>
  );
}
