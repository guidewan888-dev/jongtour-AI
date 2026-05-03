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
        <div className="w-8 h-8 bg-[#5392f9] text-white rounded-full flex items-center justify-center font-bold text-sm">
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
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100 flex flex-col">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50/50">
            <p className="font-bold text-gray-800 text-sm">บัญชีของฉัน</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          </div>
          
          {/* Main Links */}
          <div className="py-2 flex flex-col">

            <Link href="/user/bookings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>รายการจอง</span>
            </Link>
            <Link href="/user/messages" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>ข้อความจากทัวร์</span>
            </Link>
            <Link href="/user/rewards" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>Jongtour รีวอร์ด</span>
              <span className="bg-[#5392f9] text-white text-[10px] px-2 py-0.5 rounded font-bold">100 Coins</span>
            </Link>
            <Link href="/user/vip" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>Jongtour VIP</span>
              <span className="bg-[#1a2b4c] text-white text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                Bronze
              </span>
            </Link>
            <Link href="/user/favorites" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>ทัวร์ถูกใจ</span>
            </Link>
            <Link href="/user/reviews" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>รีวิวของฉัน</span>
            </Link>
            <Link href="/user/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>ข้อมูลส่วนตัวของฉัน</span>
            </Link>
          </div>
          
          {/* Logout Button */}
          <div className="p-3">
            <button 
              onClick={handleSignOut}
              className="w-full text-center py-2 bg-white border border-[#5392f9] text-[#5392f9] text-sm font-medium rounded hover:bg-blue-50 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Settings */}
          <div className="py-2 bg-gray-50">
            <p className="px-4 py-1 text-xs font-bold text-gray-500">การตั้งค่า</p>
            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3 text-left">
              <img src="https://flagcdn.com/w20/th.png" alt="Thai" className="w-5 h-3.5 rounded-sm object-cover" />
              <span>ภาษาไทย</span>
            </button>
            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3 text-left">
              <span className="w-5 font-medium text-center text-gray-600">฿</span>
              <span>บาท</span>
            </button>
          </div>

          {/* Host CTA */}
          <div className="bg-gray-50 pt-1 pb-3 px-3">
            <Link href="https://agent.jongtour.com" className="block border border-gray-200 bg-white rounded overflow-hidden hover:border-gray-300 transition-colors">
              <div className="px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 text-center border-b border-gray-200">
                ร่วมเป็นพาร์ทเนอร์กับเรา
              </div>
              <div className="p-3 text-xs text-gray-500 text-center">
                เพิ่มยอดขายทัวร์ของคุณ สมัครฟรีวันนี้!
                <span className="block mt-1 text-[#ff567d] font-medium">ลงประกาศฟรี</span>
              </div>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
