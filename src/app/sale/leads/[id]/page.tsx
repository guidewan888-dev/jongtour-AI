import { Phone, Mail, FileText, Send, Clock, User, CalendarDays, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50">
      
      {/* Left Column: Customer 360 */}
      <div className="w-1/3 min-w-[320px] bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">คุณสมชาย ใจดี</h1>
          <p className="text-sm text-slate-500 mb-4">Lead ID: #L-1024 • Source: Phone</p>
          
          <div className="flex gap-2">
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Contacted</span>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">VIP Potential</span>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลติดต่อ (Contact Info)</h2>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Phone size={16} className="text-slate-400" />
            089-123-4567
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail size={16} className="text-slate-400" />
            somchai@email.com
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ความต้องการ (Intent)</h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700">
            สนใจทัวร์ยุโรปตะวันออก (สวิส, อิตาลี) สำหรับผู้ใหญ่ 2 ท่าน ช่วงเดือนธันวาคม งบประมาณท่านละไม่เกิน 80,000 บาท
          </div>
        </div>
      </div>

      {/* Middle Column: Activity & Notes */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800">บันทึกกิจกรรม (Activity History)</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Note Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 resize-none h-24 mb-3"
              placeholder="บันทึกการคุยกับลูกค้าที่นี่ (Call note)..."
            ></textarea>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Phone size={16}/></button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><CalendarDays size={16}/></button>
              </div>
              <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800">บันทึก (Save Note)</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Phone size={14}/></div>
                <div className="w-px h-full bg-slate-200 mt-2"></div>
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-800">โทรติดต่อครั้งแรก</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> เมื่อวาน 14:30 น.</p>
                </div>
                <p className="text-sm text-slate-600">ลูกค้าแจ้งว่าขอปรึกษาภรรยาก่อน ให้โทรกลับไปตามอีกทีวันนี้ตอนสิบโมงเช้า</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><User size={14}/></div>
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-slate-800">สร้าง Lead จากระบบหลังบ้าน</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> 2 วันก่อน</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Action Bar (Crucial for CRM) */}
      <div className="w-80 min-w-[320px] bg-white border-l border-slate-200 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">เครื่องมือการขาย (Sales Actions)</h2>
        
        {/* Create Quotation */}
        <button className="w-full flex items-center gap-3 p-4 bg-white border-2 border-indigo-100 hover:border-indigo-600 rounded-xl group transition-colors text-left">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">สร้างใบเสนอราคา</p>
            <p className="text-xs text-slate-500">ออกเอกสารส่งให้ลูกค้าดู</p>
          </div>
        </button>

        {/* Generate Booking Link (The Rule Enforcement) */}
        <button className="w-full flex items-center gap-3 p-4 bg-white border-2 border-emerald-100 hover:border-emerald-600 rounded-xl group transition-colors text-left">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <LinkIcon size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">สร้างลิงก์ชำระเงิน</p>
            <p className="text-xs text-slate-500">โยนไปโดเมน Booking</p>
          </div>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Links ที่เกี่ยวข้อง</h3>
          <a href="/sale/tours" className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
            <Search size={16} /> ไปหน้าค้นหาทัวร์ (เช็คที่นั่ง)
          </a>
        </div>
      </div>
      
    </div>
  );
}
