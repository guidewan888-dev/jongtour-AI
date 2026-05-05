'use client'

import React, { useState } from 'react'
import { disconnectSocialAccount } from '@/lib/social.actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type SocialAccount = {
  provider: string
  providerEmail: string | null
  displayName: string | null
  linkedAt: Date
}

export default function SocialConnectionsClient({ 
  hasPassword, 
  socialAccounts 
}: { 
  hasPassword: boolean
  socialAccounts: SocialAccount[]
}) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const supabase = createClient()

  const availableProviders = [
    { id: 'google', name: 'Google', color: 'bg-white', text: 'text-slate-700', icon: <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
    { id: 'line', name: 'LINE', color: 'bg-[#06C755]', text: 'text-white', icon: <div className="font-black text-xs">LINE</div> },
    { id: 'facebook', name: 'Facebook', color: 'bg-[#1877F2]', text: 'text-white', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> }
  ]

  const handleConnect = async (providerId: string) => {
    setIsProcessing(providerId)
    setErrorMsg('')
    setSuccessMsg('')
    
    const { error } = await supabase.auth.linkIdentity({ provider: providerId as any })
    
    if (error) {
       setErrorMsg(`เชื่อมต่อ ${providerId} ไม่สำเร็จ: ${error.message}`)
       setIsProcessing(null)
    } else {
       // Typically linkIdentity redirects to the provider. The callback will handle the rest.
       setSuccessMsg('กำลังเปลี่ยนหน้าไปยังผู้ให้บริการ...')
    }
  }

  const handleDisconnect = async (providerId: string) => {
    // Rule Check: If no password and only 1 social provider left
    if (!hasPassword && socialAccounts.length <= 1) {
      setErrorMsg('คุณต้องตั้งรหัสผ่านผ่านเมนู ความปลอดภัย ก่อน จึงจะสามารถยกเลิกการเชื่อมต่อบัญชีโซเชียลสุดท้ายได้')
      return
    }

    if (confirm(`ยืนยันการยกเลิกการเชื่อมต่อบัญชี ${providerId}? คุณจะไม่สามารถล็อกอินด้วยบัญชีนี้ได้อีกเว้นแต่จะเชื่อมต่อใหม่`)) {
      setIsProcessing(providerId)
      setErrorMsg('')
      setSuccessMsg('')

      const result = await disconnectSocialAccount(providerId)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg(`ยกเลิกการเชื่อมต่อ ${providerId} สำเร็จ`)
        router.refresh()
      }
      setIsProcessing(null)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-3xl">
      <h2 className="text-xl font-black text-slate-800 mb-2">จัดการบัญชี Social Login</h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        เชื่อมต่อบัญชีโซเชียลของคุณเพื่อความสะดวกและรวดเร็วในการเข้าสู่ระบบครั้งถัดไป โดยไม่ต้องจำรหัสผ่าน
      </p>

      {errorMsg && (
        <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex gap-3 items-start">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex gap-3 items-start">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {availableProviders.map(provider => {
          const connectedAccount = socialAccounts.find(acc => acc.provider === provider.id)
          const isConnected = !!connectedAccount
          
          return (
            <div key={provider.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-slate-200 rounded-2xl transition-colors hover:border-slate-300 gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 ${provider.color} ${provider.text}`}>
                  {provider.icon}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{provider.name}</h3>
                  {isConnected ? (
                    <div>
                      <p className="text-sm font-medium text-slate-600">{connectedAccount.providerEmail || connectedAccount.displayName || 'บัญชีถูกเชื่อมต่อแล้ว'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">เชื่อมต่อเมื่อ: {new Date(connectedAccount.linkedAt).toLocaleDateString('th-TH')}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-400">ยังไม่ได้เชื่อมต่อ</p>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-end md:block border-t border-slate-100 pt-4 md:pt-0 md:border-none">
                {isConnected ? (
                  <button 
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={isProcessing === provider.id}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isProcessing === provider.id ? 'กำลังประมวลผล...' : 'ยกเลิกการเชื่อมต่อ'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(provider.id)}
                    disabled={isProcessing === provider.id}
                    className="bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-600 hover:text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isProcessing === provider.id ? 'กำลังเปลี่ยนหน้า...' : 'เชื่อมต่อบัญชี'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-500 leading-relaxed">
        <strong className="text-slate-700">หมายเหตุ:</strong> ระบบไม่มีการจัดเก็บรหัสผ่านบัญชีโซเชียลของคุณ และไม่แสดงข้อมูล Access Token ใดๆ เพื่อความปลอดภัยสูงสุด หากคุณต้องการลบบัญชีโซเชียลอันสุดท้าย กรุณาตั้งรหัสผ่านสำหรับบัญชีที่เมนู <a href="/account/security" className="text-indigo-600 font-bold hover:underline">ความปลอดภัย</a> ก่อน
      </div>
    </div>
  )
}
