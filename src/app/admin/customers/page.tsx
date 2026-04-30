"use client";

import { useState } from "react";
import { Search, Filter, Mail, Phone, Crown, MapPin, MoreHorizontal, Download } from "lucide-react";

export default function AdminCustomersPage() {
  const customers = [
    { id: "C-00120", name: "คุณสมชาย ใจดี", email: "somchai@email.com", phone: "081-234-5678", tier: "Platinum", coins: 15200, spent: 450000, bookings: 8, lastActive: "วันนี้ 10:45 น." },
    { id: "C-00542", name: "คุณวิภาวรรณ สมบูรณ์", email: "wipawan@email.com", phone: "089-876-5432", tier: "Gold", coins: 8500, spent: 185000, bookings: 4, lastActive: "เมื่อวาน 15:30 น." },
    { id: "C-00891", name: "คุณธนาธร สว่างจิต", email: "thanatorn@email.com", phone: "092-345-6789", tier: "Silver", coins: 2100, spent: 89000, bookings: 2, lastActive: "09 ต.ค. 26" },
    { id: "C-01024", name: "คุณแพรวา สุขใจ", email: "pearwa@email.com", phone: "086-111-2222", tier: "Bronze", coins: 500, spent: 45000, bookings: 1, lastActive: "05 ต.ค. 26" },
    { id: "C-01025", name: "นพดล ทองแท้", email: "noppadon@email.com", phone: "081-999-8888", tier: "Bronze", coins: 0, spent: 0, bookings: 1, lastActive: "28 ก.ย. 26" },
  ];

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Platinum': return 'bg-slate-900 text-slate-100 ring-slate-300';
      case 'Gold': return 'bg-yellow-100 text-yellow-700 ring-yellow-400';
      case 'Silver': return 'bg-gray-100 text-gray-700 ring-gray-300';
      case 'Bronze': return 'bg-orange-50 text-orange-700 ring-orange-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ลูกค้าสมาชิก (Customers CRM)</h2>
          <p className="text-gray-500">จัดการข้อมูลลูกค้า ระดับสมาชิก และพอยท์สะสม</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">ลูกค้าทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">1,025 <span className="text-sm font-normal text-green-500">+12%</span></h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Platinum Members</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">48 <span className="text-sm font-normal text-green-500">+2</span></h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">ยอดสั่งซื้อเฉลี่ย / คน</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">฿45,200</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Jongtour Coins (System)</p>
          <h3 className="text-2xl font-bold text-yellow-500 mt-1">1.2M</h3>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 font-bold">ข้อมูลลูกค้า</th>
                <th className="p-4 font-bold">ระดับสมาชิก (Tier)</th>
                <th className="p-4 font-bold">Coins</th>
                <th className="p-4 font-bold">ยอดใช้จ่ายรวม</th>
                <th className="p-4 font-bold">ประวัติการจอง</th>
                <th className="p-4 font-bold">ใช้งานล่าสุด</th>
                <th className="p-4 font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset flex items-center w-fit gap-1 ${getTierColor(c.tier)}`}>
                      <Crown className="w-3 h-3" /> {c.tier}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-yellow-600">{c.coins.toLocaleString()}</td>
                  <td className="p-4 font-bold text-gray-900">฿{c.spent.toLocaleString()}</td>
                  <td className="p-4 font-medium text-gray-600">{c.bookings} รายการ</td>
                  <td className="p-4 text-gray-500 text-xs">{c.lastActive}</td>
                  <td className="p-4 text-center">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
