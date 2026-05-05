'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CompleteProfileContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider') || 'Social'
  const nextUrl = searchParams.get('next') || '/account/dashboard'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 text-blue-500">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ต้องการอีเมลเพิ่มเติม</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">บัญชี {provider} ของคุณไม่ได้แชร์อีเมล กรุณาระบุอีเมลเพื่อใช้ในการส่งเอกสารยืนยันการจองและ E-Voucher</p>
        </div>

        <form action="/auth/submit-email" method="POST" className="space-y-4">
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="next" value={nextUrl} />
          
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">อีเมลของคุณ (Email)</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="name@example.com"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-sm transition-colors mt-2"
          >
            ยืนยันอีเมลและดำเนินการต่อ
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-medium text-slate-400">
          อีเมลของคุณจะถูกใช้เพื่อการจองเท่านั้น (ตามมาตรฐาน PDPA)
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="g-skeleton w-96 h-64 rounded-2xl" /></div>}><CompleteProfileContent /></Suspense>
}
