'use client'

import React, { useState, useRef } from 'react'
import { uploadCustomerDocument, deleteCustomerDocument } from '@/lib/document.actions'

type DocumentData = {
  id: string
  bookingId: string | null
  documentType: string
  fileUrl: string
  fileName: string
  status: string
  rejectionReason: string | null
  uploadedAt: Date
}

export default function UploadDocumentClient({ documents, bookings }: { documents: DocumentData[], bookings: { id: string, bookingNo: string }[] }) {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)
    const result = await uploadCustomerDocument(formData)

    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('อัปโหลดเอกสารสำเร็จ')
      if (formRef.current) formRef.current.reset()
    }
    setIsUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันการลบเอกสารนี้ใช่หรือไม่?')) {
      setDeletingId(id)
      await deleteCustomerDocument(id)
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-orange-200">รอตรวจสอบ (Pending)</span>
      case 'APPROVED': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-200">ตรวจสอบแล้ว (Approved)</span>
      case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-red-200">เอกสารไม่ผ่าน (Rejected)</span>
      default: return null
    }
  }

  const getDocTypeName = (type: string) => {
    switch(type) {
      case 'PASSPORT': return 'หนังสือเดินทาง (Passport)'
      case 'VISA': return 'เอกสารวีซ่า (Visa)'
      case 'PAYMENT_SLIP': return 'หลักฐานการชำระเงิน (Slip)'
      default: return 'เอกสารอื่นๆ (Other)'
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
           <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
           อัปโหลดเอกสารใหม่
        </h2>

        <form ref={formRef} onSubmit={handleUpload} className="space-y-5">
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
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ประเภทเอกสาร <span className="text-red-500">*</span></label>
              <select 
                name="documentType" 
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 bg-slate-50"
              >
                <option value="" disabled defaultValue="">-- เลือกประเภทเอกสาร --</option>
                <option value="PASSPORT">หนังสือเดินทาง (Passport)</option>
                <option value="VISA">เอกสารวีซ่า (Visa)</option>
                <option value="PAYMENT_SLIP">หลักฐานการชำระเงิน (Payment Slip)</option>
                <option value="OTHER">เอกสารอื่นๆ (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">อ้างอิงการจอง (ถ้ามี)</label>
              <select 
                name="bookingId"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium bg-slate-50"
              >
                <option value="">ไม่ระบุ / ใช้กับหลายการจอง</option>
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>Booking: {b.bookingNo}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ไฟล์เอกสาร <span className="text-red-500">*</span></label>
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                name="file" 
                ref={fileInputRef} 
                className="hidden" 
                required 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                     const fileLabel = document.getElementById('file-label')
                     if (fileLabel) fileLabel.innerText = e.target.files[0].name
                  }
                }}
              />
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p id="file-label" className="text-sm font-bold text-slate-600">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
              <p className="text-xs font-medium text-slate-400 mt-1">รองรับ JPG, PNG, PDF ขนาดไม่เกิน 10MB</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> กำลังอัปโหลด...</>
            ) : 'อัปโหลดเอกสาร'}
          </button>
        </form>
      </div>

      {/* Document List */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">เอกสารที่อัปโหลดแล้ว</h2>
        
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors shadow-sm group flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(doc.status)}
                  </div>
                  <h3 className="text-sm font-black text-slate-800 truncate" title={doc.fileName}>{doc.fileName}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">{getDocTypeName(doc.documentType)}</p>
                  
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <p className="text-xs font-medium text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">เหตุผล: {doc.rejectionReason}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4 text-xs font-bold">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ดูไฟล์
                    </a>
                    {doc.status !== 'APPROVED' && (
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        {deletingId === doc.id ? 'กำลังลบ...' : 'ลบไฟล์'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium text-sm">ยังไม่มีเอกสารที่อัปโหลดไว้</p>
          </div>
        )}
      </div>

    </div>
  )
}
