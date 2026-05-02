"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import UserMenu from "./UserMenu";

export default function AuthButtons({ serverUser }: { serverUser?: any }) {
  const [user, setUser] = useState<any>(serverUser);
  const [loading, setLoading] = useState(!serverUser);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!serverUser) {
      // If server didn't find the user, try fetching on the client
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [serverUser, supabase.auth]);

  if (loading) {
    return <div className="w-32 h-10 animate-pulse bg-gray-100 rounded-lg"></div>;
  }

  if (user) {
    return <UserMenu user={user} />;
  }

  return (
    <>
      <Link href="/auth/register" className="hidden md:flex text-orange-600 hover:text-orange-700 font-bold text-xs transition-colors items-center bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
        สมัคร B2B
      </Link>
      <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>
      <Link href="/login" className="hidden md:flex text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors items-center">
        เข้าสู่ระบบ
      </Link>
      <Link href="/login" className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center shadow-sm">
        สมัครสมาชิก
      </Link>
    </>
  );
}
