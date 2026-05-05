'use client'

import React, { useState } from 'react'
import { replyToTicket } from '@/lib/support.actions'
import { useFormStatus } from 'react-dom'

function SubmitReplyButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    </button>
  )
}

export default function TicketReplyClient({ ticketId, isClosed }: { ticketId: string, isClosed: boolean }) {
  const [errorMsg, setErrorMsg] = useState('')

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    const message = formData.get('message') as string
    if (!message.trim()) return

    const result = await replyToTicket(formData)
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      // Clear form on success
      const form = document.getElementById('replyForm') as HTMLFormElement
      if (form) form.reset()
    }
  }

  if (isClosed) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-sm font-bold text-slate-500">
        Ticket นี้ถูกปิดแล้ว ไม่สามารถส่งข้อความเพิ่มเติมได้ หากมีปัญหาใหม่กรุณาเปิด Ticket ใหม่
      </div>
    )
  }

  return (
    <form id="replyForm" action={clientAction} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6">
      {errorMsg && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
          {errorMsg}
        </div>
      )}
      <input type="hidden" name="ticketId" value={ticketId} />
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <textarea 
            name="message" 
            required
            rows={3}
            placeholder="พิมพ์ข้อความตอบกลับหรือส่งข้อมูลเพิ่มเติม..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium bg-slate-50"
          ></textarea>
        </div>
        <div className="flex flex-col justify-end">
          <SubmitReplyButton />
        </div>
      </div>
    </form>
  )
}
