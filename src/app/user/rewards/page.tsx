import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RewardsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Jongtour รีวอร์ด</h1>
      
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 font-medium mb-1">ยอดรวม Coins คงเหลือ</p>
            <h2 className="text-4xl font-bold flex items-center gap-2">
              100 <span className="text-2xl font-normal opacity-80">Coins</span>
            </h2>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <svg className="w-10 h-10 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9.5 5.5a.5.5 0 00-1 0v.6c-.66.21-1.5.76-1.5 1.9 0 1.09.79 1.74 1.7 1.99.7.2 1.3.43 1.3 1.01 0 .5-.47.8-1.2.8A3.33 3.33 0 017 11.5a.5.5 0 00-1 0 4.33 4.33 0 003.5 4.3v.7a.5.5 0 001 0v-.7c.8-.23 1.5-.83 1.5-2 0-1.12-.8-1.8-1.8-2-.7-.18-1.2-.42-1.2-1 0-.46.43-.78 1.1-.78a3.17 3.17 0 011.8.8.5.5 0 00.7-.7A4.17 4.17 0 0010.5 6.1v-.6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">ประวัติการได้รับ Coins</h3>
        </div>
        <div className="divide-y divide-gray-100">
          
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">เขียนรีวิวทริป</p>
                <p className="text-xs text-gray-500">ทัวร์เกาหลี โซล นามิ สกีรีสอร์ท 5 วัน 3 คืน</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{new Date().toLocaleDateString('th-TH')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-500 text-lg">+100</p>
              <p className="text-[10px] text-gray-400">Coins</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
