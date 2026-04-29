import Link from "next/link";
import { login, signup, signInWithGoogle, signInWithLine } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { message: string, error: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f8f8] p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
            เข้าสู่ระบบหรือสร้างบัญชีผู้ใช้
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            สมัครใช้บริการฟรีหรือล็อกอินเข้าสู่ระบบเพื่อรับข้อเสนอและสิทธิประโยชน์สุดพิเศษ
          </p>
        </div>

        {searchParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {searchParams.error}
          </div>
        )}

        {searchParams?.message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 text-center border border-green-100">
            {searchParams.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* ปุ่ม LINE */}
          <form action={signInWithLine}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-[#00C300] text-white font-medium py-2.5 rounded-full hover:bg-[#00B000] transition-colors shadow-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-5 h-5 brightness-0 invert" />
              เข้าสู่ระบบด้วย LINE
            </button>
          </form>

          {/* ปุ่ม Google */}
          <form action={signInWithGoogle}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-[#4285F4] text-white font-medium py-2.5 rounded-full hover:bg-[#3367D6] transition-colors shadow-sm">
              <div className="bg-white p-1 rounded-full flex items-center justify-center w-5 h-5">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-3.5 h-3.5" />
              </div>
              เข้าสู่ระบบด้วยบัญชีกูเกิล
            </button>
          </form>
          
          {/* ปุ่ม Facebook (Mock) */}
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-white text-[#1877F2] font-medium py-2.5 rounded-full border border-[#1877F2] hover:bg-blue-50 transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
            เข้าสู่ระบบด้วยบัญชี Facebook
          </button>

          {/* ปุ่ม Apple (Mock) */}
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-[#000000] text-white font-medium py-2.5 rounded-full hover:bg-gray-900 transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.43.987 3.96.948 1.567-.04 2.579-1.5 3.578-2.977 1.158-1.676 1.636-3.327 1.66-3.415-.035-.013-3.182-1.203-3.216-4.854-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.71 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/></svg>
            ลงชื่อเข้าใช้ด้วย Apple
          </button>
        </div>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-500 font-medium">หรือ</span>
          </div>
        </div>

        <form className="space-y-4">
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500 z-10" htmlFor="email">อีเมล</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full border border-gray-300 rounded-lg py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
              placeholder="id@email.com" 
            />
          </div>
          
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500 z-10" htmlFor="password">รหัสผ่าน</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="w-full border border-gray-300 rounded-lg py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button 
              formAction={login} 
              className="w-full bg-[#E5E7EB] text-gray-400 font-medium py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              ดำเนินการต่อ (เข้าสู่ระบบ)
            </button>
            <button 
              formAction={signup} 
              className="w-full bg-white text-blue-600 border border-blue-600 font-medium py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              สร้างบัญชีใหม่ด้วยอีเมล
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto">
            วิธีอื่นๆ สำหรับเข้าสู่ระบบ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        <div className="mt-8 text-center text-[11px] text-gray-500 leading-relaxed px-4">
          ท่านยอมรับ <a href="#" className="text-blue-600 hover:underline">ข้อกำหนดการใช้งาน</a> และ <a href="#" className="text-blue-600 hover:underline">นโยบายความเป็นส่วนตัว</a> ของ Jongtour AI เมื่อดำเนินการต่อ
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-blue-600 underline underline-offset-2 transition-colors">
            กลับไปหน้าหลัก
          </Link>
        </div>

      </div>
    </main>
  );
}
