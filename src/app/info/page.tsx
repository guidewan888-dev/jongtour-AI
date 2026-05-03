import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MapPin, Plane, ShieldCheck, Star, Users } from 'lucide-react';

export default function InfoHomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] bg-slate-900 flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            โลกกว้างใหญ่ รอให้คุณไปสัมผัส
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl drop-shadow">
            จองทัวร์ต่างประเทศกับ Jongtour แพลตฟอร์มท่องเที่ยวที่คัดสรรโปรแกรมคุณภาพ 
            บินหรู พักสบาย พร้อมไกด์มืออาชีพดูแลตลอดการเดินทาง
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://tour.jongtour.com">
              <Button size="lg" className="text-lg px-8 rounded-full shadow-xl shadow-blue-900/20">
                เริ่มค้นหาทัวร์
              </Button>
            </a>
            <Link href="/promotions">
              <Button variant="outline" size="lg" className="text-lg px-8 rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                ดูโปรโมชั่น
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">ทำไมต้องเลือก Jongtour</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">เราคือผู้เชี่ยวชาญด้านการเดินทางที่พร้อมมอบประสบการณ์ที่ดีที่สุดให้คุณ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">จองง่าย ปลอดภัย 100%</h3>
              <p className="text-slate-600 leading-relaxed">ระบบการชำระเงินมาตรฐานสากล พร้อมใบอนุญาตประกอบธุรกิจนำเที่ยวถูกต้องตามกฎหมาย</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ทัวร์คุณภาพระดับพรีเมียม</h3>
              <p className="text-slate-600 leading-relaxed">คัดสรรเฉพาะโปรแกรมทัวร์ที่ได้มาตรฐาน โรงแรมดี อาหารอร่อย ไม่มีการบังคับซื้อออปชั่นเสริม</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ทีมงานดูแลตลอด 24 ชม.</h3>
              <p className="text-slate-600 leading-relaxed">ตั้งแต่เริ่มจองจนถึงเดินทางกลับ เรามีทีมซัพพอร์ตและหัวหน้าทัวร์คอยดูแลอย่างใกล้ชิด</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">จุดหมายปลายทางยอดฮิต</h2>
              <p className="text-slate-500">เลือกประเทศที่คุณอยากไป แล้วปล่อยให้เป็นหน้าที่ของเรา</p>
            </div>
            <Link href="/destination-guide" className="hidden sm:inline-flex text-blue-600 font-semibold hover:text-blue-700 items-center gap-1">
              ดูทั้งหมด <MapPin className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dest 1 */}
            <a href="https://tour.jongtour.com?country=japan" className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop" alt="Japan" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">ญี่ปุ่น (Japan)</h3>
                <p className="text-slate-300 text-sm">โตเกียว • โอซาก้า • ฮอกไกโด</p>
              </div>
            </a>
            {/* Dest 2 */}
            <a href="https://tour.jongtour.com?country=korea" className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all">
              <img src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1000&auto=format&fit=crop" alt="Korea" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">เกาหลีใต้ (Korea)</h3>
                <p className="text-slate-300 text-sm">โซล • เชจู • ปูซาน</p>
              </div>
            </a>
            {/* Dest 3 */}
            <a href="https://tour.jongtour.com?country=europe" className="group relative h-80 sm:col-span-2 lg:col-span-2 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all">
              <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop" alt="Europe" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">ยุโรป (Europe)</h3>
                <p className="text-slate-300 text-sm">ฝรั่งเศส • สวิตเซอร์แลนด์ • อิตาลี • ออสเตรีย</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Plane className="w-16 h-16 text-white/50 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">พร้อมออกเดินทางหรือยัง?</h2>
          <p className="text-blue-100 text-lg mb-10">ให้เราดูแลทริปในฝันของคุณ ค้นหาแพ็กเกจทัวร์ที่ใช่ ในราคาที่คุ้มค่าที่สุด</p>
          <a href="https://tour.jongtour.com">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-10 rounded-full shadow-xl">
              ค้นหาทัวร์ทั้งหมด
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
