import { Shield, Key, UserCheck, Search } from 'lucide-react';

export default function UserRoleManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User & Permission Management</h1>
          <p className="text-sm text-gray-500">จัดการข้อมูลผู้ใช้งาน กำหนด Role และสิทธิ์การเข้าถึงระบบต่างๆ</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors">
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none">
              <option>All Roles</option>
              <option>SUPER_ADMIN</option>
              <option>ADMIN</option>
              <option>SALE</option>
              <option>AGENT</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Name / Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Subdomain Access</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@jongtour.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1 text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs font-bold w-max">
                  <Shield size={12}/> SUPER_ADMIN
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">All Systems (*.jongtour.com)</td>
              <td className="px-6 py-4"><span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-bold">ACTIVE</span></td>
              <td className="px-6 py-4 text-right">
                <button className="text-orange-500 hover:text-orange-700 font-medium text-xs">Edit</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-800">Sale Team 1</p>
                <p className="text-xs text-gray-500">sale1@jongtour.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold w-max">
                  <UserCheck size={12}/> SALE
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">sale.jongtour.com</td>
              <td className="px-6 py-4"><span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-bold">ACTIVE</span></td>
              <td className="px-6 py-4 text-right">
                <button className="text-orange-500 hover:text-orange-700 font-medium text-xs">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
