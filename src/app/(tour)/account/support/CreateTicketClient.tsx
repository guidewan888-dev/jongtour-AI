'use client'

import React, { useState } from 'react'
import { createSupportTicket } from '@/lib/support.actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? 'กำลังส่งข้อมูล...' : 'เปิด Ticket แจ้งปัญหา'}
    </button>
  )
}

export default function CreateTicketClient({ prefilledTopic, prefilledRef }: { prefilledTopic: string, prefilledRef: string }) {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    setSuccessMsg('')
    const result = await createSupportTicket(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.success) {
      setSuccessMsg(`ส่งคำร้องสำเร็จ! หมายเลข Ticket: ${result.ticketId}`)
      // Optional: redirect to ticket detail page
      window.location.href = `/account/support/${result.ticketId}`
    }
  }

  return (
    <form action={clientAction} className="space-y-5">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">หัวข้อ / หมวดหมู่ปัญหา <span className="text-red-500">*</span></label>
          <select 
            name="topic" 
            defaultValue={prefilledTopic || ''}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50"
          >
            <option value="" disabled>-- เลือกหมวดหมู่ --</option>
            <option value="booking">ปัญหาการจอง (Booking Issue)</option>
            <option value="payment">ปัญหาการชำระเงิน (Payment Issue)</option>
            <option value="tax_invoice">ขอใบกำกับภาษี (Tax Invoice)</option>
            <option value="modify_quotation">ขอแก้ไขใบเสนอราคา (Quotation)</option>
            <option value="private_group">ทัวร์ส่วนตัว (Private Group)</option>
            <option value="ai_booking_assist">ให้เจ้าหน้าที่ช่วยจอง (Booking Assist)</option>
            <option value="other">อื่นๆ (Others)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">เลขอ้างอิงที่เกี่ยวข้อง (ถ้ามี)</label>
          <input 
            type="text" 
            name="bookingRef"
            defaultValue={prefilledRef || ''}
            placeholder="Booking No., Invoice, or Quotation Ref"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium bg-slate-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ระดับความสำคัญ</label>
        <div className="flex gap-4">
           <label className="flex items-center gap-2 cursor-pointer">
             <input type="radio" name="priority" value="NORMAL" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
             <span className="text-sm font-bold text-slate-700">ปกติ (Normal)</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer">
             <input type="radio" name="priority" value="URGENT" className="text-red-600 focus:ring-red-500" />
             <span className="text-sm font-bold text-red-600">ด่วน (Urgent)</span>
           </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">รายละเอียด <span className="text-red-500">*</span></label>
        <textarea 
          name="message" 
          required
          rows={5}
          placeholder="อธิบายรายละเอียดปัญหาหรือความต้องการของคุณ..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium bg-slate-50"
        ></textarea>
      </div>

      <SubmitButton />
    </form>
  )
}
