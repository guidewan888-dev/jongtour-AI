export const dynamic = 'force-dynamic';
import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerBookingsPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  })

  if (!customer) notFound()

  const bookings = await prisma.booking.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tour: { select: { tourName: true, tourCode: true } },
      departure: { select: { startDate: true } }
    }
  })

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธญเธเธ—เธฑเนเธเธซเธกเธ” ({bookings.length})</h2>
        <Link href="/admin/bookings/create" className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          + เธชเธฃเนเธฒเธ Booking เนเธซเธกเน
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Booking No.</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เนเธเนเธเน€เธเธเธ—เธฑเธงเธฃเน</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธงเธฑเธเธ—เธตเนเน€เธ”เธดเธเธ—เธฒเธ</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธขเธญเธ”เธฃเธงเธก</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">เธชเธ–เธฒเธเธฐ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length > 0 ? (
              bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/bookings/${booking.id}`} className="font-bold text-indigo-600 hover:underline">
                      {booking.bookingRef}
                    </Link>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(booking.createdAt).toLocaleDateString('th-TH')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 truncate max-w-[250px]">{booking.tour?.tourName || 'Manual Booking'}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{booking.tour?.tourCode || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">
                      {booking.departure?.startDate ? new Date(booking.departure.startDate).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800">เธฟ{booking.totalPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' : 
                      'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                  เธฅเธนเธเธเนเธฒเธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธญเธเธ—เธฑเธงเธฃเน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

