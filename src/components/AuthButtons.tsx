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
      <Link href="/login" className="hidden md:flex text-trust-600 hover:text-primary font-medium text-sm transition-colors items-center">
        เข้าสู่ระบบ
      </Link>
      <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-600 transition-colors flex items-center shadow-sm shadow-primary/20">
        สมัครสมาชิก
      </Link>
    </>
  );
}
