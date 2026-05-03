"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, Send, CheckCircle2, Download, Clock, CreditCard, Ticket, Bot, 
  MoreVertical, FileDown, Paperclip, MessageCircle, Link as LinkIcon, ExternalLink, 
  CheckSquare, Save, Search, MapPin, Building2, UploadCloud
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingRef = 'JT-2605-001';
  const [activeTab, setActiveTab] = useState('wholesale'); // Set Wholesale as default for now

  // Dummy Wholesale Data
  const wholesaleBookingMethod = 'manual_website'; // api_booking, manual_website, manual_line, manual_email, manual_phone
  const wholesaleStatus = 'waiting_confirm'; // not_started, link_ready, opened_by_admin, sent_to_wholesale, waiting_confirm, confirmed

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{bookingRef}</h1>
            <Badge variant="warning">รอตรวจสอบจาก Wholesale</Badge>
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
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'wholesale' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Building2 className="w-4 h-4" /> ระบบส่งจอง Wholesale
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'wholesale' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Wholesale Info Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <LinkIcon className="w-5 h-5 text-purple-400" /> ข้อมูลโปรแกรม (Wholesale Link)
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-700/50 pb-3">
                  <span className="text-slate-500">รหัสคู่ค้า (Supplier):</span>
                  <span className="col-span-2 font-bold text-white">Zego Travel (ZG-1099)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-700/50 pb-3">
                  <span className="text-slate-500">รหัสโปรแกรม:</span>
                  <span className="col-span-2 font-bold text-blue-400">EXT-JP-5D3N-XJ</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-700/50 pb-3">
                  <span className="text-slate-500">วิธีการจอง:</span>
                  <span className="col-span-2">
                    <Badge variant="warning">MANUAL_WEBSITE</Badge>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm border-b border-slate-700/50 pb-3">
                  <span className="text-slate-500">สถานะล่าสุด:</span>
                  <span className="col-span-2">
                    <Badge variant="info">WAITING_WHOLESALE_CONFIRM</Badge>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 space-y-3">
                {wholesaleBookingMethod === 'manual_website' && (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="w-4 h-4 mr-2" /> เปิดหน้าเว็บ Wholesale เพื่อจอง
                  </Button>
                )}
                {wholesaleBookingMethod === 'manual_line' && (
                  <div className="p-4 bg-slate-900 border border-[#00B900]/30 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-[#00B900]">LINE ID: @zegotravel</span>
                    <Button size="sm" variant="outline" className="border-[#00B900] text-[#00B900]">Copy LINE ID</Button>
                  </div>
                )}

                {/* Dropdown Actions */}
                <div className="relative group">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 justify-between">
                    <span>จัดการสถานะ Wholesale (Actions)</span>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  <div className="absolute left-0 top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded">Mark as Sent to Wholesale</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded">Mark Waiting Wholesale Confirm</button>
                    <div className="border-t border-slate-700 my-1"></div>
                    <button className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded font-bold">Mark Wholesale Confirmed</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded font-bold">Mark Sold Out / Rejected</button>
                    <div className="border-t border-slate-700 my-1"></div>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded">Copy Wholesale Link</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded">Recheck Wholesale Link</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Panel */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-400 mb-3">คำแนะนำการจองเจ้านี้ (Supplier Note)</h3>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-200">
                ** เจ้านี้ต้องกดจ่ายเงินมัดจำทันทีในเว็บ 5,000 บาท/ที่นั่ง ไม่งั้นหลุดจอง **
              </div>
            </div>
          </div>

          {/* Checklist Panel */}
          <div className="lg:col-span-7 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                Manual Wholesale Checklist
              </h3>
              <Badge variant="neutral">ผู้รับผิดชอบ: Admin01</Badge>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { id: 1, text: "ตรวจสอบโปรแกรมที่ลูกค้าจอง (จำนวนคน, ราคา, วันที่)", done: true },
                { id: 2, text: "เปิดหน้าโปรแกรมของ Wholesale", done: true },
                { id: 3, text: "ตรวจสอบวันเดินทางและจำนวนที่นั่งในเว็บคู่ค้า", done: true },
                { id: 4, text: "กดจองในเว็บ Wholesale (หรือทัก LINE)", done: true },
                { id: 5, text: "บันทึกเลขอ้างอิงจาก Wholesale (Booking Ref)", done: false },
                { id: 6, text: "อัปโหลดเอกสารยืนยันจาก Wholesale (Confirmation PDF)", done: false },
                { id: 7, text: "เปลี่ยนสถานะ Booking เป็น Confirmed หรือ Waiting Confirm", done: false },
              ].map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer">
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                    {task.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'}`}>
                    {task.id}. {task.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Admin Input Form */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mt-auto">
              <h4 className="font-bold text-white mb-4">บันทึกข้อมูลการจองกับคู่ค้า</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Wholesale Booking Ref (เลขอ้างอิงคู่ค้า)</label>
                  <Input placeholder="เช่น ZG-BK-99912" className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Confirmed Price (ยอดต้นทุนยืนยัน)</label>
                  <Input type="number" placeholder="ยอดต้นทุนสุทธิ" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 block mb-1">อัปโหลดเอกสารยืนยัน (Confirmation Document)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-blue-400">
                  <UploadCloud className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">คลิกอัปโหลดไฟล์ PDF/JPG</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 block mb-1">Internal Note (บันทึกภายใน)</label>
                <Input placeholder="โน้ตเพิ่มเติมสำหรับแอดมินด้วยกัน..." className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="flex justify-end gap-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" /> บันทึกและยืนยันการจอง
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Keeping previous tabs structure intact but omitted logic to save space and focus on Wholesale Tab */}
    </div>
  );
}
