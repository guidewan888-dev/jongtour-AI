"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Plane, Tag, Plus, Edit2, Trash2 } from "lucide-react";

export default function MasterDataSettingsPage() {
  const [countries, setCountries] = useState([
    'ญี่ปุ่น (Japan)', 'เกาหลีใต้ (South Korea)', 'เวียดนาม (Vietnam)', 'สวิตเซอร์แลนด์ (Switzerland)', 'อิตาลี (Italy)'
  ]);
  
  const [airlines, setAirlines] = useState([
    'Thai Airways (TG)', 'Air Asia (FD)', 'Japan Airlines (JL)', 'Korean Air (KE)', 'Emirates (EK)'
  ]);
  
  const [tags, setTags] = useState([
    'ยอดฮิต', 'ทัวร์ไฟไหม้', 'โปรโมชั่น', 'บินหรูอยู่สบาย', 'พรีเมียม', 'ช้อปปิ้งจุใจ', 'ชมซากุระ', 'เล่นสกี'
  ]);

  const handleAdd = (type: 'country' | 'airline' | 'tag') => {
    const title = type === 'country' ? 'เพิ่มประเทศ/ภูมิภาค' : type === 'airline' ? 'เพิ่มสายการบิน' : 'เพิ่มแท็กใหม่';
    const value = window.prompt(`กรุณาระบุชื่อ${title}`);
    if (!value || value.trim() === '') return;

    if (type === 'country') setCountries([value.trim(), ...countries]);
    else if (type === 'airline') setAirlines([value.trim(), ...airlines]);
    else if (type === 'tag') setTags([...tags, value.trim()]);
  };

  const handleRemove = (type: 'country' | 'airline' | 'tag', item: string) => {
    if (!window.confirm(`ยืนยันการลบ "${item}"?`)) return;
    
    if (type === 'country') setCountries(countries.filter(c => c !== item));
    else if (type === 'airline') setAirlines(airlines.filter(a => a !== item));
    else if (type === 'tag') setTags(tags.filter(t => t !== item));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            จัดการฐานข้อมูล (Master Data)
          </h2>
          <p className="text-gray-500 mt-1">จัดการตัวเลือกต่างๆ ที่ใช้ในระบบ (หมวดหมู่, แท็ก, สายการบิน)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> ประเทศ / ภูมิภาค</h3>
            <button onClick={() => handleAdd('country')} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            {countries.map(item => (
              <div key={item} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg group">
                <span className="text-sm font-medium text-gray-700">{item}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={() => {
                    const newVal = window.prompt("แก้ไขข้อมูล:", item);
                    if (newVal && newVal.trim() !== '') {
                      setCountries(countries.map(c => c === item ? newVal.trim() : c));
                    }
                  }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleRemove('country', item)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Airlines */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Plane className="w-4 h-4 text-indigo-500" /> สายการบิน (Airlines)</h3>
            <button onClick={() => handleAdd('airline')} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            {airlines.map(item => (
              <div key={item} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg group">
                <span className="text-sm font-medium text-gray-700">{item}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={() => {
                    const newVal = window.prompt("แก้ไขข้อมูล:", item);
                    if (newVal && newVal.trim() !== '') {
                      setAirlines(airlines.map(a => a === item ? newVal.trim() : a));
                    }
                  }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleRemove('airline', item)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden md:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-500" /> แท็กยอดฮิต (Tour Tags)</h3>
            <button onClick={() => handleAdd('tag')} className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> เพิ่มแท็กใหม่</button>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {tags.map(item => (
              <span key={item} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-2 group hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                {item} 
                <button onClick={() => handleRemove('tag', item)} className="text-gray-400 group-hover:text-red-500 focus:outline-none">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
