"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, Send, CheckCircle2, Download, Clock, CreditCard, Ticket, Bot, 
  MoreVertical, FileDown, Paperclip, MessageCircle, Link as LinkIcon, ExternalLink, 
  CheckSquare, Save, Search, MapPin, Building2, UploadCloud, Copy, Edit3
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingRef = 'JT-2605-001';
  const [activeTab, setActiveTab] = useState('billing'); 

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{bookingRef}</h1>
            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-medium">ONLINE (B2C)</span>
          </div>
          <p className="text-slate-400 font-medium text-sm">ลูกค้า: <strong className="text-white">คุณสมชาย ใจดี</strong> • ยอดสุทธิ: <strong className="text-emerald-400">฿71,800</strong></p>
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

      {/* TOP PRIORITY: Wholesale Booking Box */}
      <div className="bg-slate-800 border-2 border-purple-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">ระบบส่งจองคู่ค้า (Wholesale Booking)</div>
        
        <div className="flex flex-col lg:flex-row gap-6 mt-2">
          {/* Left: Info & Badges */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600">Supplier: Let'go Group</Badge>
              <Badge variant="warning">Method: Manual Website</Badge>
              <Badge variant="success">Link Status: Valid</Badge>
              <Badge variant="info" className="animate-pulse">Status: Waiting Wholesale Booking</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Tour Code (รหัสโปรแกรม):</span>
                <span className="font-bold text-white text-base">JP-TYO-5D3N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Departure (วันเดินทาง):</span>
                <span className="font-bold text-white text-base">10-15 พ.ค. 2026</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Pax (ผู้เดินทาง):</span>
                <span className="font-bold text-white text-base">2 Adult</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">External Tour ID:</span>
                <span className="text-slate-300">EXT-LG-8891</span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="w-full lg:w-80 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 py-6 text-base font-bold">
              <ExternalLink className="w-5 h-5 mr-2" /> เปิดหน้าโปรแกรม Wholesale
            </Button>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-9">
                <Copy className="w-3 h-3 mr-2" /> Copy รหัสทัวร์
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-9">
                <Copy className="w-3 h-3 mr-2" /> Copy ข้อมูลลูกค้า
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 h-9">
                <Clock className="w-3 h-3 mr-2" /> Mark Waiting
              </Button>
              <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 h-9">
                <CheckCircle2 className="w-3 h-3 mr-2" /> Mark Confirmed
              </Button>
            </div>

            <Button variant="outline" className="w-full mt-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 border-dashed">
              <Edit3 className="w-4 h-4 mr-2" /> บันทึกเลขจอง Wholesale
            </Button>
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
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PAID</div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">งวดที่ 1 (มัดจำ 50%)</h4>
                  </div>
                  <span className="font-black text-lg text-emerald-400">฿35,900</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-indigo-500" />
              เอกสารทางบัญชี (Invoices & Receipts)
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                <p className="text-sm font-bold text-white">INV-26040001 (มัดจำ)</p>
                <Button size="sm" variant="outline" className="h-8 border-slate-700 text-blue-400 px-2"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Ticket className="w-5 h-5 text-amber-500" />
            ใบนัดหมาย (e-Voucher)
          </h3>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Voucher_JT2605001.pdf</p>
            <Button size="sm" variant="outline" className="h-8 border-slate-600 text-slate-300"><Send className="w-4 h-4 mr-2" /> ส่งด่วนตอนนี้</Button>
          </div>
        </div>
      )}
    </div>
  );
}
