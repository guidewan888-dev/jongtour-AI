import { CreditCard, QrCode, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <CheckCircle size={18} className="text-emerald-500" />
          <span className="text-emerald-600">ข้อมูลผู้จอง</span>
        </div>
        <div className="h-0.5 flex-1 bg-emerald-200 mx-4"></div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</div>
          ชำระเงิน
        </div>
        <div className="h-0.5 flex-1 bg-slate-200 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">3</div>
          เสร็จสิ้น
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Payment Header */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <p className="text-slate-400 text-sm font-medium mb-2">ยอดชำระเงินสุทธิ (Net Total)</p>
          <h1 className="text-5xl font-black tracking-tight">฿89,800</h1>
          <p className="text-slate-400 text-sm mt-4">อ้างอิงการจอง: <span className="text-white font-mono">{params.bookingId}</span></p>
        </div>

        {/* Payment Methods */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">เลือกช่องทางการชำระเงิน</h2>
          
          <div className="space-y-4">
            {/* Credit Card Option */}
            <label className="flex items-start gap-4 p-5 border-2 border-indigo-600 bg-indigo-50 rounded-xl cursor-pointer">
              <input type="radio" name="paymentMethod" defaultChecked className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2"><CreditCard size={18} className="text-indigo-600"/> บัตรเครดิต / เดบิต</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-slate-200 rounded text-[8px] font-bold flex items-center justify-center">VISA</div>
                    <div className="w-8 h-5 bg-slate-200 rounded text-[8px] font-bold flex items-center justify-center">MC</div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">ชำระผ่านระบบปลอดภัย ไม่มีค่าธรรมเนียม</p>
                
                {/* Credit Card Form Mockup */}
                <div className="mt-4 space-y-3">
                  <input type="text" placeholder="หมายเลขบัตร (Card Number)" className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none" />
                  <div className="flex gap-3">
                    <input type="text" placeholder="MM/YY" className="w-1/2 border border-slate-300 rounded-lg p-3 text-sm outline-none" />
                    <input type="text" placeholder="CVC" className="w-1/2 border border-slate-300 rounded-lg p-3 text-sm outline-none" />
                  </div>
                  <input type="text" placeholder="ชื่อบนบัตร (Name on Card)" className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none" />
                </div>
              </div>
            </label>

            {/* QR Option */}
            <label className="flex items-start gap-4 p-5 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer">
              <input type="radio" name="paymentMethod" className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
              <div className="flex-1">
                <span className="font-bold text-slate-900 flex items-center gap-2"><QrCode size={18} className="text-slate-600"/> สแกน QR Code (PromptPay)</span>
                <p className="text-sm text-slate-500 mt-1">รองรับทุกแอปพลิเคชันธนาคาร</p>
              </div>
            </label>

            {/* Bank Transfer Option */}
            <label className="flex items-start gap-4 p-5 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer">
              <input type="radio" name="paymentMethod" className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
              <div className="flex-1">
                <span className="font-bold text-slate-900 flex items-center gap-2"><Building2 size={18} className="text-slate-600"/> โอนเงินผ่านธนาคาร (Bank Transfer)</span>
                <p className="text-sm text-slate-500 mt-1">และอัปโหลดสลิปเพื่อยืนยัน</p>
              </div>
            </label>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link 
              href={`/booking/success/${params.bookingId}`}
              className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
            >
              ยืนยันและชำระเงิน ฿89,800
            </Link>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <Lock size={12} /> การชำระเงินของคุณได้รับการเข้ารหัสความปลอดภัยระดับสากล 256-bit SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
