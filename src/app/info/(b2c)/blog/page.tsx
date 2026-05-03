import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">บทความท่องเที่ยว (Blog)</h1>
        <p className="text-xl text-slate-600">อัปเดตเทรนด์ท่องเที่ยว รีวิวร้านอาหาร และสถานที่อันซีนทั่วโลกโดยทีมงาน Jongtour</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <span className="px-5 py-2 rounded-full bg-blue-600 text-white font-medium text-sm cursor-pointer">ทั้งหมด</span>
        <span className="px-5 py-2 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 cursor-pointer">รีวิวทัวร์</span>
        <span className="px-5 py-2 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 cursor-pointer">แนะนำของกิน</span>
        <span className="px-5 py-2 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 cursor-pointer">ข่าวสาร</span>
      </div>

      {/* Articles Grid (Simulated with Skeletons as CMS is not connected yet) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col group cursor-pointer">
            <div className="relative h-56 rounded-2xl overflow-hidden mb-4 bg-slate-100">
              <Skeleton className="absolute inset-0 w-full h-full" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">อัปเดตล่าสุด</span>
              <span className="text-xs text-slate-400">• 2 วันที่แล้ว</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Loading Article Title...
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2">
              กำลังเชื่อมต่อข้อมูลบทความจากระบบ CMS (Content Management System) เนื้อหาจะแสดงที่นี่เร็วๆ นี้
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
