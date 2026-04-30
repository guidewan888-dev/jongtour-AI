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
  const { data: { user } } = await supabase.auth.getUser();

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
      <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-6 mt-0 -translate-y-8">

        {/* AI Search Bar */}
        <AiSearchBar />

        {/* Shortcuts */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 w-full max-w-4xl">
          <ImageShortcutButton imgSrc="/images/wholesales/download.png" label="Let's Go Group" href="/wholesale/letsgo" fallbackIcon="🗺️" />
          <ImageShortcutButton imgSrc="/images/wholesales/download.jfif" label="GO 365 Travel" href="/wholesale/go365" fallbackIcon="✈️" />
          <ImageShortcutButton imgSrc="/images/wholesales/CH7.jpg" label="Check In Group" href="/wholesale/checkingroup" fallbackIcon="🌍" />
          <ImageShortcutButton imgSrc="/images/wholesales/Tour-Factory.jpg" label="Tour Factory" href="/wholesale/tourfactory" fallbackIcon="🏭" />
          <ShortcutButton icon="✨" label="AI วางแผน" href="/ai-planner" />
        </div>
      </div>
    </main>
  );
}

function ShortcutButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-3 bg-white hover:bg-orange-50/50 rounded-2xl w-20 h-20 md:w-24 md:h-24 transition-all border-2 border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md group">
      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-[10px] md:text-xs text-gray-700 font-bold text-center group-hover:text-orange-600 line-clamp-1">
        {label}
      </span>
    </Link>
  );
}

function ImageShortcutButton({ imgSrc, label, href, fallbackIcon }: { imgSrc: string; label: string; href: string; fallbackIcon: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-3 bg-white hover:bg-orange-50/50 rounded-2xl w-20 h-20 md:w-24 md:h-24 transition-all border-2 border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md group">
      <div className="w-10 h-10 md:w-12 md:h-12 mb-1 flex items-center justify-center overflow-hidden">
        <img 
          src={imgSrc} 
          alt={label} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
        />
      </div>
      <span className="text-[10px] md:text-xs text-gray-700 font-bold text-center group-hover:text-orange-600 line-clamp-1">
        {label}
      </span>
    </Link>
  );
}

