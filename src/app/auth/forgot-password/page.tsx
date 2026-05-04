"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      // We always show success to prevent email enumeration attacks
      // unless there's a severe network error
      setStatus("success");
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          กรอกอีเมลแอดมินของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
        </p>
      </div>

      <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
        
        {status === "success" ? (
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Check Your Email</h3>
            <p className="text-sm text-gray-600">
              หากอีเมล <strong>{email}</strong> มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว (ลิงก์มีอายุ 1 ชั่วโมง)
            </p>
            <div className="pt-4">
              <Link href="/auth/admin-login" className="text-red-600 font-medium hover:text-red-500 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 font-medium">
                {errorMessage}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-3 border focus:ring-red-500 focus:border-red-500 bg-gray-50/50"
                  placeholder="your.email@jongtour.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-all"
                disabled={status === "loading" || !email}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                )}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <Link href="/auth/admin-login" className="text-sm font-medium text-gray-600 hover:text-red-600">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
