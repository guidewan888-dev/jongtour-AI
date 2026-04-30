"use client";

import { useState } from "react";
import { Copy, UploadCloud, AlertCircle, CreditCard, QrCode, Landmark } from "lucide-react";
import Link from "next/link";

export default function PaymentTabs({ bookingId, handlePayment, totalAmount }: { bookingId: string, handlePayment: () => void, totalAmount: number }) {
  const [method, setMethod] = useState<'bank' | 'promptpay' | 'credit'>('bank');
  
  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">เลือกช่องทางการชำระเงิน</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <button 
            onClick={() => setMethod('bank')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${method === 'bank' ? 'border-[#5392f9] bg-blue-50 text-[#5392f9]' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'}`}
          >
            <Landmark className="w-8 h-8 mb-2" />
            <span className="text-xs md:text-sm font-bold">โอนเงินผ่านธนาคาร</span>
          </button>
          <button 
            onClick={() => setMethod('promptpay')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${method === 'promptpay' ? 'border-[#5392f9] bg-blue-50 text-[#5392f9]' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'}`}
          >
            <QrCode className="w-8 h-8 mb-2" />
            <span className="text-xs md:text-sm font-bold">สแกนพร้อมเพย์</span>
          </button>
          <button 
            onClick={() => setMethod('credit')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${method === 'credit' ? 'border-[#5392f9] bg-blue-50 text-[#5392f9]' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'}`}
          >
            <CreditCard className="w-8 h-8 mb-2" />
            <span className="text-xs md:text-sm font-bold">บัตรเครดิต/เดบิต</span>
          </button>
        </div>

        {method === 'bank' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#5392f9]/50 transition-colors">
              <div className="flex items-center gap-6 mb-4 md:mb-0 w-full">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Kasikornbank_logo.svg/1200px-Kasikornbank_logo.svg.png" alt="KBank" className="w-16 h-16 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">ธนาคารกสิกรไทย</p>
                  <p className="text-gray-500 text-sm mb-1">บจก. จองทัวร์ เอไอ</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xl font-mono text-gray-800 font-bold tracking-wider">012-3-45678-9</span>
                    <button className="text-[#5392f9] hover:text-blue-700 p-1 flex items-center justify-center gap-1 text-xs font-bold bg-blue-100 rounded px-3 border border-blue-200 w-fit">
                      <Copy className="w-3 h-3" /> คัดลอก
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#5392f9]/50 transition-colors">
              <div className="flex items-center gap-6 mb-4 md:mb-0 w-full">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/SCB_logo.svg/1200px-SCB_logo.svg.png" alt="SCB" className="w-16 h-16 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">ธนาคารไทยพาณิชย์</p>
                  <p className="text-gray-500 text-sm mb-1">บจก. จองทัวร์ เอไอ</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xl font-mono text-gray-800 font-bold tracking-wider">987-6-54321-0</span>
                    <button className="text-[#5392f9] hover:text-blue-700 p-1 flex items-center justify-center gap-1 text-xs font-bold bg-blue-100 rounded px-3 border border-blue-200 w-fit">
                      <Copy className="w-3 h-3" /> คัดลอก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {method === 'promptpay' && (
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/PromptPay_logo.png/1200px-PromptPay_logo.png" alt="PromptPay" className="h-10 object-contain mb-6" />
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                <QrCode className="w-20 h-20 text-gray-300" />
                <span className="absolute text-gray-400 font-bold">QR ตัวอย่าง</span>
              </div>
            </div>
            <p className="font-bold text-gray-800 text-lg mb-1">สแกนเพื่อชำระเงิน</p>
            <p className="text-[#5392f9] font-bold text-xl mb-4">฿ {totalAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              ใช้แอปพลิเคชันธนาคารใดก็ได้ สแกน QR Code นี้เพื่อชำระเงิน
            </p>
          </div>
        )}

        {method === 'credit' && (
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-2 mb-6">
              <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-blue-900">VISA</div>
              <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-red-600">MASTER</div>
              <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-blue-500">JCB</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">หมายเลขบัตร</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5392f9] focus:ring-1 focus:ring-[#5392f9] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">วันหมดอายุ</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5392f9] focus:ring-1 focus:ring-[#5392f9] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">CVC / CVV</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5392f9] focus:ring-1 focus:ring-[#5392f9] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อบนบัตร</label>
                <input type="text" placeholder="ชื่อ-นามสกุล ภาษาอังกฤษ" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5392f9] focus:ring-1 focus:ring-[#5392f9] outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {(method === 'bank' || method === 'promptpay') && (
        <div className="mb-8 animate-in fade-in duration-500">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">แนบหลักฐานการชำระเงิน (Upload Slip)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-[#5392f9] transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-blue-50 text-[#5392f9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-700 mb-1">คลิกเพื่ออัปโหลดสลิป</p>
            <p className="text-sm text-gray-500 mb-4 text-center">หรือลากไฟล์มาวางที่นี่ (รองรับ JPG, PNG, PDF ขนาดไม่เกิน 5MB)</p>
            <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 group-hover:border-[#5392f9] group-hover:text-[#5392f9] transition-colors">
              เลือกไฟล์
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-8">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          {method === 'credit' 
            ? "ระบบประมวลผลบัตรเครดิตมีความปลอดภัยสูงสุด ข้อมูลของท่านจะถูกเข้ารหัสและไม่ถูกเก็บบันทึกไว้ในระบบ" 
            : "เมื่อท่านกดส่งหลักฐานการชำระเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและยืนยันการจอง ภายใน 1-2 ชั่วโมงเวลาทำการครับ"}
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-4">
        <Link href={`/user/bookings/${bookingId}`} className="flex-1 py-4 text-center font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          กลับไปหน้ารายละเอียด
        </Link>
        <form action={handlePayment} className="flex-1">
          <button type="submit" className="w-full h-full py-4 text-center font-bold text-white bg-[#5392f9] hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 transition-colors relative overflow-hidden group">
            <span className="relative z-10">{method === 'credit' ? `ชำระเงิน ${totalAmount.toLocaleString()} ฿` : 'แจ้งชำระเงินเรียบร้อย'}</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      </div>
    </>
  );
}
