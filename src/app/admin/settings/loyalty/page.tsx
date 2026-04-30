"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Crown, Coins, CheckCircle2 } from "lucide-react";

export default function LoyaltySettingsPage() {
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
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ระบบสมาชิก VIP & Coins
          </h2>
          <p className="text-gray-500 mt-1">กำหนดเกณฑ์การเลื่อนระดับ VIP และอัตราการให้คะแนน</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* VIP Tiers */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
            <Crown className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-900">เกณฑ์การเลื่อนระดับ VIP (ยอดใช้จ่ายสะสม)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-200">Bronze</div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Bronze Tier (ระดับเริ่มต้น)</p>
                <p className="text-sm text-gray-500">สมัครสมาชิกใหม่</p>
              </div>
              <div className="w-32"><input type="text" value="0" disabled className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center" /></div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 border border-gray-200">Silver</div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Silver Tier</p>
                <p className="text-sm text-gray-500">ได้ส่วนลด 2%</p>
              </div>
              <div className="w-32"><input type="text" defaultValue="50,000" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-center font-bold" /></div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0 border border-yellow-200">Gold</div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">Gold Tier</p>
                <p className="text-sm text-gray-500">ได้ส่วนลด 5%</p>
              </div>
              <div className="w-32"><input type="text" defaultValue="150,000" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-center font-bold" /></div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-slate-900 text-white">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700">Platinum</div>
              <div className="flex-1">
                <p className="font-bold">Platinum Tier</p>
                <p className="text-sm text-slate-400">ได้ส่วนลด 10% + ของที่ระลึก</p>
              </div>
              <div className="w-32"><input type="text" defaultValue="500,000" className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-center font-bold text-white" /></div>
            </div>
          </div>
        </div>

        {/* Coins System */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
            <Coins className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg text-gray-900">อัตราการให้คะแนน (Jongtour Coins)</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-700">ยอดซื้อทุกๆ</span>
              <input type="number" defaultValue="100" className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold" />
              <span className="font-bold text-gray-700">บาท = ได้รับ</span>
              <input type="number" defaultValue="1" className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold" />
              <span className="font-bold text-yellow-600">Coin</span>
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
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-70"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
