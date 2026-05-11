export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AlertTriangle, Eye, MapPin } from 'lucide-react';

export default async function HumanReviewPage() {
  const [queueItems, fallbackTours] = await Promise.all([
    prisma.aiReviewQueue.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 100,
    }),
    prisma.tour.findMany({
      where: {
        OR: [
          { status: 'DRAFT' },
          { bookingUrl: null },
          { linkHealthStatus: { in: ['BROKEN', 'MISSING'] } },
        ],
      },
      select: {
        id: true,
        tourCode: true,
        tourName: true,
        supplierId: true,
        status: true,
        linkHealthStatus: true,
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const queueRows = queueItems.map((item) => ({
    id: item.id,
    tourLabel: String((item.payload as any)?.tourCode || (item.payload as any)?.tourName || item.description),
    supplier: String((item.payload as any)?.supplier || 'unknown'),
    issue: item.description,
    priority: item.type === 'supplier_check' ? 'high' : item.type === 'link_check' ? 'medium' : 'low',
    createdAt: item.createdAt.toISOString(),
    source: 'ai_queue',
  }));

  const fallbackRows = fallbackTours.map((tour) => ({
    id: tour.id,
    tourLabel: `${tour.tourCode} — ${tour.tourName}`,
    supplier: tour.supplierId,
    issue:
      tour.status === 'DRAFT'
        ? 'สถานะยังเป็น DRAFT'
        : tour.linkHealthStatus === 'BROKEN' || tour.linkHealthStatus === 'MISSING'
          ? `ลิงก์มีปัญหา (${tour.linkHealthStatus})`
          : 'ยังไม่มี booking URL',
    priority:
      tour.linkHealthStatus === 'BROKEN'
        ? 'high'
        : tour.linkHealthStatus === 'MISSING'
          ? 'medium'
          : 'low',
    createdAt: new Date().toISOString(),
    source: 'tour_integrity',
  }));

  const rows = [...queueRows, ...fallbackRows].slice(0, 200);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Human Review Queue</h1>
          <p className="text-slate-500 text-sm mt-1">คิวตรวจสอบจริงจาก AI Queue และคุณภาพข้อมูลทัวร์</p>
        </div>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
          {rows.length} รายการรอตรวจ
        </span>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            ยังไม่มีรายการที่ต้อง human review
          </div>
        ) : (
          rows.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.priority === 'high' ? 'bg-red-100' : item.priority === 'medium' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <AlertTriangle className={`w-5 h-5 ${item.priority === 'high' ? 'text-red-600' : item.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.tourLabel}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {item.supplier}
                    </p>
                    <p className="text-sm text-red-600 mt-2 font-medium">⚠️ {item.issue}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(item.createdAt).toLocaleString('th-TH')} • {item.source}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={item.source === 'ai_queue' ? '/ai-center/review-queue' : '/tour-management'}
                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors"
                    title="Review"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
