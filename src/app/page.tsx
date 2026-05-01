import Link from "next/link";
import { Plus } from "lucide-react";
import AiSearchBar from "@/components/AiSearchBar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import { prisma } from "@/lib/prisma";
import { processAiQuery } from "@/services/aiPlanner";

// ใช้ ISR Cache 1 นาที เพื่อให้เว็บเร็วขึ้น และข้อมูลยังอัปเดตอยู่
export const revalidate = 60;

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const lineUid = cookieStore.get('jongtour_line_uid')?.value;
  let dynamicGreeting = null;
  let recommendedTours: any[] = [];

  if (lineUid) {
    const session = await prisma.lineChatSession.findUnique({ where: { lineUserId: lineUid } });
    if (session && session.summary) {
      dynamicGreeting = "ทัวร์แนะนำพิเศษสำหรับคุณ (อ้างอิงจากแชทล่าสุดใน LINE)";
      recommendedTours = await processAiQuery(session.summary);
    }
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
      <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-6 mt-0 -translate-y-8">

        {/* AI Search Bar */}
        <AiSearchBar />

        {/* AI F.I.T. Banner CTA */}
        <div className="w-full max-w-4xl bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transform hover:scale-[1.01] transition-transform mt-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">✨ ให้ AI จัดทริปส่วนตัวให้คุณ</h2>
            <p className="text-white/90 text-sm md:text-base">พิมพ์บอกสิ่งที่คุณต้องการ AI จะจัดแผน คำนวณราคา และสร้างโบรชัวร์ PDF ให้ภายใน 10 วินาที</p>
          </div>
          <Link href="/ai-planner" className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap">
            ทดลองใช้ฟรี
          </Link>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 w-full max-w-4xl">
          <ImageShortcutButton imgSrc="/images/wholesales/download.png" label="Let's Go Group" href="/wholesale/letsgo" fallbackIcon="🗺️" />
          <ImageShortcutButton imgSrc="/images/wholesales/download.jfif" label="GO 365 Travel" href="/wholesale/go365" fallbackIcon="✈️" />
          <ImageShortcutButton imgSrc="/images/wholesales/CH7.jpg" label="Check In Group" href="/wholesale/checkingroup" fallbackIcon="🌍" />
          <ImageShortcutButton imgSrc="/images/wholesales/Tour-Factory.jpg" label="Tour Factory" href="/wholesale/tourfactory" fallbackIcon="🏭" />
          <ShortcutButton icon="✨" label="AI วางแผน" href="/ai-planner" />
        </div>

        {/* AI Dynamic Personalized Recommendations */}
        {recommendedTours.length > 0 && (
          <div className="w-full max-w-6xl mt-12 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
              ✨ {dynamicGreeting}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTours.slice(0, 3).map((tour) => (
                <div key={tour.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                  <div className="w-full h-48 bg-gray-200 overflow-hidden relative">
                    <img 
                      src={tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop"} 
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{tour.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{tour.destination}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold text-green-600">฿{Number(tour.price).toLocaleString()}</span>
                      <Link href={`/tours/${tour.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">ดูรายละเอียด</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

