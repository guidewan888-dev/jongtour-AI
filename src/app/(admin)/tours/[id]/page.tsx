export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TourDetailAdminPage({ params }: { params: { id: string } }) {
  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      supplier: { select: { displayName: true, canonicalName: true } },
      destinations: true,
      images: { take: 10 },
      departures: {
        orderBy: { startDate: 'asc' },
        take: 20,
        include: { prices: true },
      },
    },
  });

  if (!tour) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/tours" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการทัวร์</Link>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{tour.tourName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{tour.tourCode}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${tour.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{tour.status}</span>
            <span className="text-sm text-slate-500">Supplier: {tour.supplier?.displayName || '-'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">ระยะเวลา</p>
          <p className="text-xl font-black text-slate-800 mt-1">{tour.durationDays}D{tour.durationNights}N</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">Departures</p>
          <p className="text-xl font-black text-slate-800 mt-1">{tour.departures.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">ประเภท</p>
          <p className="text-xl font-black text-slate-800 mt-1">{tour.tourType}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">รูปภาพ</p>
          <p className="text-xl font-black text-slate-800 mt-1">{tour.images.length}</p>
        </div>
      </div>

      {/* Destinations */}
      {tour.destinations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3">📍 จุดหมายปลายทาง</h2>
          <div className="flex flex-wrap gap-2">
            {tour.destinations.map((d) => (
              <span key={d.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {d.country} {d.city ? `/ ${d.city}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Departures + Prices */}
      {tour.departures.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">🗓️ รอบเดินทาง + ราคา</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันออกเดินทาง</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">วันกลับ</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ที่นั่งว่าง</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ราคาผู้ใหญ่</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">ราคาเด็ก</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tour.departures.map((dep) => {
                const adultPrice = dep.prices?.find((p: any) => p.paxType === 'ADULT')?.sellingPrice;
                const childPrice = dep.prices?.find((p: any) => p.paxType === 'CHILD')?.sellingPrice;
                return (
                  <tr key={dep.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{new Date(dep.startDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3">{new Date(dep.endDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 text-right font-bold">{dep.remainingSeats}/{dep.totalSeats}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{adultPrice ? `฿${adultPrice.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right">{childPrice ? `฿${childPrice.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        dep.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                        dep.status === 'FULL' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{dep.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-3">🔗 Links</h2>
        <div className="space-y-2 text-sm">
          {tour.sourceUrl && <p><span className="font-bold text-slate-600 w-32 inline-block">Source:</span> <a href={tour.sourceUrl} target="_blank" className="text-blue-600 hover:underline">{tour.sourceUrl}</a></p>}
          {tour.bookingUrl && <p><span className="font-bold text-slate-600 w-32 inline-block">Booking:</span> <a href={tour.bookingUrl} target="_blank" className="text-blue-600 hover:underline">{tour.bookingUrl}</a></p>}
          {tour.wholesaleTourUrl && <p><span className="font-bold text-slate-600 w-32 inline-block">Wholesale:</span> <a href={tour.wholesaleTourUrl} target="_blank" className="text-blue-600 hover:underline">{tour.wholesaleTourUrl}</a></p>}
        </div>
      </div>
    </div>
  );
}
