import { Users, Compass } from "lucide-react";
import Link from "next/link";

export default function PrivateGroupExamplesPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-trust-900 mb-4">ตัวอย่างกรุ๊ปเหมาส่วนตัว</h1>
        <p className="text-trust-600 mb-8 leading-relaxed">
          หน้าแสดงผลงานและตัวอย่างการจัดกรุ๊ปส่วนตัว (Private Group) กำลังอยู่ระหว่างการปรับปรุง 
          หากคุณต้องการขอใบเสนอราคา สามารถติดต่อทีมงานได้ทันทีครับ
        </p>
        <Link href="/contact?type=quotation" className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30">
          <Compass className="w-5 h-5 mr-2" />
          ขอใบเสนอราคา
        </Link>
      </div>
    </div>
  );
}
