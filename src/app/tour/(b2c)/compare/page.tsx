import { Plus, X } from 'lucide-react';

export default function CompareToursPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">เปรียบเทียบโปรแกรมทัวร์</h1>
          <p className="text-slate-500 mt-2">เลือกทัวร์ที่สนใจเพื่อเปรียบเทียบสเปค ราคา และไฮไลท์ (สูงสุด 3 รายการ)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-6 border-b border-r border-slate-200 w-64 bg-slate-50 align-bottom">
                  <span className="font-bold text-slate-700">คุณสมบัติ</span>
                </th>
                
                {/* Tour 1 */}
                <th className="p-6 border-b border-r border-slate-200 w-1/3 relative align-top">
                  <button className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500"><X size={16} /></button>
                  <div className="aspect-video bg-slate-200 rounded-lg mb-4"></div>
                  <h3 className="font-bold text-slate-800 line-clamp-2">ฮอกไกโด ซัปโปโร เล่นสกี 6D4N</h3>
                  <p className="text-2xl font-black text-orange-600 mt-2">฿45,900</p>
                </th>

                {/* Tour 2 */}
                <th className="p-6 border-b border-r border-slate-200 w-1/3 relative align-top">
                  <button className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500"><X size={16} /></button>
                  <div className="aspect-video bg-slate-200 rounded-lg mb-4"></div>
                  <h3 className="font-bold text-slate-800 line-clamp-2">ฮอกไกโด นั่งเรือตัดน้ำแข็ง 5D3N</h3>
                  <p className="text-2xl font-black text-orange-600 mt-2">฿39,900</p>
                </th>

                {/* Add Tour Button */}
                <th className="p-6 border-b border-slate-200 w-1/3 align-middle text-center bg-slate-50">
                  <button className="inline-flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <Plus size={32} className="mb-2" />
                    <span className="font-semibold text-sm">เพิ่มทัวร์</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="hover:bg-slate-50">
                <td className="p-4 border-b border-r border-slate-200 font-semibold text-slate-700 bg-slate-50">ระยะเวลา</td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">6 วัน 4 คืน</td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">5 วัน 3 คืน</td>
                <td className="p-4 border-b border-slate-200 text-slate-600"></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 border-b border-r border-slate-200 font-semibold text-slate-700 bg-slate-50">สายการบิน</td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">Thai Airways (TG)</td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">Air Asia X (XJ)</td>
                <td className="p-4 border-b border-slate-200 text-slate-600"></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 border-b border-r border-slate-200 font-semibold text-slate-700 bg-slate-50">ไฮไลท์</td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>ลานสกีซัปโปโร</li>
                    <li>หมู่บ้านช็อกโกแลต</li>
                    <li>แช่ออนเซ็น 2 คืน</li>
                  </ul>
                </td>
                <td className="p-4 border-b border-r border-slate-200 text-slate-600">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>เรือตัดน้ำแข็ง</li>
                    <li>สวนสัตว์อาซาฮิยาม่า</li>
                    <li>แช่ออนเซ็น 1 คืน</li>
                  </ul>
                </td>
                <td className="p-4 border-b border-slate-200 text-slate-600"></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 border-b border-r border-slate-200 bg-slate-50"></td>
                <td className="p-4 border-b border-r border-slate-200 text-center">
                  <a href="https://booking.jongtour.com" className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors w-full">จองโปรแกรมนี้</a>
                </td>
                <td className="p-4 border-b border-r border-slate-200 text-center">
                  <a href="https://booking.jongtour.com" className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors w-full">จองโปรแกรมนี้</a>
                </td>
                <td className="p-4 border-b border-slate-200"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
