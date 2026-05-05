export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

const STAGES = [
  { key: 'NEW', label: 'Lead ใหม่', color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { key: 'CONTACTED', label: 'ติดต่อแล้ว', color: 'border-amber-400 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  { key: 'QUOTED', label: 'ส่งใบเสนอราคา', color: 'border-purple-400 bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  { key: 'WON', label: 'ปิดการขาย ✅', color: 'border-emerald-400 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'LOST', label: 'ไม่สำเร็จ', color: 'border-red-400 bg-red-50', badge: 'bg-red-100 text-red-700' },
];

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { sale: { select: { email: true } } },
  });

  const grouped = STAGES.map(stage => ({
    ...stage,
    leads: leads.filter(l => l.status === stage.key),
    totalValue: leads.filter(l => l.status === stage.key).reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Sales Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">Kanban view ของ Lead ทั้งหมด ({leads.length} leads)</p>
      </div>

      <div className="grid grid-cols-5 gap-4 min-h-[600px]">
        {grouped.map((stage) => (
          <div key={stage.key} className={`${stage.color} border-t-4 rounded-2xl p-3`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-700">{stage.label}</h3>
              <span className={`${stage.badge} px-2 py-0.5 rounded-full text-xs font-bold`}>{stage.leads.length}</span>
            </div>
            {stage.totalValue > 0 && (
              <p className="text-xs font-bold text-slate-500 mb-3">฿{stage.totalValue.toLocaleString()}</p>
            )}
            <div className="space-y-2">
              {stage.leads.map((lead) => (
                <a key={lead.id} href={`/sales/leads/${lead.id}`} className="block bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                  <p className="font-bold text-sm text-slate-800 truncate">{lead.customerName}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{lead.contactInfo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400">{lead.source}</span>
                    {lead.estimatedValue ? (
                      <span className="text-xs font-bold text-emerald-600">฿{lead.estimatedValue.toLocaleString()}</span>
                    ) : null}
                  </div>
                  {lead.sale && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">👤 {lead.sale.email}</p>
                  )}
                </a>
              ))}
              {stage.leads.length === 0 && (
                <div className="text-center py-8 text-slate-300 text-xs">ว่าง</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
