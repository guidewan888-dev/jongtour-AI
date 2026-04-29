"use client";

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exchangeAttempted = useRef(false);
  
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
    
    if (code && !exchangeAttempted.current) {
      exchangeAttempted.current = true;
      // PKCE Flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          // Sometimes React Strict Mode or automatic SDK exchange causes "Unable to exchange external code".
          // If this happens, check if the session was ALREADY successfully established!
          supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
              window.location.href = '/login?error=' + encodeURIComponent(error.message);
            } else {
              window.location.href = next;
            }
          });
        }
        // If no error, do NOT redirect yet! Let onAuthStateChange handle it to ensure cookies are written!
      });
    }

    // Both PKCE and Implicit flows will eventually trigger SIGNED_IN
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Safe to redirect because state is fully persisted
        window.location.href = next;
      }
    });

    // If after 3 seconds no session is established, it means there was no valid auth data or it failed
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = next;
        } else {
          // Check if we are already redirecting
          if (!window.location.href.includes('/login')) {
            window.location.href = '/login?error=' + encodeURIComponent('ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง');
          }
        }
      });
    }, 3000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
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
