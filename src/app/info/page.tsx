import { Compass, ShieldCheck, HeadphonesIcon, Globe2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-static';

export default function InfoHomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-sm mb-8 backdrop-blur-sm">
            <Globe2 size={16} /> อันดับ 1 แพลตฟอร์มทัวร์ออนไลน์ที่ไว้ใจได้
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
            เปิดประสบการณ์เที่ยวโลกกว้าง<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              ง่าย ครบ จบในที่เดียว
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-light">
            ไม่ว่าจะทัวร์เอเชีย ยุโรป หรือจัดกรุ๊ปเหมา Jongtour คัดสรรแพ็กเกจที่ดีที่สุดจากพาร์ทเนอร์ชั้นนำทั่วประเทศ
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://tour.jongtour.com" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Compass size={20} /> เริ่มค้นหาทัวร์เลย
            </a>
            <a 
              href="https://sale.jongtour.com" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              ติดต่อพนักงานขาย <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative -mt-16 rounded-t-[3rem] z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">ทำไมต้องเลือก Jongtour?</h2>
            <p className="text-slate-500">เราออกแบบระบบมาเพื่อให้การจองทัวร์เป็นเรื่องง่าย ปลอดภัย และโปร่งใสที่สุด</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300 shadow-sm">
                <Compass className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Search อัจฉริยะ</h3>
              <p className="text-slate-600 leading-relaxed">
                ค้นหาทัวร์ด้วยเทคโนโลยี AI แค่พิมพ์สิ่งที่คุณต้องการ ระบบจะแนะนำแพ็กเกจที่ตรงใจที่สุดจากฐานข้อมูลจริง
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-600 transition-all duration-300 shadow-sm">
                <ShieldCheck className="w-10 h-10 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">จองปลอดภัย 100%</h3>
              <p className="text-slate-600 leading-relaxed">
                เชื่อมต่อระบบ Booking แบบ Real-time ล็อคที่นั่งอัตโนมัติ หมดปัญหาจองแล้วไม่ได้ไป พร้อมระบบชำระเงินมาตรฐานสากล
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 transition-all duration-300 shadow-sm">
                <HeadphonesIcon className="w-10 h-10 text-rose-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">ดูแลตลอดการเดินทาง</h3>
              <p className="text-slate-600 leading-relaxed">
                ทีมงาน Customer Support และ Sale พร้อมให้คำปรึกษาและแก้ไขปัญหาตลอด 24 ชม. ผ่านช่องทางที่สะดวกรวดเร็ว
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles (SEO Value) */}
      <section className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">บทความท่องเที่ยวล่าสุด</h2>
              <p className="text-slate-500">แรงบันดาลใจและคู่มือเตรียมตัวก่อนออกเดินทาง</p>
            </div>
            <a href="/blog" className="hidden sm:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800">
              ดูทั้งหมด <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <a key={i} href={`/blog/japan-autumn-guide-${i}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[4/3] bg-slate-200 overflow-hidden">
                   {/* Fallback pattern for mockup */}
                   <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">คู่มือท่องเที่ยว</span>
                    <span className="text-xs font-medium text-slate-500 py-1">Oct 12, 2026</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    5 จุดชมใบไม้เปลี่ยนสีที่เกียวโต ถ่ายรูปสวยแบบไม่ต้องใช้ฟิลเตอร์
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    เข้าสู่ฤดูใบไม้ร่วง ประเทศญี่ปุ่นถือเป็นจุดหมายยอดฮิตของคนไทย เราขอแนะนำ 5 สถานที่ลับในเกียวโตที่สวยงามและคนไม่พลุกพล่าน
                  </p>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <a href="/blog" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800">
              ดูบทความทั้งหมด <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">พร้อมออกเดินทางไปกับเราหรือยัง?</h2>
          <p className="text-indigo-100 text-lg mb-10">
            ค้นหาแพ็กเกจทัวร์กว่า 5,000 โปรแกรม จากหลากหลายประเทศทั่วโลกได้เลยที่ Tour Marketplace ของเรา
          </p>
          <a 
            href="https://tour.jongtour.com" 
            className="inline-flex px-10 py-4 rounded-full text-lg font-bold text-indigo-600 bg-white hover:bg-slate-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all items-center gap-2"
          >
            ไปที่ Tour Marketplace <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
