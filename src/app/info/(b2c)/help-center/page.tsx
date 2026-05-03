import { Button } from '@/components/ui/Button';
import { Mail, MessageCircle, Phone, Search } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-blue-600 pt-20 pb-28 px-4 text-center">
        <h1 className="text-4xl font-black text-white tracking-tight mb-4">ศูนย์ช่วยเหลือ (Help Center)</h1>
        <p className="text-blue-100 text-lg mb-8">มีปัญหาหรือข้อสงสัย ทีมงาน Jongtour พร้อมดูแลคุณตลอด 24 ชม.</p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="พิมพ์คำถามที่ต้องการค้นหา (เช่น วิธีการจอง, วีซ่า, ยกเลิกทัวร์)..." 
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30"
          />
        </div>
      </div>

      {/* Quick Contacts */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
            <p className="text-slate-500 mb-6 text-sm">คุยกับแอดมินผ่าน LINE Official ตอบไวภายใน 5 นาที</p>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">@Jongtour</Button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Call Center</h3>
            <p className="text-slate-500 mb-6 text-sm">โทรสายด่วนเพื่อสอบถามเรื่องเร่งด่วน เช่น เที่ยวบิน</p>
            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">02-XXX-XXXX</Button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
            <p className="text-slate-500 mb-6 text-sm">ส่งเอกสาร หรือขอใบเสนอราคาแบบกรุ๊ปเหมา (Incentive)</p>
            <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">support@jongtour.com</Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-slate-600 mb-4">ยังไม่พบคำตอบที่คุณตามหาใช่ไหม?</p>
        <Link href="/faq">
          <Button variant="ghost" className="text-blue-600 font-semibold underline underline-offset-4">อ่านคำถามที่พบบ่อย (FAQ)</Button>
        </Link>
      </div>
    </div>
  );
}
