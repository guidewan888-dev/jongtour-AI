'use client'

import { useState } from 'react'
import { login } from './actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
    >
      {pending ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Authenticating...
        </>
      ) : 'Sign In to Sale CRM'}
    </button>
  )
}

export default function SaleLoginPage() {
  const [errorMsg, setErrorMsg] = useState('')

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    const result = await login(formData)
    if (result?.error) {
      setErrorMsg(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header / Banner */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">JONGTOUR <span className="text-blue-400 font-normal">SALE</span></h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">B2B & B2C Sales Management Portal</p>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Welcome Back</h2>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <form action={clientAction} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Corporate Email</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="name@jongtour.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Password</label>
                <a href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot Password?</a>
              </div>
              <input 
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-mono"
              />
            </div>
            
            <SubmitButton />
            
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Protected by Jongtour Central Auth.<br/>Access restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
