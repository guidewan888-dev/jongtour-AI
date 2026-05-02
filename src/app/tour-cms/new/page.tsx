import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createManualTour } from "../actions";

export default function NewTourCmsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/tour-cms"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">เพิ่มแพ็กเกจทัวร์ใหม่</h2>
          <p className="text-sm text-slate-500">สร้างข้อมูลทัวร์ด้วยตัวเอง (Manual Tour)</p>
        </div>
      </div>

      <form action={createManualTour} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">ข้อมูลพื้นฐาน (Basic Information)</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              ชื่อแพ็กเกจทัวร์ (Tour Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm"
              placeholder="เช่น ทัวร์ญี่ปุ่น โตเกียว ฟูจิ 5 วัน 3 คืน"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">
                จุดหมายปลายทาง (Destination) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                required
                className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm"
                placeholder="เช่น Japan, Tokyo, Sapporo"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="durationDays" className="block text-sm font-medium text-slate-700 mb-1">
                จำนวนวัน (Duration Days) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="durationDays"
                  name="durationDays"
                  required
                  min={1}
                  className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 pl-4 pr-12 py-2 sm:text-sm"
                  placeholder="5"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">วัน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                ราคาเริ่มต้น (Starting Price) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">฿</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min={0}
                  className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 pl-8 pr-4 py-2 sm:text-sm"
                  placeholder="39900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-1">
                ลิงก์รูปภาพ (Image URL)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              รายละเอียดแบบย่อ (Description)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="block w-full rounded-md border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 sm:text-sm"
              placeholder="รายละเอียดจุดเด่นของทัวร์นี้..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <Link
            href="/tour-cms"
            className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4" />
            บันทึกข้อมูลทัวร์
          </button>
        </div>
      </form>
    </div>
  );
}
