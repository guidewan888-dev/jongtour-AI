export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CustomerPdpaPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      consent: true,
      consentLogs: { orderBy: { createdAt: 'desc' } }
    }
  })

  if (!customer) notFound()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      
      {/* Current Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">เธชเธ–เธฒเธเธฐเธเธงเธฒเธกเธขเธดเธเธขเธญเธกเธเธฑเธเธเธธเธเธฑเธ</h2>
          
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Privacy Policy & Terms</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${customer.consent?.privacyAccepted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="font-bold text-slate-800">{customer.consent?.privacyAccepted ? 'เธขเธญเธกเธฃเธฑเธเนเธฅเนเธง' : 'เธขเธฑเธเนเธกเนเธขเธญเธกเธฃเธฑเธ'}</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Marketing Consent (เธฃเธฑเธเธเนเธฒเธงเธชเธฒเธฃ)</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${customer.consent?.marketingConsent ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="font-bold text-slate-800">{customer.consent?.marketingConsent ? 'เธขเธดเธเธขเธญเธก' : 'เธเธเธดเน€เธชเธ'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Data Usage for AI (เธชเธดเธ—เธเธดเนเนเธเนเธเนเธญเธกเธนเธฅเนเธ AI)</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${customer.consent?.dataUsageConsent ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="font-bold text-slate-800">{customer.consent?.dataUsageConsent ? 'เธขเธดเธเธขเธญเธก' : 'เธเธเธดเน€เธชเธ'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 font-mono">Last IP: {customer.consent?.lastIpAddress || 'N/A'}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Updated: {customer.consent?.updatedAt ? new Date(customer.consent.updatedAt).toLocaleString('th-TH') : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Consent History Ledger */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธ (Consent Audit Trail)</h2>
            <p className="text-xs text-slate-500 mt-1">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธ”เน€เธเธฅเธตเนเธขเธเนเธเธฅเธเธเธงเธฒเธกเธขเธดเธเธขเธญเธกเธเธญเธเธฅเธนเธเธเนเธฒ เธ•เธฒเธกเธ.เธฃ.เธ. เธเธธเนเธกเธเธฃเธญเธเธเนเธญเธกเธนเธฅเธชเนเธงเธเธเธธเธเธเธฅ (PDPA)</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธงเธฑเธเน€เธงเธฅเธฒ (Timestamp)</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเธฃเธฐเน€เธ เธ— (Type)</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเธฒเธฃเธเธฃเธฐเธ—เธณ (Action)</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.consentLogs.length > 0 ? (
                  customer.consentLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{new Date(log.createdAt).toLocaleDateString('th-TH')}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.createdAt).toLocaleTimeString('th-TH')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {log.consentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-700">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] text-slate-500">{log.ipAddress || 'unknown'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเนเธเนเนเธเธเธงเธฒเธกเธขเธดเธเธขเธญเธก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}

