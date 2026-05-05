export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      sale: { select: { email: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  });

  if (!lead) return notFound();

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    CONTACTED: 'bg-amber-100 text-amber-700',
    QUOTED: 'bg-purple-100 text-purple-700',
    WON: 'bg-emerald-100 text-emerald-700',
    LOST: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/sales/leads" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการ Lead</a>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{lead.customerName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[lead.status] || 'bg-slate-100 text-slate-600'}`}>{lead.status}</span>
            <span className="text-sm text-slate-500">{lead.source}</span>
            {lead.sale && <span className="text-sm text-slate-500">• Assigned: {lead.sale.email}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">ข้อมูลติดต่อ</p>
          <p className="text-sm font-medium text-slate-800 mt-1">{lead.contactInfo}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">มูลค่าประมาณ</p>
          <p className="text-lg font-black text-emerald-700 mt-1">{lead.estimatedValue ? `฿${lead.estimatedValue.toLocaleString()}` : '-'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500">สร้างเมื่อ</p>
          <p className="text-sm font-medium text-slate-800 mt-1">{new Date(lead.createdAt).toLocaleString('th-TH')}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">📋 Activity Timeline</h2>
        {lead.activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm">ยังไม่มีกิจกรรม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lead.activities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  act.type === 'CALL' ? 'bg-blue-100 text-blue-600' :
                  act.type === 'CHAT' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {act.type === 'CALL' ? '📞' : act.type === 'CHAT' ? '💬' : '📧'}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{act.type}</span>
                    <span className="text-xs text-slate-400">{new Date(act.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{act.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
