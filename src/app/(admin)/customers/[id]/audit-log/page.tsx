export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CustomerAuditLogPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      activityLogs: { orderBy: { createdAt: 'desc' } }
    }
  })

  // We also need to fetch Admin AuditLogs where resourceId is this customer ID
  const adminLogs = await prisma.auditLog.findMany({
    where: { resource: 'customers', resourceId: params.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  })

  if (!customer) notFound()

  // Combine and sort both logs
  const combinedLogs = [
    ...customer.activityLogs.map(log => ({
      id: log.id,
      date: log.createdAt,
      actor: 'CUSTOMER',
      actorId: customer.email,
      action: log.action,
      ipAddress: log.ipAddress,
      details: log.metadataJson
    })),
    ...adminLogs.map(log => ({
      id: log.id,
      date: log.createdAt,
      actor: 'ADMIN',
      actorId: log.user?.email || 'System',
      action: log.action,
      ipAddress: null,
      details: { old: log.oldValues, new: log.newValues }
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-slate-200">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Account Audit Log</h2>
        <p className="text-xs text-slate-500 mt-1">เธเธฑเธเธ—เธถเธเธเธงเธฒเธกเน€เธเธฅเธทเนเธญเธเนเธซเธงเธ—เธฑเนเธเธซเธกเธ”เนเธเธเธฑเธเธเธต (เธ—เธฑเนเธเธเธฑเนเธเธฅเธนเธเธเนเธฒเธ—เธณเน€เธญเธ เนเธฅเธฐเนเธญเธ”เธกเธดเธเนเธเนเนเธเนเธซเน)</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธงเธฑเธเน€เธงเธฅเธฒ (Date)</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเธนเนเธเธฃเธฐเธ—เธณ (Actor)</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเธฒเธฃเธเธฃเธฐเธ—เธณ (Action)</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธเนเธญเธกเธนเธฅเธญเนเธฒเธเธญเธดเธ (Details)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {combinedLogs.length > 0 ? (
              combinedLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{new Date(log.date).toLocaleDateString('th-TH')}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.date).toLocaleTimeString('th-TH')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                        log.actor === 'ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {log.actor}
                      </span>
                      <span className="text-xs text-slate-500 font-mono truncate max-w-[150px]" title={log.actorId}>{log.actorId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{log.action.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500">{log.ipAddress || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {log.details ? (
                        <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600">{JSON.stringify(log.details).substring(0, 50)}...</code>
                      ) : <span className="text-[10px] text-slate-400">-</span>}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                  เนเธกเนเธกเธตเธเธฑเธเธ—เธถเธเธเธงเธฒเธกเน€เธเธฅเธทเนเธญเธเนเธซเธง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

