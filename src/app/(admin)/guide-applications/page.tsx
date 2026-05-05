export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6', SCREENING: '#8b5cf6', INTERVIEW_SCHEDULED: '#f59e0b',
  INTERVIEWED: '#6366f1', ACCEPTED: '#16a34a', REJECTED: '#dc2626',
};

export default async function AdminGuideApplicationsPage() {
  const apps = await (prisma as any).guideApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginBottom: 24 }}>👤 Guide Applications</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 24 }}>
        {['NEW', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'].map(s => {
          const count = apps.filter((a: any) => a.status === s).length;
          return (
            <div key={s} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: STATUS_COLORS[s] }}>{count}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Position</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Languages</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Contact</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Applied</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>ยังไม่มีใบสมัคร</td></tr>
            ) : apps.map((a: any) => {
              const langs = Array.isArray(a.languages) ? a.languages.join(', ') : '-';
              return (
                <tr key={a.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{a.fullName}</div>
                    {a.licenseNo && <div style={{ fontSize: 11, color: '#9ca3af' }}>TAT: {a.licenseNo}</div>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>{a.position}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>{langs}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontSize: 12 }}>{a.email}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.phone}</div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: `${STATUS_COLORS[a.status] || '#94a3b8'}20`, color: STATUS_COLORS[a.status] || '#94a3b8' }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af' }}>
                    {new Date(a.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <GuideActionButtons id={a.id} status={a.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuideActionButtons({ id, status }: { id: string; status: string }) {
  'use client';
  const actions: { label: string; status: string; color: string; needsDate?: boolean }[] = [];

  if (status === 'NEW') {
    actions.push({ label: '🔍 Screen', status: 'SCREENING', color: '#8b5cf6' });
  }
  if (status === 'SCREENING') {
    actions.push({ label: '📅 Schedule', status: 'INTERVIEW_SCHEDULED', color: '#f59e0b', needsDate: true });
    actions.push({ label: '❌ Reject', status: 'REJECTED', color: '#dc2626' });
  }
  if (status === 'INTERVIEW_SCHEDULED') {
    actions.push({ label: '🎤 Done', status: 'INTERVIEWED', color: '#6366f1' });
  }
  if (status === 'INTERVIEWED') {
    actions.push({ label: '✅ Accept', status: 'ACCEPTED', color: '#16a34a' });
    actions.push({ label: '❌ Reject', status: 'REJECTED', color: '#dc2626' });
  }

  if (actions.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {actions.map(a => (
        <button key={a.status}
          onClick={async () => {
            let interviewDate;
            if (a.needsDate) {
              const date = prompt('Interview date (YYYY-MM-DD):');
              if (!date) return;
              interviewDate = date;
            }
            await fetch(`/api/careers/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: a.status, interviewDate }),
            });
            window.location.reload();
          }}
          style={{ padding: '4px 10px', borderRadius: 6, background: a.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
