"use client";

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', detail: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/leads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'CONTACT_FORM', tourId: null, notes: `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.detail}` })
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', detail: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">ติดต่อเรา</h1>
        <p className="text-lg text-slate-500 font-medium">ทีมงาน Jongtour ยินดีให้บริการและพร้อมตอบทุกข้อสงสัยของคุณเกี่ยวกับการเดินทาง</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">โทรศัพท์</h3>
            <p className="text-slate-600 mb-1">ติดต่อฝ่ายขายและจองทัวร์</p>
            <a href="tel:021234567" className="text-xl font-black text-indigo-600 hover:text-indigo-700">02-123-4567</a>
          </div>

          <div className="bg-green-50 rounded-3xl p-8 border border-green-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">LINE Official</h3>
            <p className="text-slate-600 mb-1">แชทกับแอดมิน (ตอบไวสุด)</p>
            <a href="https://line.me/R/ti/p/@jongtour" target="_blank" rel="noreferrer" className="text-xl font-black text-green-600 hover:text-green-700">@jongtour</a>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">อีเมล</h3>
            <p className="text-slate-600 mb-1">สำหรับติดต่อธุรกิจ / แจ้งปัญหา</p>
            <a href="mailto:support@jongtour.com" className="text-lg font-black text-slate-800 hover:text-slate-900">support@jongtour.com</a>
          </div>
        </div>

        {/* Map & Office Address */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-8 pb-0">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="text-indigo-600" /> ที่ตั้งสำนักงานใหญ่
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium mb-6">
                <strong>บริษัท จงทัวร์ จำกัด (สำนักงานใหญ่)</strong><br />
                เลขที่ 99/9 อาคารจงทัวร์ ชั้น 5 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400
              </p>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium bg-slate-50 p-4 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500" />
                <span><strong>เวลาทำการ:</strong> จันทร์ - ศุกร์ (09:00 - 18:00 น.) / หยุดวันเสาร์-อาทิตย์ และนักขัตฤกษ์</span>
              </div>

              {/* Form Section */}
              <div className="border-t border-slate-100 pt-8 mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">ฝากข้อความให้เจ้าหน้าที่ติดต่อกลับ</h3>
                {status === 'success' ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium">
                    ขอบคุณที่ติดต่อเรา เจ้าหน้าที่จะรีบติดต่อกลับโดยเร็วที่สุดครับ/ค่ะ
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="ชื่อ-นามสกุล" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 bg-slate-50" />
                      <input required type="tel" placeholder="เบอร์โทรศัพท์" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 bg-slate-50" />
                    </div>
                    <textarea required placeholder="ข้อความ หรือแพ็กเกจทัวร์ที่สนใจ..." rows={3} value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 bg-slate-50"></textarea>
                    <button type="submit" disabled={status === 'loading'} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 w-full md:w-auto disabled:opacity-50 transition-colors">
                      <Send className="w-4 h-4" /> {status === 'loading' ? 'กำลังส่งข้อมูล...' : 'ส่งข้อความ'}
                    </button>
                    {status === 'error' && <p className="text-red-500 text-sm mt-2">เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง</p>}
                  </form>
                )}
              </div>
            </div>
            
            {/* Google Map Embed */}
            <div className="w-full h-80 bg-slate-100 flex-1 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x30e29e8d3ba1a1a1%3A0x8b1a8d11b2b88b0a!2sRatchadaphisek%20Rd%2C%20Bangkok!5e0!3m2!1sen!2sth!4v1650000000000!5m2!1sen!2sth" 
                className="absolute inset-0 w-full h-full border-0" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
