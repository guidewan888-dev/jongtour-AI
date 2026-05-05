'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/lib/auth.actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

export default function ProfileClient({ 
  customer, 
  profile,
  userEmail 
}: { 
  customer: any, 
  profile: any,
  userEmail: string
}) {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const prefs = profile?.preferences || {}

  async function clientAction(formData: FormData) {
    setErrorMsg('')
    setSuccessMsg('')
    const result = await updateProfile(formData)
    if (result?.error) {
      setErrorMsg(result.error)
    } else if (result?.success) {
      setSuccessMsg(result.success)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form action={clientAction} className="space-y-8">
      
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
          {successMsg}
        </div>
      )}

      {/* 1. Personal Information */}
      <div>
        <h3 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">1. ข้อมูลส่วนตัว (Personal Information)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ชื่อ (First Name)</label>
            <input name="firstName" type="text" defaultValue={customer?.firstName} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">นามสกุล (Last Name)</label>
            <input name="lastName" type="text" defaultValue={customer?.lastName} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">อีเมล (Email) - <span className="text-orange-500">เปลี่ยนอีเมลต้องยืนยันใหม่</span></label>
            <input name="email" type="email" defaultValue={userEmail} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">เบอร์โทรศัพท์ (Phone)</label>
            <input name="phone" type="tel" defaultValue={customer?.phone} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">LINE ID (Optional)</label>
            <input name="line_id" type="text" defaultValue={prefs.line_id} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">วันเกิด (Date of Birth) (Optional)</label>
            <input name="date_of_birth" type="date" defaultValue={prefs.date_of_birth} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">เพศ (Gender) (Optional)</label>
            <select name="gender" defaultValue={prefs.gender || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
              <option value="">ไม่ระบุ</option>
              <option value="male">ชาย (Male)</option>
              <option value="female">หญิง (Female)</option>
              <option value="other">อื่นๆ (Other)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div>
        <h3 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">2. ที่อยู่ติดต่อ (Contact Information)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ที่อยู่ (Address)</label>
            <textarea name="address" defaultValue={prefs.address} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"></textarea>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">จังหวัด (Province)</label>
            <input name="province" type="text" defaultValue={prefs.province} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">รหัสไปรษณีย์ (Postal Code)</label>
            <input name="postal_code" type="text" defaultValue={prefs.postal_code} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ประเทศ (Country)</label>
            <input name="country" type="text" defaultValue={prefs.country || 'Thailand'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
      </div>

      {/* 3. Emergency Contact */}
      <div>
        <h3 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">3. ผู้ติดต่อฉุกเฉิน (Emergency Contact)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ชื่อผู้ติดต่อ (Name)</label>
            <input name="emergency_name" type="text" defaultValue={prefs.emergency_name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">เบอร์โทรศัพท์ (Phone)</label>
            <input name="emergency_phone" type="text" defaultValue={prefs.emergency_phone} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ความสัมพันธ์ (Relationship)</label>
            <input name="emergency_relationship" type="text" defaultValue={prefs.emergency_relationship} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>
      </div>

      {/* 4. Travel Preferences */}
      <div>
        <h3 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">4. ความชอบในการเดินทาง (Travel Preferences)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">จุดหมายที่ชอบ (Preferred Destination)</label>
            <input name="preferred_destination" type="text" defaultValue={prefs.preferred_destination} placeholder="เช่น ญี่ปุ่น, ยุโรป" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">สายการบินที่ชอบ (Preferred Airline)</label>
            <input name="preferred_airline" type="text" defaultValue={prefs.preferred_airline} placeholder="เช่น Thai Airways" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ระดับโรงแรม (Hotel Level)</label>
            <select name="hotel_level" defaultValue={prefs.hotel_level || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
              <option value="">ไม่ระบุ</option>
              <option value="3-star">3 ดาว (มาตรฐาน)</option>
              <option value="4-star">4 ดาว (พรีเมียม)</option>
              <option value="5-star">5 ดาว (หรูหรา)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">อาหารพิเศษ (Meal Requirement)</label>
            <div className="flex flex-wrap gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="no_pork" defaultChecked={prefs.no_pork} className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">ไม่ทานหมู (No Pork)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="halal" defaultChecked={prefs.halal} className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">ฮาลาล (Halal)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="vegetarian" defaultChecked={prefs.vegetarian} className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">มังสวิรัติ (Vegetarian)</span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">ข้อมูลการแพ้อาหาร (Allergy Note)</label>
            <textarea name="allergy_note" defaultValue={prefs.allergy_note} rows={2} placeholder="เช่น แพ้กุ้ง, แพ้ถั่วลิสง" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500"></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <SubmitButton />
      </div>
      
    </form>
  )
}
