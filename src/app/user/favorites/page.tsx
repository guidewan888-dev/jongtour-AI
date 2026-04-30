import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ทัวร์ถูกใจ</h1>
      
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">ยังไม่มีรายการทัวร์ที่ถูกใจ</h3>
        <p className="text-gray-500 text-sm mb-6">กดหัวใจที่ทัวร์เพื่อบันทึกเก็บไว้ดูภายหลัง</p>
        <Link href="/" className="inline-flex items-center justify-center bg-[#5392f9] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors">
          ค้นหาทัวร์
        </Link>
      </div>
    </div>
  );
}
