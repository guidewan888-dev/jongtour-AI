'use client'

import React, { useState } from 'react'
import { updateCustomerPassword, requestAccountDeletion } from '@/lib/security.actions'
import Link from 'next/link'

type SocialAccount = {
  provider: string
  providerEmail: string | null
  linkedAt: Date
}

type LoginHistory = {
  id: string
  ipAddress: string | null
  deviceType: string | null
  location: string | null
  status: string
  createdAt: Date
}

export default function SecurityClient({ 
  hasPassword, 
  socialAccounts, 
  loginHistory 
}: { 
  hasPassword: boolean
  socialAccounts: SocialAccount[]
  loginHistory: LoginHistory[]
}) {
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'SESSIONS' | 'ADVANCED'>('PASSWORD')
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdatingPwd(true)
    setPwdError('')
    setPwdSuccess('')

    const formData = new FormData(e.currentTarget)
    const result = await updateCustomerPassword(formData)

    if (result.error) {
      setPwdError(result.error)
    } else {
      setPwdSuccess('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว')
      const form = e.target as HTMLFormElement
      form.reset()
    }
    setIsUpdatingPwd(false)
  }

  const handleDeleteRequest = async () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? การกระทำนี้ไม่สามารถย้อนกลับได้ และอาจส่งผลกระทบต่อรายการจองที่กำลังดำเนินอยู่')) {
      const result = await requestAccountDeletion()
      if (result.success) {
        alert('ส่งคำขอลบบัญชีสำเร็จ เจ้าหน้าที่จะติดต่อกลับทางอีเมลเพื่อยืนยันอีกครั้ง')
      }
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar / Tabs */}
      <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 shrink-0">
        <nav className="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('PASSWORD')}
            className={`px-4 py-3 rounded-xl text-sm font-bold text-left whitespace-nowrap transition-colors flex items-center gap-3 ${activeTab === 'PASSWORD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            รหัสผ่านและการล็อกอิน
          </button>
          <button 
            onClick={() => setActiveTab('SESSIONS')}
            className={`px-4 py-3 rounded-xl text-sm font-bold text-left whitespace-nowrap transition-colors flex items-center gap-3 ${activeTab === 'SESSIONS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            ประวัติการเข้าใช้งาน
          </button>
          <button 
            onClick={() => setActiveTab('ADVANCED')}
            className={`px-4 py-3 rounded-xl text-sm font-bold text-left whitespace-nowrap transition-colors flex items-center gap-3 ${activeTab === 'ADVANCED' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            ความปลอดภัยขั้นสูง
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10">
        
        {activeTab === 'PASSWORD' && (
          <div className="max-w-2xl animate-fade-in-up">
            <h2 className="text-xl font-black text-slate-800 mb-6">รหัสผ่านและการเชื่อมต่อ</h2>
            
            {/* Social Logins */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">บัญชีโซเชียลที่เชื่อมต่อ</h3>
              {socialAccounts.length > 0 ? (
                <div className="space-y-3">
                  {socialAccounts.map(account => (
                    <div key={account.provider} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                          {account.provider === 'google' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                          {account.provider === 'line' && <div className="text-green-500 font-black text-xs">LINE</div>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 capitalize">{account.provider}</p>
                          <p className="text-xs text-slate-500">{account.providerEmail || 'เชื่อมต่อแล้ว'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">เชื่อมต่อแล้ว</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">ไม่มีบัญชีโซเชียลที่เชื่อมต่อ</p>
              )}
            </div>

            {/* Password Form */}
            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
                {hasPassword ? 'เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่านสำหรับบัญชี (คุณล็อกอินด้วย Social)'}
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {pwdError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{pwdError}</div>}
                {pwdSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">{pwdSuccess}</div>}

                {hasPassword && (
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2">รหัสผ่านปัจจุบัน</label>
                    <input 
                      type="password" 
                      name="currentPassword" 
                      required 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    required 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">ยืนยันรหัสผ่านใหม่</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    required 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdatingPwd}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors mt-2"
                >
                  {isUpdatingPwd ? 'กำลังบันทึก...' : (hasPassword ? 'เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่าน')}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'SESSIONS' && (
          <div className="max-w-3xl animate-fade-in-up">
            <h2 className="text-xl font-black text-slate-800 mb-2">ประวัติการเข้าใช้งาน</h2>
            <p className="text-sm text-slate-500 mb-8">ตรวจสอบกิจกรรมการเข้าสู่ระบบบัญชีของคุณ หากพบกิจกรรมที่น่าสงสัย แนะนำให้เปลี่ยนรหัสผ่านทันที</p>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">อุปกรณ์ที่ใช้งานปัจจุบัน (Active Session)</h3>
              <div className="flex items-center gap-4 p-5 border border-emerald-200 bg-emerald-50 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-black text-slate-800">เครื่องนี้ (Current Device)</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">ออนไลน์ (Online)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">ประวัติการล็อกอินย้อนหลัง</h3>
              {loginHistory.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-bold text-slate-600">วันที่ / เวลา</th>
                        <th className="p-4 font-bold text-slate-600">อุปกรณ์</th>
                        <th className="p-4 font-bold text-slate-600">IP Address</th>
                        <th className="p-4 font-bold text-slate-600">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loginHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{new Date(history.createdAt).toLocaleString('th-TH')}</td>
                          <td className="p-4 text-slate-500">{history.deviceType || 'Web Browser'}</td>
                          <td className="p-4 font-mono text-xs text-slate-500">{history.ipAddress || 'Unknown'}</td>
                          <td className="p-4">
                            {history.status === 'SUCCESS' ? (
                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">สำเร็จ</span>
                            ) : (
                              <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded">ล้มเหลว</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">ยังไม่มีประวัติการบันทึก (ระบบเริ่มบันทึกหลังจากอัปเดตล่าสุด)</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ADVANCED' && (
          <div className="max-w-2xl animate-fade-in-up space-y-10">
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-2">การยืนยันตัวตนแบบสองขั้นตอน (2FA)</h2>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                การเปิดใช้งาน 2FA จะช่วยเพิ่มความปลอดภัยให้กับบัญชีของคุณ โดยต้องใช้รหัสผ่านและรหัสจากแอปพลิเคชัน (เช่น Google Authenticator) ในการเข้าสู่ระบบ
              </p>
              <Link href={`/account/support?topic=other&message=ต้องการเปิดใช้งาน 2FA (Two-factor Authentication) บนบัญชีของฉัน`} className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
                ติดต่อแอดมินเพื่อขอเปิดใช้งาน 2FA
              </Link>
            </div>

            <div className="border-t border-slate-200 pt-10">
              <h2 className="text-xl font-black text-red-600 mb-2">ลบบัญชีผู้ใช้ (Delete Account)</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                การลบบัญชีจะเป็นการลบข้อมูลส่วนตัว ประวัติการจอง และเอกสารทั้งหมดออกจากระบบอย่างถาวร หากคุณมีรายการจองที่กำลังดำเนินอยู่ จะไม่สามารถลบบัญชีได้จนกว่าการเดินทางจะสิ้นสุด
              </p>
              <button 
                onClick={handleDeleteRequest}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                ส่งคำขอลบบัญชี
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
