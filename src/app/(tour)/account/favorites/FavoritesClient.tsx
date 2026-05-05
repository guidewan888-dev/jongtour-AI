'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { removeFavoriteTour } from '@/lib/customer.actions'

type FavoriteTour = {
  id: string
  tourId: string
  code: string
  title: string
  imageUrl: string
  price: number
  destination: string
  durationDays: number
  durationNights: number
}

export default function FavoritesClient({ favorites }: { favorites: FavoriteTour[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const toggleSelection = (tourId: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(tourId)) {
      newSelection.delete(tourId)
    } else {
      if (newSelection.size >= 3) {
        alert('เปรียบเทียบได้สูงสุด 3 ทัวร์พร้อมกัน')
        return
      }
      newSelection.add(tourId)
    }
    setSelectedIds(newSelection)
  }

  const handleRemove = async (tourId: string) => {
    if (confirm('ยืนยันที่จะลบออกจากการบันทึกใช่หรือไม่?')) {
      setIsRemoving(tourId)
      await removeFavoriteTour(tourId)
      setIsRemoving(null)
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">ยังไม่มีทัวร์ที่บันทึกไว้</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
          หากคุณพบแพ็กเกจทัวร์ที่สนใจ สามารถกดไอคอนหัวใจเพื่อเก็บไว้เปรียบเทียบหรือตัดสินใจภายหลังได้
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/tours" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
            ค้นหาทัวร์
          </Link>
          <Link href="/account/ai-chats" className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
            ให้ AI ช่วยแนะนำ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-24 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600">
            เลือกเพื่อเปรียบเทียบ <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded ml-1">{selectedIds.size}/3</span>
          </span>
        </div>
        <button 
          disabled={selectedIds.size < 2}
          onClick={() => window.location.href = `/account/compare?ids=${Array.from(selectedIds).join(',')}`}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ${selectedIds.size >= 2 ? 'bg-slate-800 hover:bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h3a2 2 0 002-2zm0 0V9a2 2 0 012-2h3a2 2 0 012 2v10m-2 0a2 2 0 002 2h3a2 2 0 002-2V11a2 2 0 00-2-2h-3a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          เปรียบเทียบรายการที่เลือก
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favorites.map(tour => {
          const isSelected = selectedIds.has(tour.tourId)
          return (
            <div key={tour.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm transition-all relative ${isSelected ? 'ring-4 ring-rose-500 border-transparent' : 'border border-slate-200 hover:border-rose-300'}`}>
              
              {/* Checkbox overlay */}
              <div className="absolute top-4 left-4 z-20">
                <button 
                  onClick={() => toggleSelection(tour.tourId)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md border-2 ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/90 border-slate-300 text-transparent hover:border-rose-400 backdrop-blur-sm'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
              </div>

              {/* Remove button */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => handleRemove(tour.tourId)}
                  disabled={isRemoving === tour.tourId}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-md transition-colors"
                  title="Remove from favorites"
                >
                  {isRemoving === tour.tourId ? (
                     <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>

              <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden cursor-pointer" onClick={() => toggleSelection(tour.tourId)}>
                <img src={tour.imageUrl} alt={tour.title} className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-105' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                   <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 px-2 py-0.5 rounded text-white mb-2 inline-block">{tour.destination}</span>
                        <h3 className="font-black text-lg line-clamp-2 leading-tight drop-shadow-md">{tour.title}</h3>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-4 border-b border-slate-100 pb-4">
                  <span>{tour.code}</span>
                  <span>{tour.durationDays} วัน {tour.durationNights} คืน</span>
                </div>

                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">ราคาเริ่มต้น</span>
                  <span className="text-xl font-black text-rose-600">฿{tour.price.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/tours/${tour.code}#departures`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold text-center transition-colors">
                    เช็กรอบเดินทาง
                  </Link>
                  <Link href={`/tours/${tour.code}`} className="bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold text-center shadow-sm transition-colors">
                    จองทัวร์ (Book Now)
                  </Link>
                  <Link href={`/account/support?topic=quotation&tourId=${tour.tourId}`} className="col-span-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    ขอใบเสนอราคา (Get Quote)
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
