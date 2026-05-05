export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany({
    orderBy: { key: 'asc' },
  });

  const grouped = settings.reduce((acc, s) => {
    const category = s.key.split('.')[0] || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(s);
    return acc;
  }, {} as Record<string, typeof settings>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-sm text-slate-500 mt-1">การตั้งค่าทั่วไปของระบบ Jongtour</p>
      </div>

      {settings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">⚙️</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีการตั้งค่า</p>
          <p className="text-sm text-slate-500">การตั้งค่าจะถูกสร้างขึ้นเมื่อระบบเริ่มใช้งาน</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{category}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((s) => (
                <div key={s.id} className="px-6 py-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-bold text-slate-800">{s.key}</p>
                    {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{s.type}</span>
                    <span className="text-sm font-medium text-slate-700 max-w-[300px] truncate">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
