import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">ติดต่อเรา (Contact Us)</h1>
        <p className="text-xl text-slate-600">ยินดีรับฟังทุกข้อเสนอแนะและพร้อมให้ความช่วยเหลือ</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">ข้อมูลการติดต่อบริษัท</h2>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">สำนักงานใหญ่</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  บริษัท จงทัวร์ คอร์ปอเรชั่น จำกัด<br />
                  123/45 อาคาร ABC Tower ชั้น 15 ถนนสุขุมวิท<br />
                  แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">เบอร์โทรศัพท์</h3>
                <p className="text-slate-600 text-sm">02-XXX-XXXX (จันทร์ - ศุกร์ 09:00 - 18:00 น.)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">อีเมลติดต่อ</h3>
                <p className="text-slate-600 text-sm">General: info@jongtour.com<br />Support: support@jongtour.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 w-full h-64 bg-slate-200 rounded-3xl overflow-hidden">
            {/* Embedded Google Map placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
              [Google Map Embed Area]
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">ส่งข้อความถึงเรา</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อ-นามสกุล <span className="text-rose-500">*</span></label>
              <Input placeholder="กรอกชื่อของคุณ" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">อีเมล <span className="text-rose-500">*</span></label>
              <Input type="email" placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">เบอร์โทรศัพท์</label>
              <Input type="tel" placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">เรื่องที่ต้องการติดต่อ <span className="text-rose-500">*</span></label>
              <select className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100">
                <option>สอบถามแพ็กเกจทัวร์</option>
                <option>แจ้งปัญหาการจอง</option>
                <option>ขอใบเสนอราคากรุ๊ปเหมา</option>
                <option>ติดต่อสมัครตัวแทน (Agent)</option>
                <option>อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ข้อความ <span className="text-rose-500">*</span></label>
              <textarea 
                rows={4} 
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 resize-none"
                placeholder="ระบุรายละเอียด..."
              ></textarea>
            </div>
            <Button type="button" className="w-full h-12 text-base">ส่งข้อความ</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
