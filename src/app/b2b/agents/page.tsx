import { Search, Plus, Filter, MoreVertical, Building2, Mail, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SubAgentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*), role:roles(name)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser?.agent) redirect('/b2b');
  const agent = dbUser.agent;

  // Only owners or admins should see this page
  const userRole = dbUser?.role?.name || "CUSTOMER";
  if (userRole !== "AGENT_OWNER" && userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
    redirect('/b2b');
  }

  // Fetch sub-agents (users belonging to this agency)
  const { data: subAgentsData } = await supabase
    .from('users')
    .select('*, role:roles(name)')
    .eq('agentId', agent.id);

  const subAgents = subAgentsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> จัดการทีมงาน (Sub-agents)
          </h2>
          <p className="text-sm text-gray-500 mt-1">เพิ่มลบพนักงาน หรือลูกทีมที่สามารถใช้โควตาเครดิตร่วมกันได้ในบริษัท {agent.companyName}</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          เพิ่มพนักงาน (Add Staff)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">พนักงานในทีมทั้งหมด</p>
            <p className="text-3xl font-black text-gray-800 mt-1">{subAgents.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="font-black text-2xl">฿</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Credit Utilized</p>
            <p className="text-3xl font-black text-gray-800 mt-1">-</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, อีเมลพนักงาน..." 
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">ชื่อ-นามสกุลพนักงาน</th>
                <th className="px-6 py-4">อีเมลติดต่อ</th>
                <th className="px-6 py-4">บทบาท (Role)</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {subAgents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="font-bold text-gray-800">ยังไม่มีพนักงาน</p>
                  </td>
                </tr>
              ) : (
                subAgents.map((sa) => (
                  <tr key={sa.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{sa.name || "ไม่ระบุชื่อ"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {sa.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        sa.role?.name === 'AGENT_OWNER' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {sa.role?.name || "AGENT_STAFF"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-flex items-center justify-center">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
