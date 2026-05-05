'use client';
import React, { useState } from 'react';

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors">
        ทัวร์ต่างประเทศ
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[1200px] z-50">
          <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-8 grid grid-cols-4 gap-8 relative before:absolute before:inset-0 before:-z-10 before:rounded-xl before:shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
            
            {/* Asia Column (Expanded for Japan & China) */}
            <div className="col-span-1 border-r border-slate-100 pr-8">
              <div className="flex justify-between items-center border-b-2 border-orange-500 pb-2 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span>🌍</span> เอเชีย
                </h3>
                <a href="/region/asia" className="text-xs text-orange-600 font-semibold hover:underline shrink-0">ดูทั้งหมด</a>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <a href="/region/asia" className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">ทัวร์เอเชียทั้งหมด</a>
                  </li>

                  {/* Japan Group */}
                  <li>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <a href="/country/japan" className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">ญี่ปุ่น</a>
                    </div>
                    <ul className="pl-3.5 border-l-2 border-slate-100 ml-0.5 space-y-2 py-1">
                      {['โตเกียว', 'โอซาก้า', 'เกียวโต', 'ฮอกไกโด', 'ซัปโปโร', 'ฟุกุโอกะ', 'คิวชู', 'นาโกย่า', 'ทาคายาม่า', 'ชิราคาวาโกะ', 'โอกินาว่า', 'นารา', 'โกเบ', 'โยโกฮาม่า', 'ฟูจิ', 'คันไซ', 'โทโฮคุ', 'ใบไม้เปลี่ยนสี', 'ซากุระ', 'หิมะ', 'ญี่ปุ่นไฟไหม้', 'ญี่ปุ่นกรุ๊ปส่วนตัว'].map(city => (
                        <li key={city}>
                          <a href={`/search?q=${city}`} className="text-[13px] font-medium text-slate-500 hover:text-orange-600 transition-colors block">{city}</a>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* China Group */}
                  <li>
                    <div className="flex items-center gap-2 mb-2 mt-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <a href="/country/china" className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">จีน</a>
                    </div>
                    <ul className="pl-3.5 border-l-2 border-slate-100 ml-0.5 space-y-2 py-1">
                      {['ปักกิ่ง', 'เซี่ยงไฮ้', 'กวางโจว', 'เซินเจิ้น', 'เฉิงตู', 'ฉงชิ่ง', 'ซีอาน', 'คุนหมิง', 'ลี่เจียง', 'ต้าหลี่', 'แชงกรีล่า', 'จางเจียเจี้ย', 'กุ้ยหลิน', 'หางโจว', 'ซูโจว', 'ฮาร์บิน', 'อู่ฮั่น', 'หนานจิง', 'ชิงเต่า', 'ไหหลำ', 'มาเก๊า', 'ฮ่องกง', 'จีนไฟไหม้', 'จีนกรุ๊ปส่วนตัว'].map(city => (
                        <li key={city}>
                          <a href={`/search?q=${city}`} className="text-[13px] font-medium text-slate-500 hover:text-orange-600 transition-colors block">{city}</a>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* Other Countries */}
                  {[
                    { name: 'เกาหลี', link: '/country/korea' },
                    { name: 'ไต้หวัน', link: '/country/taiwan' },
                    { name: 'สิงคโปร์', link: '/country/singapore' },
                    { name: 'เวียดนาม', link: '/country/vietnam' }
                  ].map((item) => (
                    <li key={item.name} className="flex items-center gap-2 pt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <a href={item.link} className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors">{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Europe Column (2 Sub-columns) */}
            <div className="col-span-1 border-r border-slate-100 pr-8">
              <div className="flex justify-between items-center border-b-2 border-blue-600 pb-2 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span>🏰</span> ยุโรป
                </h3>
                <a href="/region/europe" className="text-xs text-blue-600 font-semibold hover:underline">ดูทั้งหมด</a>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4">
                <ul className="space-y-3">
                  {[
                    'ทัวร์ยุโรปทั้งหมด',
                    'แกรนด์ยุโรป',
                    'สวิตเซอร์แลนด์',
                    'ฝรั่งเศส',
                    'อิตาลี',
                    'อังกฤษ',
                    'เยอรมนี',
                    'ออสเตรีย'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <a href={`/search?q=${item}`} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">{item}</a>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-3">
                  {[
                    'สเปน',
                    'โปรตุเกส',
                    'เช็ก',
                    'ฮังการี',
                    'ไอซ์แลนด์',
                    'สแกนดิเนเวีย',
                    'บอลข่าน'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <a href={`/search?q=${item}`} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Middle East Column */}
            <div className="col-span-1 border-r border-slate-100 pr-8">
              <div className="flex justify-between items-center border-b-2 border-amber-500 pb-2 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span>🐪</span> <span className="leading-tight">ตะวันออกกลาง / คอเคซัส<br/>/ แอฟริกาเหนือ</span>
                </h3>
                <a href="/region/middle-east" className="text-xs text-amber-600 font-semibold hover:underline shrink-0">ดูทั้งหมด</a>
              </div>
              <ul className="space-y-3">
                {[
                  'ทัวร์ตะวันออกกลางทั้งหมด',
                  'อียิปต์',
                  'จอร์เจีย',
                  'ตุรกี',
                  'ดูไบ',
                  'จอร์แดน',
                  'โมร็อกโก'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <a href={`/search?q=${item}`} className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* America Column */}
            <div className="col-span-1">
              <div className="flex justify-between items-center border-b-2 border-emerald-600 pb-2 mb-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span>🗽</span> <span className="leading-tight">อเมริกา /<br/>ออสเตรเลีย</span>
                </h3>
                <a href="/region/america" className="text-xs text-emerald-600 font-semibold hover:underline text-center">ดู<br/>ทั้งหมด</a>
              </div>
              <ul className="space-y-3">
                {[
                  'ทัวร์ทั้งหมด',
                  'อเมริกา',
                  'แคนาดา',
                  'ออสเตรเลีย',
                  'นิวซีแลนด์'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <a href={`/search?q=${item}`} className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
