import Link from "next/link";
import { login, signup, signInWithGoogle, signInWithLine } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { message: string, error: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold tracking-tight text-gray-800">
            <span className="text-orange-500">Jong</span>tour AI
          </Link>
          <p className="text-gray-500 mt-2">เข้าสู่ระบบเพื่อจัดการการจองทัวร์ของคุณ</p>
        </div>

        {searchParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 text-center border border-red-100">
            {searchParams.error}
          </div>
        )}

        {searchParams?.message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-6 text-center border border-green-100">
            {searchParams.message}
          </div>
        )}

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">อีเมล</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              placeholder="you@example.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">รหัสผ่าน</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              formAction={login} 
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              เข้าสู่ระบบ (Login)
            </button>
            <button 
              formAction={signup} 
              className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              สมัครสมาชิกใหม่ (Sign Up)
            </button>
          </div>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium">หรือเข้าสู่ระบบด้วย</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* ปุ่ม Gmail */}
          <form action={signInWithGoogle}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              ดำเนินการต่อด้วย Gmail
            </button>
          </form>
          
          {/* ปุ่ม LINE */}
          <form action={signInWithLine}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-[#00C300] text-white font-bold py-3 rounded-xl hover:bg-[#00B000] transition-colors shadow-md shadow-[#00C300]/20">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-6 h-6 brightness-0 invert" />
              ดำเนินการต่อด้วย LINE
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-500 underline underline-offset-2 transition-colors">
            กลับไปหน้าหลัก
          </Link>
        </div>

      </div>
    </main>
  );
}
