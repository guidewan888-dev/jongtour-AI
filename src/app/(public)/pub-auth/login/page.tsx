'use client'

import { useState } from 'react'
import { loginWithEmail, loginWithOAuth } from '@/lib/auth.actions'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
    >
      {pending ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          กำลังเข้าสู่ระบบ...
        </>
      ) : 'เข้าสู่ระบบ'}
    </button>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [errorMsg, setErrorMsg] = useState('')
  const nextUrl = typeof searchParams.next === 'string' ? searchParams.next : '/account/dashboard'

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    const result = await loginWithEmail(formData)
    if (result?.error) {
      if (result.error.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else {
        setErrorMsg(result.error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-4 text-orange-500">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </Link>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">เข้าสู่ระบบ Jongtour</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">ดูสถานะการจอง ดาวน์โหลด Voucher และจัดการทริปของคุณ</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <form action={clientAction} className="space-y-4">
            <input type="hidden" name="next" value={nextUrl} />
            
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">อีเมล (Email)</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="name@example.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">รหัสผ่าน (Password)</label>
                <Link href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">ลืมรหัสผ่าน?</Link>
              </div>
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
              />
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">จดจำฉันไว้ในระบบ</span>
              </label>
            </div>
            
            <SubmitButton />
          </form>

          <div className="mt-8 mb-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-white px-4 text-slate-400">หรือเข้าสู่ระบบด้วย</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => loginWithOAuth('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <button 
              onClick={() => loginWithOAuth('line')}
              className="w-full flex items-center justify-center gap-3 bg-[#00C300] hover:bg-[#00B300] text-white py-3 rounded-xl font-bold shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.965 8.932 9.421 9.614.368.079.87.243.999.557.116.284.076.726.036 1.018-.046.335-.298 1.472-.36 1.761-.097.46-.445 2.181 1.914 1.189 2.359-.991 12.723-7.498 12.723-14.139h-.733z" /></svg>
              Continue with LINE
            </button>
            <button 
              onClick={() => loginWithOAuth('facebook')}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 rounded-xl font-bold shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Continue with Facebook
            </button>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-slate-600 font-medium">
              ยังไม่มีบัญชีใช่ไหม? <Link href="/register" className="text-orange-600 font-bold hover:underline">สมัครสมาชิก</Link>
            </p>
            <Link href="/tours" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mt-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              กลับไปหน้าค้นหาทัวร์
            </Link>
          </div>
          
        </div>
      </div>

      <div className="mt-8 text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        ข้อมูลของคุณถูกเข้ารหัสและปกป้องด้วยมาตรฐานความปลอดภัยสูงสุด
      </div>

    </div>
  )
}
