import { Map, Compass } from "lucide-react";
import Link from "next/link";

export default function RegionComingSoonPage({ params }: { params: { slug: string[] } }) {
  const regionName = params.slug?.[params.slug.length - 1]?.replace(/-/g, ' ') || 'Region';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Map className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-black text-trust-900 mb-4 capitalize">Tours in {regionName}</h1>
        <p className="text-trust-600 mb-8 leading-relaxed">
          แพ็กเกจทัวร์สำหรับภูมิภาคนี้กำลังอยู่ในขั้นตอนการอัปเดตข้อมูลจากพาร์ทเนอร์ 
          โปรดกลับมาตรวจสอบใหม่อีกครั้งในภายหลังครับ
        </p>
        <Link href="/region/europe" className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30">
          <Compass className="w-5 h-5 mr-2" />
          ดูทัวร์ยุโรปทั้งหมด
        </Link>
      </div>
    </div>
  );
}
