import Link from 'next/link';
import { MapPin, Plane, ShieldCheck, Star, Users, ArrowRight, ChevronRight, Globe2, HeartHandshake, PhoneCall } from 'lucide-react';

export default function InfoHomePage() {
  return (
    <div className="w-full bg-slate-50">
      {/* Hero Section */}
      <section className="relative w-full h-[700px] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-90 scale-105 transform origin-center animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/60 to-slate-50"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            แพลตฟอร์มท่องเที่ยวอันดับ 1 ในใจคนไทย
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-xl leading-tight">
            โลกกว้างใหญ่ <br className="hidden md:block"/> รอให้คุณไปสัมผัส
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl drop-shadow-lg font-medium">
            Jongtour ผู้เชี่ยวชาญด้านการเดินทางที่พร้อมมอบประสบการณ์ระดับพรีเมียม บินหรู พักสบาย พร้อมไกด์มืออาชีพดูแลตลอดทริป
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="https://tour.jongtour.com" className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-1">
              เริ่มค้นหาทัวร์
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link href="/promotions" className="group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1">
              ดูโปรโมชั่น
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">จองง่าย ปลอดภัย 100%</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                ระบบชำระเงินมาตรฐานสากล มีใบอนุญาตประกอบธุรกิจนำเที่ยวถูกต้องตามกฎหมาย มั่นใจได้ทุกการเดินทาง
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Globe2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">ครอบคลุมทุกเส้นทาง</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                ร่วมมือกับ Partner และ Wholesale ชั้นนำ นำเสนอโปรแกรมทัวร์มากกว่า 1,000 เส้นทางทั่วโลก
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">ดูแลดุจครอบครัว</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                ทีมซัพพอร์ตและหัวหน้าทัวร์มืออาชีพคอยดูแลอย่างใกล้ชิดตลอด 24 ชั่วโมง ตั้งแต่เริ่มจองจนจบทริป
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">จุดหมายยอดฮิต</h2>
              <p className="text-slate-500 text-lg font-medium">เลือกประเทศที่คุณอยากไป แล้วปล่อยให้เป็นหน้าที่ของเรา</p>
            </div>
            <Link href="/destination-guide" className="group inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-full transition-colors">
              ดูคู่มือท่องเที่ยวทั้งหมด <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dest 1 */}
            <a href="https://tour.jongtour.com?country=japan" className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop" alt="Japan" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-black text-white">ญี่ปุ่น</h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-indigo-200 font-medium">โตเกียว • โอซาก้า • ฟูจิ</p>
              </div>
            </a>
            
            {/* Dest 2 */}
            <a href="https://tour.jongtour.com?country=europe" className="group relative h-96 lg:col-span-2 rounded-3xl overflow-hidden cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop" alt="Europe" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-black text-white">ยุโรป</h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-indigo-200 font-medium">สวิส • อิตาลี • ฝรั่งเศส • สเปน</p>
              </div>
            </a>

            {/* Dest 3 */}
            <a href="https://tour.jongtour.com?country=china" className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg">
              <img src="https://images.unsplash.com/photo-1508804185872-d7bad800d43e?q=80&w=1000&auto=format&fit=crop" alt="China" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-black text-white">จีน</h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-indigo-200 font-medium">เซี่ยงไฮ้ • ปักกิ่ง • จางเจียเจี้ย</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Plane className="w-20 h-20 text-indigo-400 mx-auto mb-8 drop-shadow-lg" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">พร้อมออกเดินทางหรือยัง?</h2>
          <p className="text-slate-300 text-xl mb-12 font-medium max-w-2xl mx-auto">
            ให้เราดูแลทริปในฝันของคุณ ค้นหาแพ็กเกจทัวร์ที่ใช่ ในราคาที่คุ้มค่าที่สุด พร้อมบริการลูกค้าสัมพันธ์ที่พร้อมช่วยเหลือเสมอ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://tour.jongtour.com" className="group bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
              ค้นหาทัวร์ทั้งหมด <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link href="/contact" className="group bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-lg font-bold px-10 py-4 rounded-full transition-all flex items-center justify-center gap-2">
              <PhoneCall className="w-5 h-5" /> ติดต่อทีมงาน
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
