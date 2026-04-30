import Link from "next/link";
import { Plus } from "lucide-react";
import AiSearchBar from "@/components/AiSearchBar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {
    // Fallback safely if auth throws when not logged in
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      
      {/* Homepage Simple Header */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto right-0">
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
          <span><span className="text-orange-500">Jong</span>tour AI</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">v2.1</span>
        </div>
        <div className="flex gap-4 items-center">
          <AuthButtons serverUser={user} />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-8 mt-10">

        {/* AI Search Bar */}
        {/* AI Search Bar */}
        <AiSearchBar />

        {/* Shortcuts */}
        <div className="flex flex-wrap justify-center gap-4 pt-6 w-full max-w-3xl">
          <ShortcutButton icon="🌸" label="ทัวร์ญี่ปุ่น" href="/destinations/asia/japan" />
          <ShortcutButton icon="🐼" label="ทัวร์จีน" href="/destinations/asia/china" />
          <ShortcutButton icon="🏔️" label="ทัวร์ยุโรป" href="/destinations/europe" />
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
