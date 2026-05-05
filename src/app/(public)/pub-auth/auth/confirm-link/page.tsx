'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { confirmAccountLink } from '@/lib/auth.actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
    >
      {pending ? 'กำลังเชื่อมโยง...' : 'ยืนยันรหัสผ่านเพื่อเชื่อมบัญชี'}
    </button>
  )
}

function ConfirmLinkContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const provider = searchParams.get('provider') || 'Social'
  const providerId = searchParams.get('providerId') || ''
  
  const [errorMsg, setErrorMsg] = useState('')

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    const result = await confirmAccountLink(formData)
    if (result?.error) {
      setErrorMsg(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4 text-amber-500">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">พบอีเมลในระบบ</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">เราพบบัญชี Jongtour เดิมของคุณที่ใช้อีเมล <strong>{email}</strong><br/>คุณต้องการเชื่อมบัญชี {provider} เข้ากับบัญชีเดิมหรือไม่?</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
          <p className="text-xs text-orange-800 font-medium"><strong>ความปลอดภัย (Security Rules):</strong> เพื่อป้องกันการสวมรอย กรุณาใส่รหัสผ่านของบัญชี {email} เดิมของคุณ เพื่อยืนยันตัวตนก่อนทำการเชื่อมโยง</p>
        </div>

        <form action={clientAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="providerId" value={providerId} />
          
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">รหัสผ่านบัญชีเดิม (Password)</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-shadow"
            />
          </div>
          
          <SubmitButton />
        </form>

        <div className="mt-6 text-center">
          <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            ไม่ใช่บัญชีของคุณ? ยกเลิกการ Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmLinkPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="g-skeleton w-96 h-64 rounded-2xl" /></div>}><ConfirmLinkContent /></Suspense>
}
