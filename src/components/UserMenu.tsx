"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    window.location.reload();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <p className="font-bold text-gray-800 text-sm">{user.user_metadata?.full_name || "บัญชีของฉัน"}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
          </div>
          
          <div className="py-2">
            <Link href="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              ข้อมูลส่วนตัวของฉัน
            </Link>
            <Link href="/bookings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              ทริปของฉัน (การจอง)
            </Link>
            <Link href="/favorites" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              ที่พัก/ทัวร์ถูกใจ
            </Link>
            {/* Admin Link visible to everyone for now until RBAC is setup */}
            <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors">
              ระบบจัดการหลังบ้าน (Admin)
            </Link>
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={handleSignOut}
              className="w-full text-center py-2.5 bg-white border border-gray-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
