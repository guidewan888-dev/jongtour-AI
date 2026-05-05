export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const roleStats = users.reduce((acc, u) => {
    acc[u.role.name] = (acc[u.role.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ผู้ใช้งาน & บทบาท</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการผู้ใช้ระบบทั้งหมด ({users.length} คน)</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(roleStats).map(([role, count]) => (
          <span key={role} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {role}: {count}
          </span>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีผู้ใช้</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">อีเมล</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">บทบาท</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">ต้องเปลี่ยน Password</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.role.name === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role.name === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{u.role.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">{u.mustChangePassword ? '⚠️ ใช่' : '✅ ไม่'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
