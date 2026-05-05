'use client'

import React, { useState } from 'react'
import { updateConsentStatus, requestDataExport, safeRequestAccountDeletion } from '@/lib/pdpa.actions'

type ConsentData = {
  privacyAccepted: boolean
  marketingConsent: boolean
  dataUsageConsent: boolean
}

type ConsentLog = {
  id: string
  action: string
  consentType: string
  createdAt: Date
}

export default function PdpaClient({ initialConsent, logs }: { initialConsent: ConsentData | null, logs: ConsentLog[] }) {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isProcessingExport, setIsProcessingExport] = useState(false)
  const [isProcessingDelete, setIsProcessingDelete] = useState(false)

  const handleToggle = async (type: string, currentValue: boolean) => {
    // Optimistic or direct server call. Here we do direct form submission essentially.
    setErrorMsg('')
    setSuccessMsg('')
    
    const formData = new FormData()
    formData.append('type', type)
    formData.append('value', (!currentValue).toString())

    const result = await updateConsentStatus(formData)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('บันทึกการเปลี่ยนแปลงสิทธิ์สำเร็จ')
    }
  }

  const handleExport = async () => {
    if (confirm('ระบบจะรวบรวมข้อมูลส่วนบุคคลของคุณทั้งหมดและส่งลิงก์ดาวน์โหลดให้ทางอีเมลภายใน 3 วันทำการ ยืนยันการส่งคำขอ?')) {
      setIsProcessingExport(true)
      const result = await requestDataExport()
      if (result.error) {
         setErrorMsg(result.error)
      } else {
         setSuccessMsg(`ส่งคำขอสำเร็จ เจ้าหน้าที่จะติดต่อกลับผ่าน Support Ticket: ${result.ticketId}`)
      }
      setIsProcessingExport(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('คำเตือน: การลบข้อมูลเป็นสิทธิของคุณตาม PDPA แต่ระบบจะไม่สามารถลบข้อมูลได้หากคุณยังมีรายการจองหรือยอดค้างชำระ ยืนยันการส่งคำขอตรวจสอบสิทธิ?')) {
      setIsProcessingDelete(true)
      const result = await safeRequestAccountDeletion()
      if (result.error) {
         setErrorMsg(result.error)
      } else {
         setSuccessMsg(`ส่งคำขอสำเร็จ เจ้าหน้าที่จะตรวจสอบเงื่อนไขและติดต่อกลับผ่าน Support Ticket: ${result.ticketId}`)
      }
      setIsProcessingDelete(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {successMsg}
        </div>
      )}

      {/* Section 1: Consent Toggles */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">การจัดการความยินยอม (Consent Status)</h2>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          
          <div className="flex items-start justify-between gap-4 p-4 border border-slate-100 bg-slate-50 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">ข้อตกลงและนโยบายความเป็นส่วนตัว (Privacy Policy)</p>
              <p className="text-xs text-slate-500 mt-1">ยินยอมให้เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการให้บริการจองทัวร์ (จำเป็น)</p>
            </div>
            <div className="shrink-0 mt-1">
              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">ยอมรับแล้ว (บังคับ)</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800 text-sm">การรับข้อมูลข่าวสาร (Marketing Consent)</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">ยินยอมให้เราส่งข้อเสนอโปรโมชั่น ทัวร์ลดราคา และสิทธิพิเศษต่างๆ ผ่านทางอีเมล, โทรศัพท์, หรือ SMS (คุณสามารถยกเลิกได้ตลอดเวลาโดยไม่มีผลกระทบต่อการจอง)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
              <input type="checkbox" className="sr-only peer" checked={initialConsent?.marketingConsent || false} onChange={() => handleToggle('MARKETING', initialConsent?.marketingConsent || false)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="font-bold text-slate-800 text-sm">การนำข้อมูลไปวิเคราะห์ (Data Usage Consent)</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">ยินยอมให้ระบบ AI นำพฤติกรรมการค้นหาและการเดินทางของคุณไปวิเคราะห์ เพื่อปรับปรุงประสบการณ์และนำเสนอโปรแกรมทัวร์ที่เหมาะสมกับคุณมากที่สุด</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
              <input type="checkbox" className="sr-only peer" checked={initialConsent?.dataUsageConsent || false} onChange={() => handleToggle('DATA_USAGE', initialConsent?.dataUsageConsent || false)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Section 2: Data Rights (PDPA) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">สิทธิของเจ้าของข้อมูลส่วนบุคคล (Data Rights)</h2>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) คุณมีสิทธิ์ที่จะขอเข้าถึง รับสำเนา โอนย้าย หรือลบข้อมูลส่วนบุคคลที่ทางบริษัทฯ จัดเก็บไว้
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <h3 className="text-sm font-black text-slate-800 mb-2">ขอสำเนาข้อมูล (Data Export)</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">ขอรับสำเนาข้อมูลการจอง ประวัติการเดินทาง และข้อมูลบัญชีในรูปแบบไฟล์ที่สามารถนำไปใช้งานต่อได้</p>
              <button 
                onClick={handleExport}
                disabled={isProcessingExport}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isProcessingExport ? 'กำลังส่งคำขอ...' : 'ส่งคำขอข้อมูล'}
              </button>
            </div>
            <div className="border border-red-100 bg-red-50/30 rounded-2xl p-5 hover:border-red-200 transition-colors">
              <h3 className="text-sm font-black text-red-600 mb-2">ลบข้อมูลบัญชี (Delete Data)</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">ขอให้ทำลายหรือลบข้อมูลส่วนบุคคลทั้งหมดออกจากระบบอย่างถาวร (ไม่สามารถทำได้หากมียอดค้างชำระ)</p>
              <button 
                onClick={handleDelete}
                disabled={isProcessingDelete}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isProcessingDelete ? 'กำลังส่งคำขอ...' : 'ส่งคำขอลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Consent Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">ประวัติการให้ความยินยอม (Consent History)</h2>
        </div>
        
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">วัน-เวลา</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">หัวข้อ</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => {
                  const isOptIn = log.action.includes('OPT_IN')
                  const typeName = log.consentType === 'PRIVACY' ? 'Privacy Policy' : 
                                   log.consentType === 'MARKETING' ? 'Marketing Consent' : 'Data Usage Consent'
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-600 text-xs">{new Date(log.createdAt).toLocaleString('th-TH')}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs">{typeName}</td>
                      <td className="p-4">
                        {isOptIn ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">ยอมรับ (Opt-in)</span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">ยกเลิก (Opt-out)</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-500">ไม่มีประวัติการเปลี่ยนแปลงความยินยอม</p>
          </div>
        )}
      </div>

    </div>
  )
}
