export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CustomerDocumentsPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      documents: { orderBy: { uploadedAt: 'desc' } }
    }
  })

  if (!customer) notFound()

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">เน€เธญเธเธชเธฒเธฃเธเธฃเธฐเธเธณเธ•เธฑเธงเนเธฅเธฐเธงเธตเธเนเธฒ</h2>
          <p className="text-xs text-slate-500 mt-1">เน€เธญเธเธชเธฒเธฃ Passport, Visa เธซเธฃเธทเธญเนเธเธฅเนเธชเนเธงเธเธ•เธฑเธงเธญเธทเนเธเน เธเธญเธเธฅเธนเธเธเนเธฒ</p>
        </div>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          + เธญเธฑเธเนเธซเธฅเธ”เน€เธญเธเธชเธฒเธฃ
        </button>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customer.documents.length > 0 ? (
          customer.documents.map(doc => (
            <div key={doc.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-40 bg-slate-100 relative flex items-center justify-center border-b border-slate-200">
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform">
                    เธ”เธนเนเธเธฅเน
                  </a>
                  <button className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform">
                    เธ”เธฒเธงเธเนเนเธซเธฅเธ”
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-slate-800 truncate" title={doc.fileName}>{doc.fileName}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                      doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{doc.documentType}</span>
                    {doc.fileSize && <span className="text-[10px] text-slate-400">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">เธญเธฑเธเนเธซเธฅเธ”เน€เธกเธทเนเธญ {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}</p>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">เธเธฑเธ”เธเธฒเธฃเธชเธ–เธฒเธเธฐ</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500">เธฅเธนเธเธเนเธฒเธขเธฑเธเนเธกเนเธกเธตเน€เธญเธเธชเธฒเธฃเนเธเธฃเธฐเธเธ</p>
          </div>
        )}
      </div>
    </div>
  )
}

