import Link from "next/link";
import { ChevronRight, ShieldCheck, MapPin, Calendar, Users } from "lucide-react";

export default function CheckoutPage({ params }: { params: { tourId: string } }) {
  // Mockup Data
  const tour = {
    title: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า (พิเศษ บุฟเฟต์ขาปูยักษ์)",
    duration: "5 วัน 4 คืน",
    date: "10 - 14 ธันวาคม 2567",
    pricePerPax: 35900,
    pax: 2,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
  };

  const totalPrice = tour.pricePerPax * tour.pax;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2 text-orange-500">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">1</div>
              <span>ข้อมูลผู้เดินทาง</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">2</div>
              <span>ชำระเงิน</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Forms */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลผู้ติดต่อหลัก (Lead Traveler)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อจริง (ภาษาอังกฤษตามพาสปอร์ต) *</label>
                  <input type="text" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="First Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (ภาษาอังกฤษตามพาสปอร์ต) *</label>
                  <input type="text" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Last Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์มือถือ *</label>
                  <input type="tel" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="08X-XXX-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล (สำหรับรับเอกสาร) *</label>
                  <input type="email" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="email@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINE ID (ตัวเลือก - เพื่อความสะดวกในการติดต่อ)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="LINE ID" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ผู้ร่วมเดินทาง (Traveler 2)</h2>
                <span className="text-sm text-gray-500">สามารถส่งข้อมูลพาสปอร์ตภายหลังได้</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อจริง (ภาษาอังกฤษ)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500" placeholder="First Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (ภาษาอังกฤษ)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500" placeholder="Last Name" />
                </div>
              </div>
            </div>

          </div>

          {/* Right: Order Summary */}
          <aside className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">สรุปการทำรายการ (Order Summary)</h2>
              
              <div className="flex gap-4 mb-6">
                <img src={tour.image} alt={tour.title} className="w-24 h-24 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">{tour.title}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {tour.date}</p>
                    <p className="flex items-center gap-1"><Users className="w-3 h-3" /> ผู้เดินทาง: {tour.pax} ท่าน</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6 border-b pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>ผู้ใหญ่ (ราคาต่อท่าน)</span>
                  <span>{tour.pricePerPax.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>จำนวน</span>
                  <span>x {tour.pax}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-gray-800">ยอดชำระทั้งหมด</span>
                <span className="text-3xl font-bold text-orange-500">{totalPrice.toLocaleString()} ฿</span>
              </div>

              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>การชำระเงินของคุณปลอดภัย 100% ดำเนินการผ่านระบบของบริษัท จองทัวร์ เอไอ จำกัด โดยตรง</p>
              </div>

              <Link href={`/payment/BK-240404`} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex justify-center items-center">
                ยืนยันและดำเนินการชำระเงิน
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
