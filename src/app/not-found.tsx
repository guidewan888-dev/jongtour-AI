import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 mb-6">ขออภัย ไม่พบหน้าที่คุณต้องการ (Page Not Found)</h2>
      <p className="text-slate-500 max-w-md mb-8">
        หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกลบไปแล้ว หรือเปลี่ยน URL ไปเป็นที่อื่น
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors"
        >
          กลับสู่หน้าหลัก (Home)
        </Link>
        <Link 
          href="/info/contact" 
          className="bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-full hover:bg-slate-200 transition-colors"
        >
          ติดต่อเรา (Contact Us)
        </Link>
      </div>
    </div>
  );
}
