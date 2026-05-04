"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verify that the user actually arrived here via a recovery link (has an active session)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Not logged in via recovery link, redirect to login
        router.replace("/auth/admin-login");
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      // Supabase update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Call our API to clear mustChangePassword and send notification email
      await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      setStatus("success");

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "https://admin.jongtour.com/";
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="bg-white py-12 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
          <p className="text-gray-600 mb-6">รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว กำลังพากลับสู่หน้าหลัก...</p>
          <Loader2 className="w-6 h-6 animate-spin text-red-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Set New Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          กรุณาตั้งรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีคุณ
        </p>
      </div>

      <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
        <form className="space-y-6" onSubmit={handleReset}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-3 border focus:ring-red-500 focus:border-red-500 bg-gray-50/50"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-3 border focus:ring-red-500 focus:border-red-500 bg-gray-50/50"
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-all"
              disabled={status === "loading" || !password || !confirmPassword}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกรหัสผ่านใหม่"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
