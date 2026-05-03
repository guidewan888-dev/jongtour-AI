import { Button } from '@/components/ui/Button';
import { Target, Heart, Award, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">เกี่ยวกับ Jongtour</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          เราคือบริษัทเทคโนโลยีด้านการท่องเที่ยว (Travel Tech) ที่มุ่งมั่นยกระดับประสบการณ์การจองทัวร์ต่างประเทศ
          ให้มีความทันสมัย ปลอดภัย และตอบโจทย์นักเดินทางยุคใหม่มากที่สุด
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" 
            alt="Jongtour Team" 
            className="rounded-3xl shadow-2xl"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">จุดเริ่มต้นของเรา</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Jongtour ก่อตั้งขึ้นด้วยความเชื่อที่ว่า "การเดินทางคือการเรียนรู้ที่ดีที่สุด" แต่ปัญหาที่นักเดินทางมักพบเจอคือ
            กระบวนการจองทัวร์ที่ซับซ้อน ข้อมูลไม่โปร่งใส และการบริการที่ไม่สม่ำเสมอ
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            เราจึงได้รวบรวมทีมงานผู้เชี่ยวชาญทั้งด้านเทคโนโลยี (Tech) และด้านอุตสาหกรรมท่องเที่ยว (Tourism) 
            เพื่อพัฒนาระบบ Enterprise OTA ที่เชื่อมต่อข้อมูลจากคู่ค้าแบบ Real-time ทำให้ลูกค้าได้เห็นราคาจริง 
            ที่นั่งจริง และสามารถจองได้ตลอด 24 ชั่วโมง โดยไม่ต้องรอแอดมินตอบ
          </p>
          <div className="flex items-center gap-3 text-emerald-600 font-semibold bg-emerald-50 w-fit px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span>ใบอนุญาตประกอบธุรกิจนำเที่ยวเลขที่ 11/XXXXX</span>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">ค่านิยมองค์กร (Core Values)</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Customer First</h3>
            <p className="text-slate-600">เรายึดความต้องการของลูกค้าเป็นที่ตั้ง ทุกฟีเจอร์ในระบบถูกออกแบบมาเพื่อลดความยุ่งยากและเพิ่มความสะดวกสบายให้ลูกค้าสูงสุด</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Integrity</h3>
            <p className="text-slate-600">ซื่อสัตย์และโปร่งใส รูปภาพโปรแกรมทัวร์และราคาทั้งหมดบนเว็บไซต์คือราคาจริงที่รวมทุกอย่างแล้ว ไม่มีการหมกเม็ดค่าใช้จ่ายแอบแฝง</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Excellence</h3>
            <p className="text-slate-600">มุ่งสู่ความเป็นเลิศ เราคัดกรองเฉพาะบริษัท Wholesale (โฮลเซลล์) ทัวร์ที่มีมาตรฐานระดับสากลเท่านั้นมาอยู่ในแพลตฟอร์มของเรา</p>
          </div>
        </div>
      </div>
      
      {/* Contact CTA */}
      <div className="bg-slate-900 rounded-3xl p-10 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">อยากเป็นพาร์ทเนอร์กับเรา?</h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
          เรายินดีต้อนรับบริษัททัวร์และตัวแทนจำหน่าย (Agent) ที่มีวิสัยทัศน์เดียวกัน มาร่วมเติบโตไปพร้อมกับแพลตฟอร์ม Jongtour
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700">ติดต่อฝ่าย B2B</Button>
          <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">ร่วมงานกับเรา (Careers)</Button>
        </div>
      </div>
    </div>
  );
}
