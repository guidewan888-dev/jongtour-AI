"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AgentRegistrationBadge() {
  const pathname = usePathname();

  // Don't show in admin routes or specific B2B routes where it might overlap
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <Link 
        href="/auth/register" 
        className="group flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-floating border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105"
      >
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">B2B Portal</p>
          <p className="text-sm font-black text-trust-900 group-hover:text-primary transition-colors">สมัครเอเจ้นท์ (Agent)</p>
        </div>
      </Link>
    </div>
  );
}
