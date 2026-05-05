'use client'

import React, { useState } from 'react'
import { upsertCustomerPreference } from '@/lib/preference.actions'

type PreferenceData = {
  preferredCountries: string[]
  travelStyle: string[]
  hotelLevel: string[]
  airlinePreference: string[]
  budgetMin: number | null
  budgetMax: number | null
  mealPreference: string | null
  specialNeeds: string | null
  marketingConsent: boolean
  dealAlerts: boolean
}

export default function PreferencesClient({ initialData }: { initialData: PreferenceData | null }) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)
    
    // Checkboxes array mapping hack is handled in server action via getAll()
    // Need to explicitly add dealAlerts / marketingConsent if checked, 
    // but the server action expects 'true' string or absence.
    
    // Map checkboxes for marketing
    formData.set('marketingConsent', (e.currentTarget.elements.namedItem('marketingConsent') as HTMLInputElement).checked ? 'true' : 'false')
    formData.set('dealAlerts', (e.currentTarget.elements.namedItem('dealAlerts') as HTMLInputElement).checked ? 'true' : 'false')

    const result = await upsertCustomerPreference(formData)

    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('บันทึกข้อมูลความสนใจเรียบร้อยแล้ว AI และพนักงานจะนำไปปรับปรุงการนำเสนอทัวร์ให้คุณครับ')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      
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

      {/* Section 1: Destinations & Budget */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">จุดหมายปลายทางและงบประมาณ</h2>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ประเทศที่สนใจ (คั่นด้วยลูกน้ำ)</label>
            <input 
              type="text" 
              name="preferredCountries" 
              defaultValue={initialData?.preferredCountries?.join(', ') || ''}
              placeholder="เช่น ญี่ปุ่น, ยุโรป, สวิตเซอร์แลนด์" 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-2">AI จะใช้ข้อมูลนี้แนะนำโปรแกรมทัวร์ใหม่ๆ ในประเทศเหล่านี้ให้คุณ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">งบประมาณเริ่มต้น (บาท/ท่าน)</label>
              <input 
                type="number" 
                name="budgetMin" 
                defaultValue={initialData?.budgetMin || ''}
                placeholder="0" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">งบประมาณสูงสุด (บาท/ท่าน)</label>
              <input 
                type="number" 
                name="budgetMax" 
                defaultValue={initialData?.budgetMax || ''}
                placeholder="50000" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Travel Style */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">สไตล์การท่องเที่ยว (Travel Style)</h2>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">รูปแบบการเดินทางที่ชอบ (เลือกได้มากกว่า 1)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['RELAXING', 'ADVENTURE', 'CULTURE', 'SHOPPING', 'LUXURY', 'FAMILY'].map(style => {
                const isChecked = initialData?.travelStyle?.includes(style) || false
                const label = style === 'RELAXING' ? 'พักผ่อนชิลๆ' : 
                              style === 'ADVENTURE' ? 'ผจญภัยลุยๆ' : 
                              style === 'CULTURE' ? 'เน้นวัฒนธรรม' : 
                              style === 'SHOPPING' ? 'สายช้อปปิ้ง' : 
                              style === 'LUXURY' ? 'หรูหราพรีเมียม' : 'เที่ยวแบบครอบครัว'
                return (
                  <label key={style} className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" name="travelStyle" value={style} defaultChecked={isChecked} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">ระดับที่พัก (Hotel Level)</label>
              <div className="space-y-3">
                {['3_STAR', '4_STAR', '5_STAR'].map(level => {
                  const isChecked = initialData?.hotelLevel?.includes(level) || false
                  return (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="hotelLevel" value={level} defaultChecked={isChecked} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm font-bold text-slate-700">{level.replace('_', ' ').replace('STAR', 'ดาว')}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">ความชื่นชอบสายการบิน (Airlines)</label>
              <div className="space-y-3">
                {['FULL_SERVICE', 'LOW_COST'].map(airline => {
                  const isChecked = initialData?.airlinePreference?.includes(airline) || false
                  const label = airline === 'FULL_SERVICE' ? 'Full Service (เช่น การบินไทย, Emirates)' : 'Low Cost (เช่น AirAsia, Scoot)'
                  return (
                    <label key={airline} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="airlinePreference" value={airline} defaultChecked={isChecked} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Special Needs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h2 className="text-base font-black text-slate-800">ความต้องการพิเศษ (Special Needs)</h2>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">อาหารและความเชื่อ (Meal Preferences)</label>
            <select 
              name="mealPreference" 
              defaultValue={initialData?.mealPreference || ''}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
            >
              <option value="">ไม่ระบุ (ทานได้ปกติ)</option>
              <option value="HALAL">อาหารฮาลาล (Halal)</option>
              <option value="VEGETARIAN">มังสวิรัติ (Vegetarian)</option>
              <option value="VEGAN">วีแกน (Vegan)</option>
              <option value="NO_BEEF">ไม่ทานเนื้อวัว (No Beef)</option>
              <option value="NO_SEAFOOD">แพ้อาหารทะเล (No Seafood)</option>
              <option value="OTHER">อื่นๆ (โปรดระบุในช่องด้านล่าง)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ข้อจำกัดด้านสุขภาพ หรือ รถเข็นวีลแชร์ (Medical/Accessibility)</label>
            <textarea 
              name="specialNeeds" 
              defaultValue={initialData?.specialNeeds || ''}
              rows={3}
              placeholder="เช่น มีผู้สูงอายุที่ต้องใช้รถเข็นวีลแชร์, มีโรคประจำตัว..." 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            ></textarea>
            <p className="text-xs text-slate-400 mt-2">ข้อมูลนี้จะถูกส่งต่อให้ทีม Sales เพื่อดูแลคุณได้อย่างเหมาะสมที่สุด</p>
          </div>

        </div>
      </div>

      {/* Section 4: Communications */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">การรับข่าวสาร (Communications)</h2>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="dealAlerts" id="dealAlerts" defaultChecked={initialData?.dealAlerts} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-800 block">แจ้งเตือนโปรโมชั่นและทัวร์ไฟไหม้ (Deal Alerts)</span>
              <span className="text-xs text-slate-500">ให้ระบบส่งการแจ้งเตือนเมื่อมีทัวร์ที่ตรงกับประเทศที่คุณสนใจหรือลดราคาพิเศษ</span>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="marketingConsent" id="marketingConsent" defaultChecked={initialData?.marketingConsent} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-800 block">ยินยอมรับข่าวสารการตลาด (Marketing Consent)</span>
              <span className="text-xs text-slate-500">รับจดหมายข่าว โปรโมชั่นรายเดือน และข้อเสนอพิเศษจาก Jongtour</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-8 mt-8">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลความสนใจ'}
        </button>
      </div>

    </form>
  )
}
