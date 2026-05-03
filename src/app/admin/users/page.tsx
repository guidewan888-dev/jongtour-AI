import Link from "next/link";
import { Shield, Key, UserCheck, Search, Users, Activity, FileText } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function UserRoleManagementPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const activeTab = searchParams.tab || "users";
  const searchQuery = searchParams.q || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const tabs = [
    { id: "users", name: "Users", icon: Users },
    { id: "roles", name: "Roles", icon: Shield },
    { id: "permissions", name: "Permissions", icon: Key },
    { id: "audit-logs", name: "Audit Logs", icon: FileText },
  ];

  let activeData: any = null;

  if (activeTab === "users") {
    const { data: usersData } = await supabase
      .from('users')
      .select('*, role:roles(name)')
      .order('createdAt', { ascending: false });
    activeData = usersData;
  } else if (activeTab === "roles") {
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*, _count:users(count)')
      .order('createdAt', { ascending: true });
    
    // In Supabase JS, counting related tables sometimes returns an array or object. Let's just manually fetch counts or assume it's there.
    // Alternatively we can fetch users and group by roleId.
    const { data: allUsers } = await supabase.from('users').select('roleId');
    const roleCounts = allUsers?.reduce((acc: any, curr: any) => {
      acc[curr.roleId] = (acc[curr.roleId] || 0) + 1;
      return acc;
    }, {});
    
    activeData = rolesData?.map(r => ({ ...r, userCount: roleCounts?.[r.id] || 0 }));
  } else if (activeTab === "audit-logs") {
    const { data: auditLogsData } = await supabase
      .from('audit_logs')
      .select('*, user:users(email)')
      .order('createdAt', { ascending: false })
      .limit(50);
    activeData = auditLogsData;
  }

  // Handle Search Filtering
  if (searchQuery && activeData) {
    const q = searchQuery.toLowerCase();
    if (activeTab === "users") {
      activeData = activeData.filter((u: any) => 
        u.email?.toLowerCase().includes(q) || 
        u.role?.name?.toLowerCase().includes(q)
      );
    } else if (activeTab === "roles") {
      activeData = activeData.filter((r: any) => 
        r.name?.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ผู้ใช้งาน & สิทธิ์ (Users & Permissions)</h2>
          <p className="text-gray-500">จัดการข้อมูลผู้ใช้งาน กำหนดบทบาท และสิทธิ์การเข้าถึงระบบต่างๆ</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors shadow-orange-500/20">
          + Add New {tabs.find(t => t.id === activeTab)?.name}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                  ${isActive ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Filters */}
        <form className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <input type="hidden" name="tab" value={activeTab} />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder={`Search in ${tabs.find(t => t.id === activeTab)?.name}...`} 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
            ค้นหา
          </button>
        </form>

        {/* Content Area */}
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Joined At</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeData && activeData.length > 0 ? activeData.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-bold w-max ${
                        u.role?.name === 'SUPER_ADMIN' ? 'text-purple-700 bg-purple-100' :
                        u.role?.name === 'ADMIN' ? 'text-blue-700 bg-blue-100' :
                        u.role?.name === 'AGENT' ? 'text-emerald-700 bg-emerald-100' :
                        'text-gray-700 bg-gray-100'
                      }`}>
                        <Shield size={12}/> {u.role?.name || "CUSTOMER"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold mr-3">Edit</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบผู้ใช้งาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'roles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Role Name</th>
                  <th className="px-6 py-4 font-bold">Description</th>
                  <th className="px-6 py-4 font-bold">Active Users</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeData && activeData.length > 0 ? activeData.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                      <Shield size={16} className="text-orange-500"/> {r.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{r.description || "ไม่ระบุ"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400"/>
                        <span className="font-bold">{r.userCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold mr-3">Edit</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">ไม่พบบทบาท</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'audit-logs' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeData && activeData.length > 0 ? activeData.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{log.user?.email || "System"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.action === 'CREATE' ? 'text-green-600 bg-green-50' : 
                        log.action === 'DELETE' ? 'text-red-600 bg-red-50' : 
                        'text-blue-600 bg-blue-50'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {log.resource} / {log.resourceId}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">ไม่พบประวัติการใช้งาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 h-[400px]">
            {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              ส่วนการจัดการ: {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <p className="max-w-md text-sm">
              กำลังเชื่อมต่อฐานข้อมูลสำหรับ {tabs.find(t => t.id === activeTab)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
