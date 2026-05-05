import React from "react";
import { Shield, Users, Key, Lock } from "lucide-react";

const roles = [
  { name: "Super Admin", users: 2, perms: "ทุกสิทธิ์", color: "bg-red-100 text-red-700" },
  { name: "Admin", users: 5, perms: "จัดการทัวร์, Booking, ลูกค้า", color: "bg-blue-100 text-blue-700" },
  { name: "Sales", users: 8, perms: "สร้าง Booking, ดูลูกค้า, Quotation", color: "bg-purple-100 text-purple-700" },
  { name: "Agent", users: 12, perms: "ค้นหาทัวร์, สร้าง Booking (B2B)", color: "bg-amber-100 text-amber-700" },
  { name: "Content", users: 3, perms: "จัดการ Blog, CMS, Landing Pages", color: "bg-emerald-100 text-emerald-700" },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Permissions & Roles</h1>
        <p className="text-slate-500 text-sm mt-1">จัดการสิทธิ์การเข้าถึงระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{r.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> {r.users} users</div>
              </div>
            </div>
            <p className="text-sm text-slate-500">{r.perms}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Role-Based Access Control (RBAC)</p>
          <p className="text-blue-600">ระบบใช้ RBAC เพื่อควบคุมสิทธิ์ แต่ละ role กำหนดว่าเข้าถึงเมนูไหนได้บ้าง</p>
        </div>
      </div>
    </div>
  );
}
