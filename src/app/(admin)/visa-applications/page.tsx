export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function AdminVisaApplicationsPage() {
  const visas = await (prisma as any).visaApplication.findMany({
    include: { customer: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const statusColors: Record<string, string> = {
    SUBMITTED: '#3b82f6', UNDER_REVIEW: '#8b5cf6', DOCUMENTS_REQUIRED: '#f59e0b',
    APPROVED: '#16a34a', REJECTED: '#dc2626', DRAFT: '#94a3b8', CANCELLED: '#6b7280',
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', marginBottom: 24 }}>🛂 Visa Applications</h1>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Applicant</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Country</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Travel Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Submitted</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visas.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>ยังไม่มีคำขอวีซ่า</td></tr>
            ) : visas.map((v: any) => (
              <tr key={v.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{v.applicantName}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{v.customer?.email || '-'}</div>
                </td>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{v.country}</td>
                <td style={{ padding: '10px 16px', color: '#64748b' }}>
                  {v.travelDate ? new Date(v.travelDate).toLocaleDateString('th-TH') : '-'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: `${statusColors[v.status] || '#94a3b8'}20`, color: statusColors[v.status] || '#94a3b8' }}>
                    {v.status}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af' }}>
                  {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString('th-TH') : '-'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <VisaActionButtons id={v.id} currentStatus={v.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VisaActionButtons({ id, currentStatus }: { id: string; currentStatus: string }) {
  'use client';
  const actions = [];

  if (['SUBMITTED', 'DOCUMENTS_REQUIRED'].includes(currentStatus)) {
    actions.push({ label: '🔍 Review', status: 'UNDER_REVIEW', color: '#8b5cf6' });
  }
  if (['UNDER_REVIEW'].includes(currentStatus)) {
    actions.push({ label: '✅ Approve', status: 'APPROVED', color: '#16a34a' });
    actions.push({ label: '❌ Reject', status: 'REJECTED', color: '#dc2626' });
  }

  if (actions.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {actions.map(a => (
        <form key={a.status} action={`/api/visa/${id}`} method="POST">
          <button
            type="button"
            onClick={async () => {
              await fetch(`/api/visa/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: a.status }),
              });
              window.location.reload();
            }}
            style={{ padding: '4px 10px', borderRadius: 6, background: a.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
          >
            {a.label}
          </button>
        </form>
      ))}
    </div>
  );
}
