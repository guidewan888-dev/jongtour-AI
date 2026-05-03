import { Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-4">ระบบกำลังอยู่ระหว่างการพัฒนา</h1>
      <p className="text-slate-500 max-w-md">หน้านี้กำลังถูกสร้างขึ้นใน Phase ถัดไป กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
    </div>
  );
}
