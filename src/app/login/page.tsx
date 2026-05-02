"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import SocialLoginButtons from "@/components/SocialLoginButtons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const messageParam = searchParams.get("message");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to admin if logging in from admin subdomain, otherwise user bookings
        if (window.location.hostname.startsWith('admin.')) {
          window.location.href = "/";
        } else {
          window.location.href = "/user/bookings";
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setLocalError(error.message);
      setLoading(false);
    }
    // No need to redirect here, onAuthStateChange will handle it!
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    setLocalMessage("");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      setLocalError(error.message);
      setLoading(false);
      return;
    }
    
    if (!data.session) {
      setLocalMessage("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี");
      setLoading(false);
      return;
    }
    
    // No need to redirect here, onAuthStateChange will handle it!
  };

  const displayError = localError || errorParam;
  const displayMessage = localMessage || messageParam;

  return (
    <div className="w-full max-w-[420px] bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
      
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
          เข้าสู่ระบบหรือสร้างบัญชีผู้ใช้
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          สมัครใช้บริการฟรีหรือล็อกอินเข้าสู่ระบบเพื่อรับข้อเสนอและสิทธิประโยชน์สุดพิเศษ
        </p>
      </div>

      {displayError && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
          {displayError}
        </div>
      )}

      {displayMessage && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 text-center border border-green-100">
          {displayMessage}
        </div>
      )}

      <SocialLoginButtons />

      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-white text-gray-500 font-medium">หรือ</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500 z-10" htmlFor="email">อีเมล</label>
          <input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full border border-gray-300 rounded-lg py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
            placeholder="id@email.com" 
          />
        </div>
        
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500 z-10" htmlFor="password">รหัสผ่าน</label>
          <input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="w-full border border-gray-300 rounded-lg py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
            placeholder="••••••••" 
          />
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#E5E7EB] text-gray-400 font-medium py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังโหลด..." : "ดำเนินการต่อ (เข้าสู่ระบบ)"}
          </button>
          <button 
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-white text-blue-600 border border-blue-600 font-medium py-2.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังโหลด..." : "สร้างบัญชีใหม่ด้วยอีเมล"}
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
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f8f8] p-4 font-sans">
      <Suspense fallback={<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
