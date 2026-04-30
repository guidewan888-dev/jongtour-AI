"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Shield, Users, Edit, Trash2, Plus } from "lucide-react";

export default function RolesSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            สิทธิ์การเข้าถึง (Roles & Permissions)
          </h2>
          <p className="text-gray-500 mt-1">จัดการบัญชีผู้ดูแลระบบ และกำหนดสิทธิ์การใช้งานแต่ละส่วน</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-red-500" /> รายชื่อทีมงาน</h3>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20">
            <Plus className="w-4 h-4" /> เพิ่มพนักงาน
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
              <th className="p-4 font-bold">อีเมล</th>
              <th className="p-4 font-bold">Role (สิทธิ์)</th>
              <th className="p-4 font-bold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="p-4 font-bold text-gray-900">แอดมิน หลัก (You)</td>
              <td className="p-4 text-gray-600">admin@jongtour.com</td>
              <td className="p-4"><span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">Super Admin</span></td>
              <td className="p-4 text-center text-gray-300">-</td>
            </tr>
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="p-4 font-bold text-gray-900">พนักงาน บัญชี</td>
              <td className="p-4 text-gray-600">finance@jongtour.com</td>
              <td className="p-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">Finance</span></td>
              <td className="p-4 text-center">
                <div className="flex justify-center gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-red-50/30 transition-colors">
              <td className="p-4 font-bold text-gray-900">พนักงาน ขาย 1</td>
              <td className="p-4 text-gray-600">sales1@jongtour.com</td>
              <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">Sales</span></td>
              <td className="p-4 text-center">
                <div className="flex justify-center gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
