export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function AppointmentsPage() {
  // Upcoming departures as "appointments" (tours departing soon)
  const upcomingDepartures = await prisma.departure.findMany({
    where: {
      startDate: { gte: new Date() },
      status: 'AVAILABLE',
    },
    orderBy: { startDate: 'asc' },
    take: 30,
    include: {
      tour: { select: { tourName: true, tourCode: true } },
      supplier: { select: { displayName: true } },
      bookings: { select: { id: true, status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ตารางเดินทาง (Appointments)</h1>
        <p className="text-sm text-slate-500 mt-1">รอบเดินทางที่กำลังจะมาถึง ({upcomingDepartures.length} รอบ)</p>
      </div>

      {upcomingDepartures.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-lg font-bold text-slate-700">ไม่มีรอบเดินทางที่กำลังจะมาถึง</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันเดินทาง</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันกลับ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">รหัส</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ทัวร์</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Supplier</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ที่นั่ง</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingDepartures.map((dep) => {
                const daysUntil = Math.ceil((new Date(dep.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={dep.id} className={`hover:bg-slate-50 ${daysUntil <= 7 ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3 font-medium">
                      {new Date(dep.startDate).toLocaleDateString('th-TH')}
                      {daysUntil <= 7 && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">{daysUntil}d</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(dep.endDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{dep.tour?.tourCode}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{dep.tour?.tourName}</td>
                    <td className="px-4 py-3 text-slate-500">{dep.supplier?.displayName}</td>
                    <td className="px-4 py-3 text-right font-bold">{dep.remainingSeats}/{dep.totalSeats}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{dep.bookings?.length || 0}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
