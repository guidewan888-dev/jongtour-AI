'use client'

import { useState } from 'react'
import { resetPassword } from '@/lib/auth.actions'
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
          กำลังส่งลิงก์...
        </>
      ) : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    setSuccessMsg('')
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.success) {
      setSuccessMsg('เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบในกล่องจดหมาย (หรือ Junk/Spam)')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-4 text-orange-500">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ลืมรหัสผ่าน?</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">กรอกอีเมลที่คุณใช้สมัครสมาชิก แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="mb-6 p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-center">
            <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-bold">{successMsg}</p>
            <Link href="/login" className="mt-4 inline-block text-emerald-600 font-bold hover:text-emerald-700 underline text-sm">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form action={clientAction} className="space-y-4">
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
            
            <SubmitButton />
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 font-medium">
            นึกรหัสผ่านออกแล้ว? <Link href="/login" className="text-orange-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
