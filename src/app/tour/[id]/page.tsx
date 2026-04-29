import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { MapPin, Calendar, Clock, Plane, CheckCircle2, Star, Share2, Heart, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function TourDetailsPage({ params }: { params: { id: string } }) {
  // ดึงข้อมูลทัวร์จาก Database
  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      departures: true
    }
  });

  if (!tour) {
    notFound(); // 404 page
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero Image Gallery */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-slate-900 relative">
        <img 
          src={tour.imageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"} 
          alt={tour.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="text-white max-w-3xl">
              <div className="flex gap-2 mb-3">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{tour.destination}</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">รหัสทัวร์: {tour.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{tour.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" /> {tour.durationDays} วัน {tour.durationDays - 1} คืน</span>
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-orange-400" /> บินตรงการบินไทย</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/20">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/20">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Tour Details */}
        <div className="flex-1 space-y-8">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">รายละเอียดโปรแกรม (Overview)</h2>
            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {tour.description || "แพ็กเกจทัวร์ระดับพรีเมียม สัมผัสประสบการณ์การเดินทางที่เหนือกว่า พร้อมไกด์ผู้เชี่ยวชาญดูแลตลอดการเดินทาง"}
            </p>
            
            <h3 className="text-lg font-bold text-gray-800 mb-4">จุดเด่นของแพ็กเกจนี้</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex gap-3 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> พักโรงแรมระดับ 4 ดาวทุกคืน
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> รวมค่าเข้าชมสถานที่ทั้งหมดแล้ว
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> เมนูพิเศษ บุฟเฟต์พรีเมียม
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> รถโค้ชปรับอากาศ VIP ตลอดการเดินทาง
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">แผนการเดินทาง (Itinerary)</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((day) => (
                <div key={day} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                      วันที่ {day}
                    </div>
                    {day !== 3 && <div className="w-0.5 h-full bg-orange-100 mt-2"></div>}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">สนามบินสุวรรณภูมิ - {tour.destination}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      รายละเอียดการเดินทางในวันที่ {day} สำหรับแพ็กเกจนี้ ลูกค้าจะได้เพลิดเพลินกับสถานที่ท่องเที่ยวที่คัดสรรมาเป็นอย่างดี พร้อมรับประทานอาหารพื้นเมืองสุดอร่อย
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Panel */}
        <aside className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
            
            <div className="flex justify-between items-start mb-6 border-b pb-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">ราคาเริ่มต้น (ต่อท่าน)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-orange-500">{tour.price.toLocaleString()}</span>
                  <span className="text-gray-500 font-bold">฿</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-800 text-sm">4.9</span>
                </div>
                <span className="text-xs text-gray-400 underline">128 รีวิว</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-gray-800 text-sm">เลือกรอบวันเดินทาง</h3>
              
              {tour.departures.length > 0 ? (
                <div className="space-y-3">
                  {tour.departures.map(dep => (
                    <label key={dep.id} className="block cursor-pointer">
                      <input type="radio" name="departure" className="peer sr-only" defaultChecked />
                      <div className="border-2 border-gray-100 rounded-xl p-4 hover:border-orange-200 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            {new Date(dep.startDate).toLocaleDateString('th-TH')} - {new Date(dep.endDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded">เหลือ {dep.availableSeats} ที่นั่ง</span>
                          <span className="text-gray-500 font-medium">{dep.price.toLocaleString()} ฿</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm">
                  ไม่มีรอบเดินทางในขณะนี้
                </div>
              )}
            </div>

            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p>รับประกันราคาดีที่สุด จองวันนี้เพื่อล็อคที่นั่งและราคาโปรโมชั่น</p>
            </div>

            <Link href={`/checkout/${tour.id}`} className="block w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
              จองทัวร์นี้ (Book Now)
            </Link>
            
            <p className="text-center text-xs text-gray-400 mt-4">ไม่มีการเก็บค่าธรรมเนียมแอบแฝง</p>

          </div>
        </aside>

      </div>
    </main>
  );
}
