'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter">ลืมรหัสผ่าน</h1>
          <p className="text-sm text-slate-500 mt-2">กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ส่งอีเมลเรียบร้อย</h2>
            <p className="text-sm text-slate-500 mb-6">กรุณาตรวจสอบอีเมล <strong>{email}</strong> สำหรับลิงก์รีเซ็ตรหัสผ่าน</p>
            <a href="/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">← กลับไปหน้าเข้าสู่ระบบ</a>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 border border-red-100">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล (Email)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} placeholder="admin@jongtour.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center">
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <a href="/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">← กลับไปหน้าเข้าสู่ระบบ</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


