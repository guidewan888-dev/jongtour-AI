'use client';
import React, { useState } from 'react';

// ----------------------------------------------------------------------
// TODO: Replace with real Auth API (e.g., Supabase Auth or NextAuth)
// ----------------------------------------------------------------------
async function loginAgent(email: string, pass: string) {
  await new Promise(r => setTimeout(r, 1200)); // Simulate API delay
  
  if (email === 'admin@jongtour.com' || pass === 'password') {
    return { success: true, token: 'mock-jwt-token' };
  }
  
  // Simulate error for invalid credentials (except if they use test/test just for demo)
  if (email && pass) {
     return { success: true, token: 'mock-jwt-token' }; // Allowing any for demo, but normally throw error
  }
  
  throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
}

export default function AgentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAgent(email, password);
      if (res.success) {
        // Redirect to agent dashboard
        window.location.href = '/agent/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
      
      <div className="max-w-[420px] w-full animate-fade-in-up">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block text-3xl font-black text-slate-900 tracking-tighter mb-2">JONGTOUR<span className="text-orange-600">.</span></a>
          <h1 className="text-xl font-bold text-slate-700">Agent Portal</h1>
          <p className="text-slate-500 text-sm mt-1">ระบบจัดการการจองสำหรับพาร์ทเนอร์ตัวแทนจำหน่าย</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล (Email)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                placeholder="agent@company.com" 
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">รหัสผ่าน (Password)</label>
                <a href="/forgot-password" className="text-sm font-bold text-orange-600 hover:text-orange-700">ลืมรหัสผ่าน?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
                  placeholder="••••••••" 
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 ${
                isLoading ? 'bg-slate-800 text-white opacity-80 cursor-wait' : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ (Sign In)'
              )}
            </button>
          </form>
        </div>

        {/* Footer Support Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            พบปัญหาการใช้งาน?{' '}
            <a href="https://lin.ee/jongtour" className="font-bold text-slate-900 hover:text-orange-600 transition-colors">
              ติดต่อ Agent Support
            </a>
          </p>
        </div>

      </div>

    </div>
  );
}
