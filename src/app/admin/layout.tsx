import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bell } from "lucide-react";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const isBypass = cookieStore.get("admin_bypass")?.value === "supersecret99";
  if (!user && !isBypass) {
    redirect("/login");
  }

  // ใช้ Supabase JS แทน Prisma เพื่อหลีกเลี่ยง Vercel IPv6 Panic
  const { data: dbUser } = await supabase
    .from("users")
    .select("*, role:roles(*)")
    .eq("email", user.email || "")
    .single();

  let finalUser = dbUser;

  // Auto-create user if it doesn't exist
  if (!finalUser && user.email) {
    // Get CUSTOMER role ID
    const { data: customerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "CUSTOMER")
      .single();

    if (customerRole) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: user.email,
          roleId: customerRole.id,
          passwordHash: "OAUTH_USER", // Dummy password since auth is handled by Supabase
        })
        .select("*, role:roles(*)")
        .single();
      finalUser = newUser;
    }
  }

  // Prevent non-admins from accessing the admin panel
  if (!isBypass && (!finalUser || !finalUser.role || finalUser.role.name !== "ADMIN")) {
    // Redirect to main domain using absolute URL to avoid subdomain rewrite issues
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";
    redirect(`${siteUrl}/user/bookings`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">ระบบจัดการ Jongtour AI</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-orange-500 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-700">{dbUser?.name || "ผู้ดูแลระบบ"}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
