export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function CustomerOverviewPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      socialAccounts: true,
      preference: true,
      _count: { select: { bookings: true, supportTickets: true } }
    }
  })

  if (!customer) notFound()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      
      {/* Left Column: Quick Stats & Info */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">เธ เธฒเธเธฃเธงเธกเธชเธ–เธดเธ•เธด</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-indigo-600 mb-1">Bookings</p>
              <p className="text-2xl font-black text-indigo-900">{customer._count.bookings}</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-600 mb-1">Tickets</p>
              <p className="text-2xl font-black text-orange-900">{customer._count.supportTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">เธเนเธญเธเธ—เธฒเธเธ•เธดเธ”เธ•เนเธญ & Social</h2>
          {customer.socialAccounts.length > 0 ? (
            <div className="space-y-3">
              {customer.socialAccounts.map(s => (
                <div key={s.provider} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black capitalize ${s.provider === 'google' ? 'bg-red-500' : s.provider === 'line' ? 'bg-[#06C755]' : 'bg-blue-600'}`}>
                    {s.provider.substring(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 capitalize">{s.provider}</p>
                    <p className="text-[10px] text-slate-500 truncate">{s.providerEmail || s.displayName || 'Connected'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">เนเธกเนเธกเธตเธเธฑเธเธเธตเนเธเน€เธเธตเธขเธฅเน€เธเธทเนเธญเธกเธ•เนเธญ</p>
          )}
        </div>
      </div>

      {/* Right Column: Notes & Preferences */}
      <div className="lg:col-span-2 space-y-6">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Internal Notes (เธเธฑเธเธ—เธถเธเธ เธฒเธขเนเธ)</h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-xs font-bold">เนเธเนเนเธ</button>
          </div>
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 min-h-[100px]">
            {customer.internalNotes ? (
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{customer.internalNotes}</p>
            ) : (
              <p className="text-xs text-slate-400 italic">เธขเธฑเธเนเธกเนเธกเธตเธเธฑเธเธ—เธถเธเธ เธฒเธขเนเธเธชเธณเธซเธฃเธฑเธเธฅเธนเธเธเนเธฒเธฃเธฒเธขเธเธตเน</p>
            )}
          </div>
        </div>

        {customer.preference && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">Travel Preferences</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">เธเธฃเธฐเน€เธ—เธจเธ—เธตเนเธชเธเนเธ</p>
                <p className="font-medium text-slate-800">{customer.preference.preferredCountries.length > 0 ? customer.preference.preferredCountries.join(', ') : '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">เธเธเธเธฃเธฐเธกเธฒเธ“</p>
                <p className="font-medium text-slate-800">
                  {customer.preference.budgetMin ? `เธฟ${customer.preference.budgetMin.toLocaleString()}` : '0'} - 
                  {customer.preference.budgetMax ? `เธฟ${customer.preference.budgetMax.toLocaleString()}` : 'เนเธกเนเธเธณเธเธฑเธ”'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">เธเนเธญเธเธณเธเธฑเธ”เธญเธฒเธซเธฒเธฃ</p>
                <p className="font-medium text-slate-800">{customer.preference.mealPreference || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">เธเธงเธฒเธกเธ•เนเธญเธเธเธฒเธฃเธเธดเน€เธจเธฉ</p>
                <p className="font-medium text-slate-800 truncate">{customer.preference.specialNeeds || '-'}</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

