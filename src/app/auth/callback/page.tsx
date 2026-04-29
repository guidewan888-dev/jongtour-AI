"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/';
    
    if (code) {
      // PKCE Flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          window.location.href = next;
        } else {
          window.location.href = '/login?error=' + encodeURIComponent(error.message);
        }
      });
    } else {
      // Implicit Flow fallback (or just check if session is already established by client SDK)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = next;
        } else {
          window.location.href = '/login?error=No+code+provided';
        }
      });
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-[400px] w-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">กำลังยืนยันตัวตน...</h2>
        <p className="text-gray-500 text-sm">กรุณารอสักครู่ ระบบกำลังพาท่านเข้าสู่ระบบ</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-[400px] w-full">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
