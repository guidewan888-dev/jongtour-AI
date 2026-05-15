import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function asJsonPreview(value: unknown, max = 180): string {
  if (!value) return '-';
  try {
    const raw = JSON.stringify(value);
    return raw.length > max ? `${raw.slice(0, max)}...` : raw;
  } catch {
    return '-';
  }
}

export default async function AdminBookingSnapshotsPage() {
  const bookings = await prisma.booking.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      tour: { select: { tourCode: true, tourName: true } },
      centralSnapshot: true,
    },
  });

  const total = bookings.length;
  const withBookingSeatSnapshot = bookings.filter((b: any) => !!b.seatSnapshot).length;
  const withBookingPdfUrl = bookings.filter((b: any) => !!b.pdfUrl).length;
  const withChildSnapshot = bookings.filter((b: any) => !!b.centralSnapshot).length;
  const withChildSeatSnapshot = bookings.filter((b: any) => !!b.centralSnapshot?.seatSnapshot).length;
  const withChildPdfUrl = bookings.filter((b: any) => !!b.centralSnapshot?.pdfUrl).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Snapshot Audit</h1>
          <p className="mt-1 text-sm text-slate-500">Check snapshot completeness in booking and booking_central_snapshots.</p>
        </div>
        <Link href="/bookings" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          Back To Bookings
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Rows" value={total} />
        <Stat label="Booking seat_snapshot" value={withBookingSeatSnapshot} />
        <Stat label="Booking pdf_url" value={withBookingPdfUrl} />
        <Stat label="Child snapshots" value={withChildSnapshot} />
        <Stat label="Child seat_snapshot" value={withChildSeatSnapshot} />
        <Stat label="Child pdf_url" value={withChildPdfUrl} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-800">Recent Bookings (latest 200)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Booking</th>
                <th className="px-3 py-2 text-left">Tour</th>
                <th className="px-3 py-2 text-left">Central IDs</th>
                <th className="px-3 py-2 text-left">Booking seat/pdf</th>
                <th className="px-3 py-2 text-left">Child snapshot</th>
                <th className="px-3 py-2 text-left">Price Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((row: any) => (
                <tr key={row.id} className="align-top border-t border-slate-100">
                  <td className="whitespace-nowrap px-3 py-2">{new Date(row.createdAt).toLocaleString('th-TH')}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-800">{row.bookingRef}</div>
                    <div className="text-slate-400">{row.status}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{row.tour?.tourCode || '-'}</div>
                    <div className="text-slate-500">{row.tour?.tourName || '-'}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      booking.central_tour_id: <span className="font-mono">{row.centralTourId || '-'}</span>
                    </div>
                    <div>
                      booking.central_departure_id: <span className="font-mono">{row.centralDepartureId || '-'}</span>
                    </div>
                    <div>
                      child.central_tour_id: <span className="font-mono">{row.centralSnapshot?.centralTourId || '-'}</span>
                    </div>
                    <div>
                      child.central_departure_id: <span className="font-mono">{row.centralSnapshot?.centralDepartureId || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={row.seatSnapshot ? 'text-emerald-700' : 'text-amber-700'}>
                      seat_snapshot: {row.seatSnapshot ? 'OK' : 'MISSING'}
                    </div>
                    <div className={row.pdfUrl ? 'text-emerald-700' : 'text-amber-700'}>
                      pdf_url: {row.pdfUrl ? 'OK' : 'MISSING'}
                    </div>
                    <div className="mt-1 break-all text-slate-500">{row.pdfUrl || '-'}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={row.centralSnapshot ? 'text-emerald-700' : 'text-amber-700'}>
                      row: {row.centralSnapshot ? 'OK' : 'MISSING'}
                    </div>
                    <div className={row.centralSnapshot?.seatSnapshot ? 'text-emerald-700' : 'text-amber-700'}>
                      seat_snapshot: {row.centralSnapshot?.seatSnapshot ? 'OK' : 'MISSING'}
                    </div>
                    <div className={row.centralSnapshot?.pdfUrl ? 'text-emerald-700' : 'text-amber-700'}>
                      pdf_url: {row.centralSnapshot?.pdfUrl ? 'OK' : 'MISSING'}
                    </div>
                    <div className="mt-1 break-all text-slate-500">{row.centralSnapshot?.pdfUrl || '-'}</div>
                  </td>
                  <td className="font-mono text-[11px] text-slate-600 px-3 py-2">{asJsonPreview(row.centralSnapshot?.priceSnapshot || null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value.toLocaleString()}</div>
    </div>
  );
}
