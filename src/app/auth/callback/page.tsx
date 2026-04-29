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
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    // Handle OAuth errors from Supabase
    if (error || errorDesc) {
      window.location.href = '/login?error=' + encodeURIComponent(errorDesc || error || 'Authentication failed');
      return;
    }
    
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
      // Implicit Flow fallback (URL hash)
      // The Supabase client automatically parses the hash. We just need to listen for the event.
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || session) {
          window.location.href = next;
        }
      });

      // If after 3 seconds no session is established, it means there was no valid auth data
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            window.location.href = next;
          } else {
            window.location.href = '/login?error=' + encodeURIComponent('ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง');
          }
        });
      }, 3000);

      return () => {
        authListener.subscription.unsubscribe();
        clearTimeout(timer);
      };
    }
  }, [searchParams]);

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
