export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">บทบาท & สิทธิ์ (Roles & Permissions)</h1>
        <p className="text-sm text-slate-500 mt-1">จัดการบทบาทและสิทธิ์การเข้าถึงระบบ</p>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-lg font-bold text-slate-700">ยังไม่มีบทบาท</p>
          <p className="text-sm text-slate-500">กรุณาสร้างบทบาทเริ่มต้นผ่าน Prisma seed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    role.name === 'SUPER_ADMIN' ? 'bg-purple-100' :
                    role.name === 'ADMIN' ? 'bg-blue-100' :
                    role.name === 'SALE_MANAGER' ? 'bg-amber-100' :
                    'bg-slate-100'
                  }`}>
                    {role.name === 'SUPER_ADMIN' ? '👑' : role.name === 'ADMIN' ? '🔧' : '👤'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{role.name}</h3>
                    <p className="text-xs text-slate-500">{role.description || 'ไม่มีคำอธิบาย'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                  {role._count.users} ผู้ใช้
                </span>
              </div>

              {role.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((p) => (
                    <span key={p.id} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                      {p.action}:{p.resource}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">ยังไม่ได้กำหนดสิทธิ์</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
