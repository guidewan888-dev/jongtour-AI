"use client";
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, CheckCircle2, XCircle, Search, Clock, FileImage, ExternalLink } from 'lucide-react';

export default function PaymentPendingPage() {
  const pendingPayments = [
    { 
      ref: 'JT-2605-001', 
      customer: 'สมชาย ใจดี', 
      amount: '฿45,000', 
      tour: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (5D3N)',
      time: '10 นาทีที่แล้ว',
      bank: 'KBank (กสิกรไทย)',
      slipUrl: '/images/mock-slip.jpg' // In real app, this is a real image URL
    },
    { 
      ref: 'JT-2605-008', 
      customer: 'บริษัท เอบีซี จำกัด', 
      amount: '฿120,000', 
      tour: 'ทัวร์ยุโรปตะวันออก (8D5N)',
      time: '1 ชั่วโมงที่แล้ว',
      bank: 'SCB (ไทยพาณิชย์)',
      slipUrl: null
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-rose-500" />
            ตรวจสลิปโอนเงิน (Payment Pending)
          </h1>
          <p className="text-slate-400">ระบบตรวจสอบสลิปโอนเงิน อนุมัติยอดเพื่อเปลี่ยนสถานะ Booking เป็นจ่ายแล้ว (PAID)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Side: Queue List */}
        <div className="lg:col-span-5 flex flex-col bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              คิวรอตรวจสอบ (2 รายการ)
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {pendingPayments.map((payment, idx) => (
              <div key={idx} className={`p-4 rounded-xl border cursor-pointer transition-all ${idx === 0 ? 'bg-slate-700 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-blue-400">{payment.ref}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {payment.time}</span>
                </div>
                <p className="text-white font-medium">{payment.customer}</p>
                <p className="text-sm text-slate-400 truncate mb-3">{payment.tour}</p>
                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">ยอดโอน: <strong className="text-emerald-400 text-sm">{payment.amount}</strong></span>
                  <Badge variant={idx === 0 ? 'info' : 'neutral'}>{payment.bank}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Slip Verification View */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h2 className="text-xl font-bold text-white">ตรวจเช็คยอด: JT-2605-001</h2>
              <p className="text-slate-400 text-sm">สมชาย ใจดี • ยอดที่ต้องชำระ <strong className="text-white">฿45,000</strong></p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
                <XCircle className="w-4 h-4 mr-2" /> ปฏิเสธ (Reject)
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 mr-2" /> อนุมัติยอด (Approve)
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-y-auto custom-scrollbar">
            {/* Slip Image Viewer */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/30 rounded-xl border border-slate-800 p-4 relative min-h-[400px]">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 h-8">
                  <Search className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 h-8">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Dummy Slip Placeholder */}
              <div className="w-full max-w-sm h-full max-h-[500px] bg-slate-200 rounded flex flex-col items-center justify-center text-slate-500 shadow-2xl transform rotate-1">
                <FileImage className="w-16 h-16 mb-4 text-slate-400" />
                <p className="font-bold">รูปสลิปโอนเงินลูกค้า</p>
                <p className="text-xs">Slip_JT2605001.jpg</p>
                <div className="mt-8 border border-slate-300 p-4 rounded text-center bg-white/50 w-3/4">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Transfer Amount</p>
                  <p className="text-xl font-black text-slate-800">45,000.00 THB</p>
                  <p className="text-xs text-slate-500 mt-2">10-Oct-2026 14:30:00</p>
                </div>
              </div>
            </div>

            {/* Verification Details */}
            <div className="w-full md:w-80 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">บัญชีรับเงิน (Our Bank)</h4>
                <div className="p-4 bg-slate-800 rounded-xl border border-blue-500/30 ring-1 ring-blue-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white">กสิกรไทย (KBank)</span>
                    <Badge variant="success">ตรงกับสลิป</Badge>
                  </div>
                  <p className="text-xl font-mono text-slate-300">012-3-45678-9</p>
                  <p className="text-sm text-slate-500 mt-1">บจก. จงทัวร์ คอร์ปอเรชั่น</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">ตรวจสอบยอด (Amount Check)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400">ยอดที่ต้องชำระ</span>
                    <span className="font-bold text-white">฿45,000.00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-emerald-500/20">
                    <span className="text-slate-400">ยอดในสลิป (Bot อ่านได้)</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> ฿45,000.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
