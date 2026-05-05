'use client'

import React, { useState } from 'react'
import Link from 'next/link'

type CustomerData = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  tags: string[]
  leadSource: string
  _count: { bookings: number }
  socialAccounts: { provider: string }[]
  createdAt: Date
}

export default function CustomersListClient({ customers }: { customers: CustomerData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      
      {/* Top Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">ทุกสถานะ (All)</option>
            <option value="ACTIVE">ปกติ (Active)</option>
            <option value="INACTIVE">ไม่เคลื่อนไหว (Inactive)</option>
            <option value="BANNED">ระงับการใช้งาน (Banned)</option>
          </select>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          เพิ่มลูกค้าใหม่
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">ข้อมูลลูกค้า</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">ติดต่อ</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">สถิติ</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Tags / Source</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0 border border-indigo-200">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {customer.id.substring(customer.id.length - 6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{customer.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{customer.phone}</p>
                      {customer.socialAccounts.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {customer.socialAccounts.map(s => (
                            <span key={s.provider} className={`text-[10px] px-1.5 rounded uppercase font-bold text-white ${s.provider === 'google' ? 'bg-red-500' : s.provider === 'line' ? 'bg-[#06C755]' : 'bg-blue-600'}`}>{s.provider}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{customer._count.bookings} Bookings</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Joined: {new Date(customer.createdAt).toLocaleDateString('th-TH')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {customer.tags.length > 0 ? (
                           <div className="flex flex-wrap gap-1">
                             {customer.tags.map(tag => (
                               <span key={tag} className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">{tag}</span>
                             ))}
                           </div>
                        ) : <span className="text-[10px] text-slate-400">-</span>}
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full capitalize">{customer.leadSource}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                        customer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        customer.status === 'INACTIVE' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/customers/${customer.id}/overview`}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm transition-all"
                      >
                        ดูข้อมูล <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    ไม่พบข้อมูลลูกค้าที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>แสดง {filteredCustomers.length} รายการ จากทั้งหมด {customers.length} รายการ</span>
        </div>
      </div>

    </div>
  )
}
