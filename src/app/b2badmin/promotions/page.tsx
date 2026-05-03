import { Plus, Tag, Calendar, MoreVertical } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Promotions & Coupons</h2>
          <p className="text-sm text-slate-500">จัดการโค้ดส่วนลดและโปรโมชันสำหรับเอเจนซี่</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          Create New Promo
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Promo Code</th>
              <th className="px-6 py-4">Name / Description</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Valid Period</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  ไม่มีข้อมูลโปรโมชันในระบบ
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1 w-max">
                      <Tag size={12} /> {promo.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{promo.name}</p>
                    {promo.description && <p className="text-xs text-slate-500 mt-1">{promo.description}</p>}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `฿${promo.value}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
