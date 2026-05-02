import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, PlusCircle, ArrowLeft, LogOut, Settings } from "lucide-react";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function TourCmsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true }
  });

  // Only allow ADMIN or SUPPLIER to access Tour CMS
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "SUPPLIER" && dbUser.company?.type !== "SUPPLIER")) {
    redirect("/b2b");
  }

  const isSupplier = dbUser.role === "SUPPLIER" || dbUser.company?.type === "SUPPLIER";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-indigo-500 text-white px-2 py-1 rounded-md text-sm">TOUR</span>
            CMS Portal
          </div>
          <p className="text-xs text-slate-400 mt-2">{dbUser.company?.name || 'Jongtour Network'}</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link
            href="/tour-cms"
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors bg-indigo-500 text-white shadow-sm"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium text-sm">แพ็กเกจทัวร์ทั้งหมด</span>
          </Link>
          <Link
            href="/tour-cms/new"
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium text-sm">เพิ่มทัวร์ใหม่</span>
          </Link>
          {isSupplier && (
            <Link
              href="/tour-cms/settings"
              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">ตั้งค่า Supplier</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {!isSupplier && (
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-sm">กลับไปหน้า Admin</span>
            </Link>
          )}
          <form action="/auth/logout" method="post">
            <button 
              type="submit"
              className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-800">ระบบจัดการสินค้า (Product Management)</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{dbUser.name}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {dbUser.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
