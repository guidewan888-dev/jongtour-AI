import Link from "next/link";
import { Plus } from "lucide-react";
import AiSearchBar from "@/components/AiSearchBar";


export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      
      {/* Homepage Simple Header */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto right-0">
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
          <span className="text-orange-500">Jong</span>tour AI
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="hidden md:flex px-4 py-2 text-gray-600 hover:text-orange-500 font-medium items-center">เข้าสู่ระบบ</Link>
          <Link href="/login" className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors shadow-sm flex items-center">สมัครสมาชิก</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-8 mt-10">

        {/* AI Search Bar */}
        {/* AI Search Bar */}
        <AiSearchBar />

        {/* Shortcuts */}
        <div className="flex flex-wrap justify-center gap-4 pt-6 w-full max-w-3xl">
          <ShortcutButton icon="🌸" label="ทัวร์ญี่ปุ่น" href="/search/asia/japan" />
          <ShortcutButton icon="🏔️" label="ยุโรป" href="/search/europe" />
          <ShortcutButton icon="🔥" label="โปรไฟไหม้" href="/search/promotions" />
          <ShortcutButton icon="✨" label="AI ออกแบบทริป" href="/ai-planner" />
          <AddShortcutButton />
        </div>
      </div>
    </main>
  );
}

function ShortcutButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 bg-white hover:bg-orange-50/50 rounded-2xl w-24 h-24 md:w-28 md:h-28 transition-all border-2 border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md group">
      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-xs md:text-sm text-gray-700 font-bold text-center group-hover:text-orange-600">
        {label}
      </span>
    </Link>
  );
}

function AddShortcutButton() {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 rounded-2xl w-24 h-24 md:w-28 md:h-28 transition-all border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md group">
      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-2 transition-colors border border-gray-200">
        <Plus className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
      </div>
      <span className="text-xs md:text-sm text-gray-700 font-bold text-center">
        เพิ่มทางลัด
      </span>
    </button>
  );
}
