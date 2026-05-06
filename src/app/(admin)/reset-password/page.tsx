'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Supabase sends the recovery token via URL hash — the client library handles it automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });
    // Also set ready if user is already authenticated (came from email link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
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
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter">ตั้งรหัสผ่านใหม่</h1>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">เปลี่ยนรหัสผ่านสำเร็จ</h2>
            <p className="text-sm text-slate-500 mb-6">คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว</p>
            <a href="/login" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all">เข้าสู่ระบบ</a>
          </div>
        ) : !isReady ? (
          <div className="text-center py-8">
            <svg className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-sm text-slate-500">กำลังตรวจสอบลิงก์...</p>
            <p className="text-xs text-slate-400 mt-2">หากลิงก์หมดอายุ <a href="/forgot-password" className="text-orange-600 font-bold">ขอลิงก์ใหม่</a></p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 border border-red-100">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">รหัสผ่านใหม่</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} placeholder="อย่างน้อย 8 ตัวอักษร" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} placeholder="กรอกรหัสผ่านอีกครั้ง" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center">
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'ตั้งรหัสผ่านใหม่'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


