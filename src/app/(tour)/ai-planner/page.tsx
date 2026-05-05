import { Sparkles, Compass } from "lucide-react";
import Link from "next/link";

export default function AIPlannerComingSoonPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-trust-900 mb-4">AI Planner: Coming Soon</h1>
        <p className="text-trust-600 mb-8 leading-relaxed">
          ระบบวิเคราะห์รูปภาพและไฟล์ PDF เพื่อจัดทริปด้วย AI กำลังอยู่ในระหว่างการพัฒนา 
          เตรียมพบกับประสบการณ์ใหม่ในการค้นหาทัวร์เร็วๆ นี้!
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-8 py-3.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30">
          <Compass className="w-5 h-5 mr-2" />
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
