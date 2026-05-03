"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { FileText, Send, CheckCircle2, Download, Clock, CreditCard, Ticket, Bot, MoreVertical, FileDown, Paperclip, MessageCircle } from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  // Use params.id in real app to fetch data. Here we mock it as 'JT-2605-001'
  const bookingRef = 'JT-2605-001';
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{bookingRef}</h1>
            <Badge variant="warning">รอชำระเงินงวด 2</Badge>
            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-medium">ONLINE (B2C)</span>
          </div>
          <p className="text-slate-400 font-medium text-sm">ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (5D3N) • เดินทาง 10-15 ตุลาคม 2026 • 2 ผู้ใหญ่</p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-slate-500">ลูกค้า:</span>
            <span className="font-bold text-white">คุณสมชาย ใจดี</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-slate-500">ยอดสุทธิ:</span>
            <span className="font-bold text-emerald-400">฿71,800</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <MessageCircle className="w-4 h-4 mr-2" /> แชท LINE
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white">
            จัดการผู้เดินทาง
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'billing' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          อินวอยซ์ & การชำระเงิน (Billing)
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'documents' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          ใบนัดหมาย (Vouchers & Docs)
        </button>
        <button 
          onClick={() => setActiveTab('wholesale')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'wholesale' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          สถานะคู่ค้า (Wholesale)
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Installment Plan */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                แผนการชำระเงิน (Installments)
              </h3>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">แก้ไขงวดชำระ</Button>
            </div>

            <div className="space-y-4">
              {/* Installment 1 (Paid) */}
              <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PAID</div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">งวดที่ 1 (มัดจำ 50%)</h4>
                    <p className="text-xs text-slate-400 mt-1">กำหนดชำระ: 01 เม.ย. 2026</p>
                  </div>
                  <span className="font-black text-lg text-emerald-400">฿35,900</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> ชำระแล้วเมื่อ 01 เม.ย. 2026
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
                      <Download className="w-3 h-3 mr-1" /> ใบเสร็จ (Receipt)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Installment 2 (Pending) */}
              <div className="p-4 bg-slate-900 border border-amber-500/30 ring-1 ring-amber-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-bl-lg animate-pulse">PENDING</div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">งวดที่ 2 (ยอดคงเหลือ)</h4>
                    <p className="text-xs text-rose-400 mt-1">กำหนดชำระ: 15 ก.ย. 2026 (ล่วงหน้า 25 วัน)</p>
                  </div>
                  <span className="font-black text-lg text-white">฿35,900</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3 text-amber-500" /> รอลูกค้าโอนเงิน
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="w-3 h-3 mr-1" /> ทวงเงิน / ส่ง Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices & Documents List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-indigo-500" />
              เอกสารทางบัญชี (Invoices & Receipts)
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between group hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded flex items-center justify-center">
                    <FileDown className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">INV-26040001 (มัดจำ)</p>
                    <p className="text-xs text-slate-500">สร้างเมื่อ: 01 เม.ย. 2026</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 text-slate-300 px-2"><Download className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 text-blue-400 px-2"><Send className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between group hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">REC-26040001 (ใบเสร็จรับเงิน)</p>
                    <p className="text-xs text-slate-500">สร้างเมื่อ: 01 เม.ย. 2026</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 text-slate-300 px-2"><Download className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 text-blue-400 px-2"><Send className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between border-dashed border-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">INV-XXXX (ยอดคงเหลือ)</p>
                    <p className="text-xs text-amber-500">รอสร้างเอกสาร</p>
                  </div>
                </div>
                <Button size="sm" className="h-8 bg-slate-700 hover:bg-slate-600 text-white">สร้าง Invoice</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" />
                ใบนัดหมาย และ File โปรแกรมทัวร์ (e-Voucher)
              </h3>
              <p className="text-sm text-slate-400 mt-1">อัปโหลดไฟล์เตรียมไว้เพื่อส่งให้ลูกค้าเตรียมตัวก่อนเดินทาง</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-slate-300">Auto-Send (บอทส่งอัตโนมัติ)</span>
              {/* Toggle Switch */}
              <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer ml-2">
                <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
            <Bot className="w-6 h-6 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-400 mb-1">บอทส่งอัตโนมัติทำงานอยู่</p>
              <p className="text-xs text-slate-300">บอทจะทำการส่งเอกสารทั้งหมดด้านล่างนี้ ผ่านทาง <strong className="text-white">LINE OA</strong> ให้กับลูกค้าในวันที่ <strong className="text-white">03 ตุลาคม 2026 (ล่วงหน้า 7 วันก่อนเดินทาง)</strong> เวลา 10:00 น.</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-900/50 mb-6 hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <Paperclip className="w-8 h-8 text-slate-500 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
            <p className="text-white font-bold mb-1">คลิกหรือลากไฟล์มาวางที่นี่</p>
            <p className="text-xs text-slate-400">รองรับ PDF, JPG, PNG (สูงสุด 10MB/ไฟล์)</p>
          </div>

          {/* Uploaded Files */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded flex items-center justify-center text-xs font-bold text-amber-500">PDF</div>
                <div>
                  <p className="text-sm font-bold text-white">Voucher_JT2605001.pdf</p>
                  <p className="text-xs text-slate-500">ใบนัดหมาย (Meeting Point)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 border-slate-600 text-slate-300">
                  <Send className="w-4 h-4 mr-2" /> ส่งด่วนตอนนี้ (Manual)
                </Button>
                <button className="text-slate-500 hover:text-rose-400 p-2"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wholesale' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center py-20">
          <p className="text-slate-400 mb-4">เชื่อมต่อข้อมูลกับ Wholesale เรียบร้อยแล้ว (Zego Booking ID: ZG-109923)</p>
          <Badge variant="success" className="text-lg px-4 py-2">CONFIRMED (ที่นั่งยืนยันแล้ว)</Badge>
        </div>
      )}

    </div>
  );
}
