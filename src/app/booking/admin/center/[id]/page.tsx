"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, Send, CheckCircle2, Download, Clock, CreditCard, Ticket, Bot, 
  MoreVertical, FileDown, Paperclip, MessageCircle, Link as LinkIcon, ExternalLink, 
  CheckSquare, Save, Search, MapPin, Building2, UploadCloud, Copy, Edit3, ShieldAlert,
  AlertTriangle, Lock, PlusCircle, Activity, Play, StopCircle, Eye, Check
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingRef = 'JT-2605-001';
  const [activeTab, setActiveTab] = useState('wholesale');
  const [hasPassportPermission, setHasPassportPermission] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Wholesale Automation Mock State
  const [botStatus, setBotStatus] = useState('not_started'); // checking_data, logging_in, filling_form, waiting_admin_approval, submitted, confirmed, failed
  const isAutomationEnabled = true;

  // Mock Wholesale Data
  const wholesaleBookingMethod = 'api_bot'; // Changed to show bot capability
  const wholesaleTourUrl = "https://zego.travel/tours/EXT-LG-8891";
  const linkHealthStatus = 'valid'; 

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
      textToCopy = `[ข้อมูลการจอง]\nBooking No: ${bookingRef}\nTour Code: ${tourInfo.code}\nSupplier Code: ${tourInfo.supplierCode}\nวันเดินทาง: ${tourInfo.date}\nจำนวน: ${tourInfo.pax} ท่าน\nยอดเงิน: ${tourInfo.price}`;
    } else if (type === 'traveler') {
      textToCopy = "[รายชื่อผู้เดินทาง]\n" + travelers.map((t, i) => {
        const pass = hasPassportPermission ? t.passport : "HIDDEN (No Permission)";
        return `${i+1}. ${t.name} (${t.gender}) | DOB: ${t.dob} | PP: ${pass}`;
      }).join("\n");
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleStartBot = () => {
    setBotStatus('checking_data');
    setTimeout(() => setBotStatus('logging_in'), 1000);
    setTimeout(() => setBotStatus('filling_form'), 2500);
    setTimeout(() => setBotStatus('waiting_admin_approval'), 4500);
  };

  const handleApproveSubmit = () => {
    setBotStatus('submitted');
    setTimeout(() => setBotStatus('confirmed'), 2000);
  };

  const renderBotBadge = () => {
    switch (botStatus) {
      case 'not_started': return <Badge variant="neutral">Bot: Not Started</Badge>;
      case 'checking_data': 
      case 'logging_in': 
      case 'filling_form': 
        return <Badge className="bg-amber-500 animate-pulse text-white">Bot: {botStatus.replace('_', ' ').toUpperCase()}</Badge>;
      case 'waiting_admin_approval': 
        return <Badge className="bg-purple-600 animate-bounce text-white">Bot: WAITING APPROVAL</Badge>;
      case 'submitted': 
      case 'confirmed': 
        return <Badge variant="success">Bot: {botStatus.toUpperCase()}</Badge>;
      case 'failed': 
        return <Badge variant="danger">Bot: FAILED</Badge>;
      default: return <Badge variant="neutral">Bot: {botStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto h-full pb-10">
      
      {/* Dev Toggle Helper (Mock) */}
      <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">Dev Toolbar: Simulate Bot</span>
        <select 
          className="bg-slate-800 text-white text-xs p-1 rounded" 
          value={botStatus} 
          onChange={(e) => setBotStatus(e.target.value)}
        >
          <option value="not_started">Not Started</option>
          <option value="logging_in">Logging In</option>
          <option value="waiting_admin_approval">Waiting Approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed / Captcha</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{bookingRef}</h1>
            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-medium">ONLINE (B2C)</span>
          </div>
          <p className="text-slate-400 font-medium text-sm">ลูกค้า: <strong className="text-white">{customer.name}</strong> • ยอดสุทธิ: <strong className="text-emerald-400">{tourInfo.price}</strong></p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 mr-4 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Admin Data Privacy:
            <button onClick={() => setHasPassportPermission(!hasPassportPermission)} className={`ml-2 px-2 py-0.5 rounded text-white ${hasPassportPermission ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {hasPassportPermission ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* TOP PRIORITY: Wholesale Automation Panel */}
      <div className="bg-slate-800 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-2">
          <Bot className="w-3 h-3" /> Wholesale Automation Panel
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mt-2">
          {/* Left: Info & Badges */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600">Supplier: Let'go Group</Badge>
              <Badge variant="warning">Method: RPA Bot</Badge>
              <Badge variant="success">Credential: Encrypted Vault</Badge>
              {renderBotBadge()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm border-t border-slate-700/50 pt-4">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Tour Code:</span>
                <span className="font-bold text-white text-base">{tourInfo.code}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Departure:</span>
                <span className="font-bold text-white text-base">{tourInfo.date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Pax:</span>
                <span className="font-bold text-white text-base">{tourInfo.pax} Adult</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">External Booking Ref:</span>
                {botStatus === 'confirmed' ? (
                  <span className="font-bold text-emerald-400 text-base">LG-BKK-99812</span>
                ) : (
                  <span className="text-slate-500 italic">Waiting...</span>
                )}
              </div>
            </div>

            {botStatus === 'failed' && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mt-3">
                <AlertTriangle className="w-4 h-4" /> **Error:** Bot encountered CAPTCHA or Login Failed. Please use Manual Follow-up.
              </div>
            )}
            
            {botStatus === 'waiting_admin_approval' && (
              <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-xl mt-3">
                <ShieldAlert className="w-4 h-4" /> **Action Required:** Bot has filled the form. Please review the screenshot and click Approve to submit.
              </div>
            )}
          </div>

          {/* Right: RPA Action Buttons */}
          <div className="w-full lg:w-[400px] flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            
            {/* Primary RPA Flow */}
            {botStatus === 'not_started' && (
              <Button onClick={handleStartBot} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 py-6 text-base font-bold">
                <Play className="w-5 h-5 mr-2" /> Start Bot Preparation
              </Button>
            )}

            {(botStatus === 'checking_data' || botStatus === 'logging_in' || botStatus === 'filling_form') && (
              <Button disabled className="w-full bg-slate-700 py-6 text-base font-bold text-indigo-300">
                <Activity className="w-5 h-5 mr-2 animate-spin" /> Bot is working...
              </Button>
            )}

            {botStatus === 'waiting_admin_approval' && (
              <div className="grid grid-cols-2 gap-2">
                <Button className="bg-slate-700 hover:bg-slate-600 py-6 font-bold border border-slate-600">
                  <Eye className="w-4 h-4 mr-2" /> Preview Bot
                </Button>
                <Button onClick={handleApproveSubmit} className="bg-emerald-600 hover:bg-emerald-700 py-6 font-bold shadow-lg shadow-emerald-500/20">
                  <Check className="w-4 h-4 mr-2" /> Approve & Submit
                </Button>
              </div>
            )}

            {botStatus === 'confirmed' && (
              <Button disabled className="w-full bg-emerald-600 py-6 text-base font-bold text-white">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Bot Booking Confirmed
              </Button>
            )}
            
            {/* Manual Fallback & Tools */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant="outline" className="h-10 border-slate-600 text-slate-300 hover:bg-slate-700">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Web
              </Button>
              <Button size="sm" variant="outline" className="h-10 border-rose-500/50 text-rose-400 hover:bg-rose-500/10">
                <StopCircle className="w-4 h-4 mr-2" /> Stop Bot
              </Button>
            </div>

            {/* Copy Helpers (Miniaturized for Fallback) */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button size="sm" variant="outline" className="text-[10px] sm:text-xs h-8 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => handleCopy('customer')}>
                {copiedType === 'customer' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} ลูกค้า
              </Button>
              <Button size="sm" variant="outline" className="text-[10px] sm:text-xs h-8 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => handleCopy('booking')}>
                {copiedType === 'booking' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} จอง
              </Button>
              <Button size="sm" variant="outline" className="text-[10px] sm:text-xs h-8 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => handleCopy('traveler')}>
                {copiedType === 'traveler' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} รายชื่อ
              </Button>
            </div>

            <Button variant="outline" className="w-full mt-2 border-slate-600 text-slate-400 hover:bg-slate-800 text-xs">
              <FileDown className="w-4 h-4 mr-2" /> View Audit Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button className="px-6 py-3 font-bold text-sm transition-colors border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> การชำระเงิน (Billing)
        </button>
      </div>

    </div>
  );
}
