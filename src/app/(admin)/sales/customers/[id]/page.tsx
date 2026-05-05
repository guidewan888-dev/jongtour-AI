export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          tour: { select: { tourName: true } },
        },
      },
    },
  });

  if (!customer) return notFound();

  const totalSpent = customer.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const completedBookings = customer.bookings.filter(b => b.status === 'paid' || b.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <a href="/customers" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการลูกค้า</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">{customer.firstName} {customer.lastName}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            customer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>{customer.status}</span>
          {customer.tags?.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">{tag}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'อีเมล', value: customer.email },
          { label: 'เบอร์โทร', value: customer.phone || '-' },
          { label: 'จำนวน Booking', value: customer.bookings.length },
          { label: 'ยอดสะสม', value: `฿${totalSpent.toLocaleString()}` },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500">{item.label}</p>
            <p className="text-sm font-bold text-slate-800 mt-1 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">📇 ข้อมูลติดต่อ</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500 font-bold">Email:</span> <span className="text-slate-800">{customer.email}</span></div>
          <div><span className="text-slate-500 font-bold">Phone:</span> <span className="text-slate-800">{customer.phone || '-'}</span></div>
          <div><span className="text-slate-500 font-bold">LINE ID:</span> <span className="text-slate-800">{customer.lineId || '-'}</span></div>
          <div><span className="text-slate-500 font-bold">Lead Source:</span> <span className="text-slate-800">{customer.leadSource}</span></div>
          <div><span className="text-slate-500 font-bold">สมัครเมื่อ:</span> <span className="text-slate-800">{new Date(customer.createdAt).toLocaleDateString('th-TH')}</span></div>
        </div>
        {customer.internalNotes && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-bold text-amber-700 mb-1">📌 Internal Notes</p>
            <p className="text-sm text-amber-800">{customer.internalNotes}</p>
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">🎫 ประวัติการจอง ({customer.bookings.length})</h2>
        </div>
        {customer.bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มีประวัติการจอง</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Booking Ref</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ทัวร์</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ราคา</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันที่จอง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <a href={`/bookings/${b.bookingRef}`} className="font-mono font-bold text-blue-600 hover:underline">{b.bookingRef}</a>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{b.tour?.tourName || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold">฿{b.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
