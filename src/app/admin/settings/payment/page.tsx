"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, CreditCard, Building, QrCode, CheckCircle2 } from "lucide-react";

export default function PaymentSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [banks, setBanks] = useState([
    { id: 1, name: "ธนาคารกสิกรไทย (KBANK)", accountNo: "012-3-45678-9", accountName: "บริษัท จงทัวร์ จำกัด" }
  ]);

  const addBank = () => {
    setBanks([...banks, { id: Date.now(), name: "ธนาคารกสิกรไทย (KBANK)", accountNo: "", accountName: "" }]);
  };

  const removeBank = (id: number) => {
    setBanks(banks.filter(bank => bank.id !== id));
  };

  const updateBank = (id: number, field: string, value: string) => {
    setBanks(banks.map(bank => bank.id === id ? { ...bank, [field]: value } : bank));
  };

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
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ช่องทางชำระเงิน (Payment Methods)
          </h2>
          <p className="text-gray-500 mt-1">ตั้งค่าบัญชีธนาคาร, PromptPay และ Payment Gateway</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bank Transfer */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-lg text-gray-900">โอนเงินผ่านธนาคาร (Bank Transfer)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-6">
            {banks.map((bank, index) => (
              <div key={bank.id} className="relative border border-gray-100 p-4 rounded-xl bg-white shadow-sm">
                {banks.length > 1 && (
                  <button 
                    onClick={() => removeBank(bank.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                  >
                    ×
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">ธนาคาร</label>
                    <select 
                      value={bank.name}
                      onChange={(e) => updateBank(bank.id, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    >
                      <option>ธนาคารกสิกรไทย (KBANK)</option>
                      <option>ธนาคารไทยพาณิชย์ (SCB)</option>
                      <option>ธนาคารกรุงเทพ (BBL)</option>
                      <option>ธนาคารกรุงไทย (KTB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">เลขบัญชี</label>
                    <input 
                      type="text" 
                      value={bank.accountNo}
                      onChange={(e) => updateBank(bank.id, 'accountNo', e.target.value)}
                      placeholder="เช่น 012-3-45678-9" 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อบัญชี</label>
                  <input 
                    type="text" 
                    value={bank.accountName}
                    onChange={(e) => updateBank(bank.id, 'accountName', e.target.value)}
                    placeholder="เช่น บริษัท จงทัวร์ จำกัด" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={addBank}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              + เพิ่มบัญชีธนาคารอื่น
            </button>
          </div>
        </div>

        {/* PromptPay */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-indigo-600" />
              <h3 className="font-bold text-lg text-gray-900">พร้อมเพย์ (PromptPay QR)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">เลขประจำตัวผู้เสียภาษี / เบอร์โทรศัพท์ (PromptPay ID)</label>
              <input type="text" defaultValue="0105566778899" className="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              <p className="text-xs text-gray-500 mt-2">ระบบจะสร้าง QR Code อัตโนมัติจาก PromptPay ID นี้ในหน้าชำระเงิน</p>
            </div>
          </div>
        </div>

        {/* Credit Card API */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden opacity-70">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <h3 className="font-bold text-lg text-gray-900">บัตรเครดิต (Payment Gateway)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-4 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">ผู้ให้บริการ (Provider)</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" disabled>
                  <option>Omise (Opn Payments)</option>
                  <option>Stripe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Public Key</label>
                <input type="text" placeholder="pkey_test_..." className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm" disabled />
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
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-70"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
