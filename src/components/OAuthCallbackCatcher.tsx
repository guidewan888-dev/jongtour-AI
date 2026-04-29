"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OAuthCallbackCatcher() {
  const searchParams = useSearchParams();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    // Handle OAuth errors from Supabase
    if (error || errorDesc) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?error=' + encodeURIComponent(errorDesc || error || 'Authentication failed');
      }
      return;
    }
    
    // ONLY run this if we are NOT on the official callback page, to avoid conflicts
    if (code && !exchangeAttempted.current && window.location.pathname !== '/auth/callback') {
      exchangeAttempted.current = true;
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          window.history.replaceState({}, document.title, window.location.pathname);
          // Don't reload immediately. Wait for the cookie to be persisted fully.
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          // If error is "Unable to exchange external code", check if session actually succeeded in background
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
               window.history.replaceState({}, document.title, window.location.pathname);
               window.location.reload();
            }
          });
        }
      });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (window.location.hash.includes('access_token') && window.location.pathname !== '/auth/callback') {
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  return null; // This component doesn't render anything
}
