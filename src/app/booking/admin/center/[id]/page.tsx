"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, Send, CheckCircle2, Download, Clock, CreditCard, Ticket, Bot, 
  MoreVertical, FileDown, Paperclip, MessageCircle, Link as LinkIcon, ExternalLink, 
  CheckSquare, Save, Search, MapPin, Building2, UploadCloud, Copy, Edit3, ShieldAlert
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingRef = 'JT-2605-001';
  const [activeTab, setActiveTab] = useState('wholesale');
  const [hasPassportPermission, setHasPassportPermission] = useState(false); // Mock permission state
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Mock Data
  const wholesaleBookingMethod = 'manual_website';
  const customer = { name: "คุณสมชาย ใจดี", phone: "089-123-4567", email: "somchai@example.com" };
  const tourInfo = { 
    name: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (5D3N)", code: "JP-TYO-5D3N", 
    supplierCode: "EXT-LG-8891", date: "10-15 พ.ค. 2026", pax: 2, price: "฿71,800" 
  };
  const travelers = [
    { name: "MR. SOMCHAI JAIDEE", gender: "Male", dob: "15/05/1980", passport: "AA1234567", nationality: "THAI", meal: "No Beef" },
    { name: "MRS. SOMSRI JAIDEE", gender: "Female", dob: "20/08/1982", passport: "AA9876543", nationality: "THAI", meal: "Normal" }
  ];

  const handleCopy = (type: string) => {
    let textToCopy = "";
    if (type === 'customer') {
      textToCopy = `[ข้อมูลลูกค้า]\nชื่อ: ${customer.name}\nเบอร์โทร: ${customer.phone}\nEmail: ${customer.email}\nผู้เดินทาง: ${tourInfo.pax} ท่าน\nเดินทาง: ${tourInfo.date}\nโปรแกรม: ${tourInfo.name}\nหมายเหตุ: VIP Customer`;
    } else if (type === 'booking') {
      textToCopy = `[ข้อมูลการจอง]\nBooking No: ${bookingRef}\nTour Code: ${tourInfo.code}\nSupplier Code: ${tourInfo.supplierCode}\nวันเดินทาง: ${tourInfo.date}\nจำนวน: ${tourInfo.pax} ท่าน\nห้องพัก: 1 Twin Room\nคำขอพิเศษ: ขอห้อง Connecting\nยอดเงิน: ${tourInfo.price}`;
    } else if (type === 'traveler') {
      textToCopy = "[รายชื่อผู้เดินทาง]\n" + travelers.map((t, i) => {
        const pass = hasPassportPermission ? t.passport : "HIDDEN (No Permission)";
        return `${i+1}. ${t.name} (${t.gender}) | DOB: ${t.dob} | PP: ${pass} | Nat: ${t.nationality} | Meal: ${t.meal}`;
      }).join("\n");
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto h-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{bookingRef}</h1>
            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-medium">ONLINE (B2C)</span>
          </div>
          <p className="text-slate-400 font-medium text-sm">ลูกค้า: <strong className="text-white">{customer.name}</strong> • ยอดสุทธิ: <strong className="text-emerald-400">{tourInfo.price}</strong></p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Permission Toggle for Demo */}
          <div className="flex items-center gap-2 mr-4 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Admin Data Privacy:
            <button 
              onClick={() => setHasPassportPermission(!hasPassportPermission)}
              className={`ml-2 px-2 py-0.5 rounded text-white ${hasPassportPermission ? 'bg-emerald-600' : 'bg-rose-600'}`}
            >
              {hasPassportPermission ? 'ON' : 'OFF'}
            </button>
          </div>
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
                <span className="font-bold text-white text-base">{tourInfo.code}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Departure (วันเดินทาง):</span>
                <span className="font-bold text-white text-base">{tourInfo.date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Pax (ผู้เดินทาง):</span>
                <span className="font-bold text-white text-base">{tourInfo.pax} Adult</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">External Tour ID:</span>
                <span className="text-slate-300">{tourInfo.supplierCode}</span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="w-full lg:w-96 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 py-6 text-base font-bold">
              <ExternalLink className="w-5 h-5 mr-2" /> เปิดหน้าโปรแกรม Wholesale
            </Button>
            
            {/* Copy Helpers */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className={`text-xs h-10 border-slate-600 flex-col gap-1 ${copiedType === 'customer' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'text-slate-300 hover:bg-slate-700'}`}
                onClick={() => handleCopy('customer')}
              >
                {copiedType === 'customer' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy ลูกค้า
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={`text-xs h-10 border-slate-600 flex-col gap-1 ${copiedType === 'booking' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'text-slate-300 hover:bg-slate-700'}`}
                onClick={() => handleCopy('booking')}
              >
                {copiedType === 'booking' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy จอง
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={`text-xs h-10 border-slate-600 flex-col gap-1 ${copiedType === 'traveler' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'text-slate-300 hover:bg-slate-700'}`}
                onClick={() => handleCopy('traveler')}
              >
                {copiedType === 'traveler' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy รายชื่อ
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
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-blue-500" /> แผนการชำระเงิน
            </h3>
            <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl">
              <div className="flex justify-between items-center"><span className="text-white">งวดที่ 1</span><Badge variant="success">PAID</Badge></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Ticket className="w-5 h-5 text-amber-500" /> ใบนัดหมาย
          </h3>
          <p className="text-slate-400">ยังไม่มีเอกสาร</p>
        </div>
      )}
    </div>
  );
}
