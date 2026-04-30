import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function VipPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Jongtour VIP</h1>
      
      <div className="bg-[#1a2b4c] rounded-2xl p-8 text-white mb-8 shadow-lg text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left flex items-center gap-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8c5a24] border-4 border-[#e8a365] shadow-[0_0_20px_rgba(205,127,50,0.5)]">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Bronze Member</h2>
              <p className="text-blue-200">ยินดีต้อนรับสู่โปรแกรมลูกค้า VIP ของเรา</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 bg-white/10 p-6 rounded-xl border border-white/20 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-100">ยอดใช้จ่ายสะสมปัจจุบัน: ฿0</span>
              <span className="text-gray-300">Silver (฿50,000)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-300 to-gray-100 h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-blue-200">สะสมยอดอีก ฿50,000 เพื่อเลื่อนระดับเป็น <strong className="text-white">Silver</strong></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="border border-gray-100 bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 font-bold">0</div>
          <h4 className="font-bold text-gray-800">จำนวนทริป</h4>
        </div>
        <div className="border border-gray-100 bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 font-bold">฿0</div>
          <h4 className="font-bold text-gray-800">ยอดใช้จ่ายสะสม</h4>
        </div>
        <div className="border border-gray-100 bg-white p-6 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 font-bold">0</div>
          <h4 className="font-bold text-gray-800">คะแนนสะสม</h4>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">ระดับสมาชิกและสิทธิพิเศษ (VIP Tiers)</h3>
      
      <div className="space-y-4">
        {/* Bronze */}
        <div className="bg-white border-2 border-[#cd7f32] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#cd7f32] text-white px-3 py-1 rounded-bl-lg text-xs font-bold">ระดับปัจจุบันของคุณ</div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8c5a24] flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold border-2 border-white">
            Bronze
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Bronze Member</h4>
            <p className="text-sm text-gray-600 font-medium mb-2">ยอดใช้จ่ายสะสม: ฿0 - ฿49,999</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>รับคะแนนสะสม 1 Coin ทุกการใช้จ่าย 100 บาท</li>
              <li>รับข่าวสารโปรโมชั่นก่อนใคร</li>
            </ul>
          </div>
        </div>

        {/* Silver */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold border-2 border-white">
            Silver
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Silver Member</h4>
            <p className="text-sm text-gray-600 font-medium mb-2">ยอดใช้จ่ายสะสม: ฿50,000 - ฿149,999</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>รับคะแนนสะสม 1.5 Coins ทุกการใช้จ่าย 100 บาท</li>
              <li>ส่วนลดพิเศษ 3% สำหรับทัวร์ที่ร่วมรายการ</li>
              <li>กระเป๋าเดินทางสุดพรีเมียมจาก Jongtour</li>
            </ul>
          </div>
        </div>

        {/* Gold */}
        <div className="bg-white border border-yellow-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-md text-white font-bold border-2 border-white">
            Gold
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1">Gold Member</h4>
            <p className="text-sm text-gray-600 font-medium mb-2">ยอดใช้จ่ายสะสม: ฿150,000 - ฿499,999</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>รับคะแนนสะสม 2 Coins ทุกการใช้จ่าย 100 บาท</li>
              <li>ส่วนลดพิเศษ 5% สำหรับทัวร์ที่ร่วมรายการ</li>
              <li>บริการผู้ช่วยส่วนตัว (Personal Assistant) ตลอดการเดินทาง</li>
              <li>อัปเกรดห้องพักโรงแรม (ขึ้นอยู่กับความพร้อมให้บริการ)</li>
            </ul>
          </div>
        </div>

        {/* Platinum */}
        <div className="bg-gradient-to-r from-gray-900 to-[#1a2b4c] border-2 border-blue-400 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 relative shadow-xl transform hover:scale-[1.01] transition-transform">
          <div className="absolute -right-6 -top-6 text-blue-400/20">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-indigo-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(96,165,250,0.5)] text-white font-extrabold border-2 border-white z-10 text-xs text-center leading-tight">
            PLATINUM
          </div>
          <div className="flex-1 z-10">
            <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              Platinum Elite
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </h4>
            <p className="text-sm text-blue-200 font-medium mb-3">ยอดใช้จ่ายสะสม: ฿500,000 ขึ้นไป</p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>รับคะแนนสะสม 3 Coins ทุกการใช้จ่าย 100 บาท</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>ส่วนลดพิเศษ 10% สำหรับทุกทัวร์ทั่วโลก</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>บริการรถรับ-ส่งสนามบินฟรี (Limousine Transfer)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>สิทธิ์เข้าใช้ Lounge พิเศษที่สนามบินทั่วโลก</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
