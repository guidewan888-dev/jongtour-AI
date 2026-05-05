'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const supabase = createClient();

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email) { setEmailError('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธญเธตเน€เธกเธฅ'); return; }
    if (!validateEmail(email)) { setEmailError('เธฃเธนเธเนเธเธเธญเธตเน€เธกเธฅเนเธกเนเธ–เธนเธเธ•เนเธญเธ'); return; }
    if (!password) { setError('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ'); return; }

    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError('เธญเธตเน€เธกเธฅเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ');
        setIsLoading(false);
        return;
      }

      const role = data.session?.user?.user_metadata?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        await supabase.auth.signOut();
        setError('เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธเธฃเธฐเธเธ Admin');
        setIsLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเธทเนเธญเธกเธ•เนเธญเน€เธเธดเธฃเนเธเน€เธงเธญเธฃเน');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">JONGTOUR <span className="text-orange-500 font-normal">ADMIN</span></h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธเธฒเธฃเธเธฑเธ”เธเธฒเธฃเธซเธฅเธฑเธเธเนเธฒเธ</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 flex items-start gap-2 border border-red-100">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เธญเธตเน€เธกเธฅ (Email)</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} disabled={isLoading} placeholder="admin@jongtour.com" className={`w-full bg-slate-50 border ${emailError ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm`} />
            {emailError && <p className="text-red-500 text-xs font-bold mt-1.5">{emailError}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">เธฃเธซเธฑเธชเธเนเธฒเธ (Password)</label>
              <a href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700">เธฅเธทเธกเธฃเธซเธฑเธชเธเนเธฒเธ?</a>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} placeholder="โ€ขโ€ขโ€ขโ€ขโ€ขโ€ขโ€ขโ€ข" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm tracking-widest" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                  }
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ (Sign In)'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center max-w-sm">
        <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 mb-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Restricted Enterprise System
        </p>
        <p className="text-[10px] text-slate-400">This system is restricted to authorized Jongtour personnel only. All activities are logged and monitored.</p>
      </div>
    </div>
  );
}


