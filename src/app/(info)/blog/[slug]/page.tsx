import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-200 selection:text-orange-900">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <a href="/" className="hover:text-orange-600 transition-colors">หน้าแรก</a>
          <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <a href="/blog" className="hover:text-orange-600 transition-colors">บทความ</a>
          <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-800 font-medium truncate">รีวิวพาครอบครัวเที่ยวญี่ปุ่น 5 วัน 3 คืน</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Article Content (Max width for reading ~ 768px) */}
          <article className="flex-1 max-w-3xl mx-auto lg:mx-0">
            
            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">รีวิวทัวร์จริง</span>
                <span className="text-sm text-slate-500 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> อ่าน 5 นาที</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                รีวิวพาครอบครัวเที่ยวญี่ปุ่น 5 วัน 3 คืน กับทัวร์จัดเต็ม ไม่เหนื่อย ผู้ใหญ่ชอบมาก
              </h1>
              
              {/* Author & Date */}
              <div className="flex items-center gap-4 py-4 border-y border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Jongtour+Editor&background=EA580C&color=fff" alt="Author" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Jongtour Editorial Team</div>
                  <div className="text-slate-500 text-xs">อัปเดตเมื่อ 12 กันยายน 2026</div>
                </div>
                <div className="ml-auto flex gap-2">
                  {/* Share buttons */}
                  <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden mb-10 shadow-sm border border-slate-200">
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" alt="Cover" className="w-full h-auto" />
              <div className="bg-slate-100 p-3 text-xs text-center text-slate-500 border-t border-slate-200">
                วัดคิโยมิสึเดระ (Kiyomizu-dera) เมืองเกียวโต ประเทศญี่ปุ่น
              </div>
            </div>

            {/* Article Content (Prose) */}
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-orange-600 prose-img:rounded-xl">
              <p>
                ประสบการณ์การไปเที่ยวญี่ปุ่นกับครอบครัวครั้งแรกที่มีผู้สูงอายุไปด้วย การเลือกไปกับบริษัททัวร์ช่วยตอบโจทย์เรื่องความสะดวกสบายได้อย่างไร นี่คือรีวิวจากทริปจริงตั้งแต่ขึ้นเครื่องยันกลับถึงไทย
              </p>
              
              <h2>ทำไมถึงเลือกไปกับทัวร์ แทนที่จะไปเที่ยวเอง?</h2>
              <p>
                หลายคนอาจจะคิดว่าการไปเที่ยวญี่ปุ่นด้วยตัวเอง (F.I.T) เป็นเรื่องที่ง่ายและอิสระกว่า แต่เมื่อมี <strong>"ผู้ใหญ่"</strong> หรือ <strong>"เด็กเล็ก"</strong> ร่วมทริปด้วย การต้องลากกระเป๋าขึ้นลงสถานีรถไฟใต้ดินที่วุ่นวายอาจทำให้ทริปหมดสนุกได้ 
              </p>
              <p>
                เราเลยตัดสินใจเลือกใช้ <strong>Jongtour AI</strong> ในการค้นหาทัวร์ โดยพิมพ์แค่ว่า <br/>
                <em className="bg-orange-50 text-orange-800 px-2 py-1 rounded not-italic">"หาทัวร์ญี่ปุ่น พาพ่อแม่ไป ไม่เดินเยอะ กินดีอยู่ดี งบ 35,000"</em> <br/>
                ซึ่งระบบก็คัดกรองทัวร์จาก Wholesale ชื่อดังมาให้เปรียบเทียบทันที
              </p>

              <h2>บรรยากาศวันเดินทาง</h2>
              <img src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop" alt="ญี่ปุ่น" />
              <p>
                หัวหน้าทัวร์นัดหมายที่สนามบินสุวรรณภูมิ จัดการเรื่องตั๋วและกระเป๋าให้เรียบร้อย พอไปถึงญี่ปุ่นก็มีรถบัสปรับอากาศคันใหญ่มารอรับตรงหน้า Terminal เลย ไม่ต้องเดินฝ่าอากาศหนาว
              </p>

              <blockquote>
                "จุดที่ประทับใจที่สุดคือ ไกด์ดูแลผู้ใหญ่ดีมาก มีการเตรียมวีลแชร์ให้สำหรับจุดที่ต้องเดินไกล และร้านอาหารทุกมื้อคือไม่ต้องรอคิวเลย"
              </blockquote>

              <h2>บทสรุป</h2>
              <p>
                การซื้อทัวร์ผ่าน <strong>Jongtour</strong> ทำให้เราได้ราคาที่ถูกกว่าไปจองเอง เพราะระบบดึงราคาโปรโมชั่น (Flash Sale) มาให้ดูแบบเรียลไทม์ ใครที่มีแพลนจะพาครอบครัวไปเที่ยว แนะนำให้ลองใช้ AI ของเว็บนี้ช่วยหาทัวร์ดูครับ ประหยัดเวลาไปได้เยอะมาก
              </p>
            </div>
            
            {/* Tags bottom */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
              <span className="text-sm font-bold text-slate-700 mr-2">แท็ก:</span>
              <a href="#" className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 transition-colors">ญี่ปุ่น</a>
              <a href="#" className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 transition-colors">เที่ยวครอบครัว</a>
              <a href="#" className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 transition-colors">รีวิว</a>
            </div>

          </article>

          {/* Sidebar (Desktop Only) */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-8">
            
            {/* Table of Contents */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-slate-900 text-lg mb-4">สารบัญ</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-orange-600 transition-colors">ทำไมถึงเลือกไปกับทัวร์?</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">การค้นหาทัวร์ด้วย AI</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors pl-4 border-l-2 border-slate-100">บรรยากาศวันเดินทาง</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors pl-4 border-l-2 border-slate-100">ความประทับใจต่อไกด์</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">บทสรุป</a></li>
              </ul>
            </div>

            {/* AI Search CTA Box */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-orange-500 opacity-20 rounded-full blur-xl"></div>
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="font-bold">Jongtour AI Assistant</h3>
              </div>
              <p className="text-slate-300 text-sm mb-5 relative z-10">ให้ AI ช่วยหาทัวร์ "ญี่ปุ่น" ที่เหมาะกับคุณ จาก 1,000+ โปรแกรมในระบบ</p>
              <a href="/ai-search?q=หาทัวร์ญี่ปุ่นแบบในรีวิว" className="block text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-sm transition-colors relative z-10 text-sm">
                ค้นหาทัวร์แบบในรีวิว
              </a>
            </div>

          </aside>
        </div>

        {/* Bottom Section: Related Content */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">บทความและทัวร์ที่เกี่ยวข้อง</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Related Tours */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
               <div className="h-40 bg-slate-200 relative overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Hot Deal</div>
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2">โอซาก้า เกียวโต ทาคายาม่า หมู่บ้านชิราคาวาโกะ 5 วัน 3 คืน</h3>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-orange-600 font-bold">฿28,900</span>
                  <a href="/tour/123" className="text-xs text-white bg-slate-900 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600 transition-colors">ดูโปรแกรม</a>
                </div>
              </div>
            </div>

            {/* Related Article 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="h-40 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-orange-600 font-bold mb-1 uppercase">เตรียมตัวก่อนไป</span>
                <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  สิ่งควรรู้ก่อนพาผู้สูงอายุไปเที่ยวต่างประเทศ
                </h3>
                <span className="text-slate-400 text-xs mt-auto">อ่าน 3 นาที</span>
              </div>
            </div>

            {/* Related Article 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="h-40 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-blue-600 font-bold mb-1 uppercase">จัดกระเป๋า</span>
                <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  วิธีจัดกระเป๋าเที่ยวเมืองหนาว พร็อพแน่นแต่กระเป๋าไม่เกินน้ำหนัก
                </h3>
                <span className="text-slate-400 text-xs mt-auto">อ่าน 4 นาที</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
