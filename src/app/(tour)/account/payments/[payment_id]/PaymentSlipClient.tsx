'use client'

import React, { useState } from 'react'
import { uploadSlip } from '@/lib/payment.actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? 'Uploading...' : 'Confirm Upload'}
    </button>
  )
}

export default function PaymentSlipClient({ paymentId, verificationStatus }: { paymentId: string, verificationStatus: string }) {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File is too large. Maximum size is 5MB.')
        setPreview(null)
        e.target.value = ''
        return
      }
      setErrorMsg('')
      setPreview(URL.createObjectURL(file))
    }
  }

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    setSuccessMsg('')
    const result = await uploadSlip(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.success) {
      setSuccessMsg(result.success)
    }
  }

  if (verificationStatus === 'VERIFIED') {
    return (
       <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
         </div>
         <h3 className="text-emerald-800 font-black text-lg mb-1">ยอดเงินได้รับการยืนยันแล้ว</h3>
         <p className="text-emerald-600 text-sm font-medium">แอดมินตรวจสอบยอดเงินของคุณเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ Jongtour</p>
       </div>
    )
  }

  return (
    <form action={clientAction} className="space-y-4">
      <input type="hidden" name="paymentId" value={paymentId} />
      
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
          {successMsg}
        </div>
      )}

      {verificationStatus === 'UPLOADED' && !successMsg && (
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm font-bold mb-4">
          อัปโหลดสลิปแล้ว กำลังรอแอดมินตรวจสอบยอดเงิน (Awaiting Verification)
        </div>
      )}

      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-orange-300 transition-colors relative bg-slate-50 overflow-hidden">
        {preview ? (
          <img src={preview} alt="Slip Preview" className="mx-auto max-h-64 rounded-xl shadow-sm object-contain relative z-10" />
        ) : (
          <div className="py-8">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <p className="text-sm font-bold text-slate-600">คลิก หรือ ลากไฟล์สลิปมาวางที่นี่</p>
            <p className="text-xs text-slate-400 mt-1">รองรับ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
          </div>
        )}
        <input 
          type="file" 
          name="slip" 
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileChange}
          required
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
        />
      </div>

      <SubmitButton />
    </form>
  )
}
