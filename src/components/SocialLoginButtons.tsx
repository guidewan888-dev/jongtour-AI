"use client";

import { createClient } from "@/utils/supabase/client";

export default function SocialLoginButtons() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  const handleLineLogin = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'custom:line' as any,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ปุ่ม LINE */}
      <button 
        type="button" 
        onClick={handleLineLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#00C300] text-white font-medium py-2.5 rounded-full hover:bg-[#00B000] transition-colors shadow-sm"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" className="w-5 h-5 brightness-0 invert" />
        เข้าสู่ระบบด้วย LINE
      </button>

      {/* ปุ่ม Google */}
      <button 
        type="button" 
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#4285F4] text-white font-medium py-2.5 rounded-full hover:bg-[#3367D6] transition-colors shadow-sm"
      >
        <div className="bg-white p-1 rounded-full flex items-center justify-center w-5 h-5">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-3.5 h-3.5" />
        </div>
        เข้าสู่ระบบด้วยบัญชีกูเกิล
      </button>
      
      {/* ปุ่ม Facebook (Mock) */}
      <button type="button" className="w-full flex items-center justify-center gap-3 bg-white text-[#1877F2] font-medium py-2.5 rounded-full border border-[#1877F2] hover:bg-blue-50 transition-colors shadow-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
        เข้าสู่ระบบด้วยบัญชี Facebook
      </button>
    </div>
  );
}
