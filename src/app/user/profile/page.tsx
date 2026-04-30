import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch from DB if exists
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลส่วนตัวของฉัน</h1>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user.user_metadata?.full_name || dbUser?.name || 'ไม่มีชื่อ'}
            </h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="p-6">
          <form className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ - นามสกุล</label>
                <input 
                  type="text" 
                  defaultValue={user.user_metadata?.full_name || dbUser?.name || ''} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5392f9] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  defaultValue={dbUser?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5392f9] focus:border-transparent outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                <input 
                  type="email" 
                  defaultValue={user.email || ''} 
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">อีเมลที่ใช้เข้าสู่ระบบไม่สามารถเปลี่ยนแปลงได้</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="button" className="bg-[#5392f9] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
