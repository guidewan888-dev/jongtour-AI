"use client";

import { useState } from "react";
import { DollarSign, FileText, Download, Upload, TrendingUp, CreditCard, ArrowRight, ArrowUpRight, ArrowDownRight, Search, FileCheck } from "lucide-react";

export default function AdminFinancePage() {
  const transactions = [
    { id: "TX-99881", ref: "BK-12345678", date: "วันนี้ 10:30 น.", customer: "คุณสมชาย ใจดี", amount: 45900, method: "ธนาคารกสิกรไทย", type: "IN", status: "VERIFIED" },
    { id: "TX-99880", ref: "BK-99887766", date: "เมื่อวาน 14:15 น.", customer: "คุณสมชาย ใจดี", amount: 89900, method: "บัตรเครดิต", type: "IN", status: "VERIFIED" },
    { id: "TX-99879", ref: "BK-240405", date: "01 ต.ค. 26", customer: "คุณวิภาวรรณ สมบูรณ์", amount: 25900, method: "พร้อมเพย์", type: "IN", status: "VERIFIED" },
    { id: "WS-OUT-01", ref: "WT-EU-001", date: "30 ก.ย. 26", customer: "Wholesale A (เยอรมัน)", amount: 75000, method: "โอนระหว่างประเทศ", type: "OUT", status: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">การเงิน & เอกสาร (Finance & Documents)</h2>
          <p className="text-gray-500">จัดการรายรับ-รายจ่าย ตรวจสลิป ใบแจ้งหนี้ และใบเสร็จรับเงิน</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm">
            <Upload className="w-4 h-4" /> อัปโหลด Statement
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-sm">
            <FileText className="w-4 h-4" /> ออกใบกำกับภาษี
          </button>
        </div>
      </div>

      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">เดือนนี้</span>
          </div>
          <p className="text-sm font-bold text-green-800">รายรับรวม (เงินเข้า)</p>
          <h3 className="text-3xl font-black text-green-900 mt-1">฿845,200</h3>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">จ่าย Wholesale</span>
          </div>
          <p className="text-sm font-bold text-red-800">รายจ่ายรวม (เงินออก)</p>
          <h3 className="text-3xl font-black text-red-900 mt-1">฿520,000</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">ประมาณการ</span>
          </div>
          <p className="text-sm font-bold text-blue-800">กำไรเบื้องต้น (Gross Profit)</p>
          <h3 className="text-3xl font-black text-blue-900 mt-1">฿325,200</h3>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">รายการเดินบัญชีล่าสุด (Recent Transactions)</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="ค้นหาเลขอ้างอิง..." className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">วัน-เวลา</th>
                <th className="p-4 font-bold">เลขอ้างอิง / คู่ค้า</th>
                <th className="p-4 font-bold">ช่องทาง</th>
                <th className="p-4 font-bold text-right">จำนวนเงิน</th>
                <th className="p-4 font-bold">สถานะ / เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-gray-600 text-xs">{t.id}</td>
                  <td className="p-4 text-gray-500">{t.date}</td>
                  <td className="p-4">
                    <p className="font-bold text-indigo-600">{t.ref}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.customer}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <CreditCard className="w-4 h-4 text-gray-400" /> {t.method}
                    </div>
                  </td>
                  <td className={`p-4 font-bold text-right ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'IN' ? '+' : '-'}฿{t.amount.toLocaleString()}
                  </td>
                  <td className="p-4 flex gap-2">
                    <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded text-[10px] font-bold">
                      {t.status}
                    </span>
                    {t.type === 'IN' && (
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors" title="ดู Invoice">
                        <FileCheck className="w-4 h-4" />
                      </button>
                    )}
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
