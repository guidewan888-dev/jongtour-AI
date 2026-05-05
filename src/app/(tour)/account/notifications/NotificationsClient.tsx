'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/customer.actions'
import { useRouter } from 'next/navigation'

type NotificationData = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  linkUrl: string | null
  createdAt: Date
}

export default function NotificationsClient({ notifications }: { notifications: NotificationData[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('ALL')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead
    if (filter === 'ALL') return true
    return n.type === filter
  })

  const getIconForType = (type: string) => {
    switch (type) {
      case 'BOOKING': return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
      case 'PAYMENT': return <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
      case 'SYSTEM': return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
      case 'CUSTOMER': return <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div>
    }
  }

  const handleNotificationClick = async (notif: NotificationData) => {
    if (!notif.isRead) {
      setMarkingId(notif.id)
      await markNotificationAsRead(notif.id)
      setMarkingId(null)
    }
    if (notif.linkUrl) {
      router.push(notif.linkUrl)
    }
  }

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return
    setMarkingAll(true)
    await markAllNotificationsAsRead()
    setMarkingAll(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            ทั้งหมด
          </button>
          <button 
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === 'UNREAD' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === 'UNREAD' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'}`}>{unreadCount}</span>
            )}
          </button>
          <button 
            onClick={() => setFilter('BOOKING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'BOOKING' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            การจอง (Bookings)
          </button>
          <button 
            onClick={() => setFilter('PAYMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'PAYMENT' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            การชำระเงิน (Payments)
          </button>
        </div>
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markingAll}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${unreadCount > 0 ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}
        >
          {markingAll ? (
             <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          )}
          ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
        </button>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50'}`}
              >
                {getIconForType(notif.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className={`font-black text-sm md:text-base ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('th-TH')} {new Date(notif.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  {notif.linkUrl && (
                    <span className="inline-block mt-3 text-xs font-bold text-orange-500 group-hover:text-orange-600 group-hover:underline">
                      ดูรายละเอียด &rarr;
                    </span>
                  )}
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mt-2 shrink-0 shadow-sm" title="ยังไม่อ่าน"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6 border border-slate-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">ไม่มีการแจ้งเตือน</h3>
          <p className="text-slate-500 font-medium">
            {filter === 'ALL' ? 'คุณยังไม่ได้รับการแจ้งเตือนใดๆ ในขณะนี้' : `ไม่มีการแจ้งเตือนในหมวดหมู่ '${filter}'`}
          </p>
          {filter !== 'ALL' && (
            <button onClick={() => setFilter('ALL')} className="mt-6 text-sm font-bold text-orange-500 hover:underline">
              ดูการแจ้งเตือนทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  )
}
