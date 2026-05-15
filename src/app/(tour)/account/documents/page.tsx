export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UploadDocumentClient from './UploadDocumentClient'
import DocumentResendButton from '@/components/user/DocumentResendButton'

export default async function CustomerDocumentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email }
  })

  if (!customer) redirect('/login')

  // Fetch customer uploaded documents
  const documents = await prisma.customerDocument.findMany({
    where: { customerId: customer.id },
    orderBy: { uploadedAt: 'desc' }
  })

  // Fetch active bookings with documents
  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    include: {
      tour: { select: { tourName: true } },
      invoices: { orderBy: { createdAt: 'desc' } },
      receipts: { orderBy: { createdAt: 'desc' } },
      vouchers: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  // Build downloadable documents list
  const downloadableDocs: { type: string; emoji: string; label: string; no: string; id: string; pdfUrl: string | null; createdAt: Date; bookingRef: string; tourName: string }[] = [];

  for (const b of bookings) {
    for (const inv of b.invoices) {
      downloadableDocs.push({
        type: 'INVOICE', emoji: '📄',
        label: (inv as any).invoiceType === 'DEPOSIT' ? 'Invoice (มัดจำ)' : (inv as any).invoiceType === 'BALANCE' ? 'Invoice (ยอดคงเหลือ)' : 'Invoice',
        no: inv.invoiceNo, id: inv.id, pdfUrl: (inv as any).pdfUrl, createdAt: inv.createdAt, bookingRef: b.bookingRef, tourName: b.tour.tourName,
      });
    }
    for (const rcp of b.receipts) {
      downloadableDocs.push({
        type: 'RECEIPT', emoji: '🧾', label: 'ใบเสร็จรับเงิน',
        no: rcp.receiptNo, id: rcp.id, pdfUrl: rcp.pdfUrl, createdAt: rcp.createdAt, bookingRef: b.bookingRef, tourName: b.tour.tourName,
      });
    }
    for (const vch of b.vouchers) {
      downloadableDocs.push({
        type: 'VOUCHER', emoji: '🎫', label: 'Travel Voucher',
        no: vch.voucherNo, id: vch.id, pdfUrl: vch.pdfUrl, createdAt: vch.createdAt, bookingRef: b.bookingRef, tourName: b.tour.tourName,
      });
    }
  }

  downloadableDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">📄 จัดการเอกสาร</h1>
          <p className="text-slate-500 text-sm mt-1">ดาวน์โหลดเอกสารการจอง และอัปโหลดเอกสารประกอบการเดินทาง</p>
        </div>
      </div>

      {/* Downloadable Documents Section */}
      {downloadableDocs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">📥 เอกสารของคุณ</h2>
            <p className="text-sm text-slate-500 mt-1">กดดาวน์โหลดเพื่อรับเอกสาร PDF</p>
          </div>
          <div className="divide-y divide-slate-100">
            {downloadableDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{doc.emoji}</span>
                  <div>
                    <div className="font-semibold text-slate-800">{doc.label}</div>
                    <div className="text-xs text-slate-500">
                      {doc.no} &bull; {doc.tourName} &bull; {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </div>
                {doc.pdfUrl ? (
                  <div className="flex items-center gap-2">
                    <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition no-underline">
                      ดาวน์โหลด
                    </a>
                    <DocumentResendButton
                      documentType={doc.type}
                      documentId={doc.id}
                      documentNo={doc.no}
                      pdfUrl={doc.pdfUrl}
                      customerEmail={customer.email || user.email || ''}
                      customerName={`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || user.email || 'ลูกค้า'}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">รอสร้าง PDF</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 items-start">
        <svg className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="text-sm font-medium text-indigo-900 leading-relaxed">
          <strong className="font-black">ข้อมูลของท่านถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย</strong> เอกสารที่อัปโหลดจะถูกใช้เพื่อการจองและออกตั๋วเดินทางเท่านั้น
        </div>
      </div>

      {/* Upload Section */}
      <UploadDocumentClient documents={documents} bookings={bookings.map(b => ({ id: b.id, bookingRef: b.bookingRef })) as any[]} />
    </div>
  )
}
