'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Phone, Globe, MapPin, CheckCircle } from 'lucide-react';

export default function BannerGenerator() {
  const bannerRef = useRef<HTMLDivElement>(null);

  const downloadBanner = async () => {
    if (!bannerRef.current) return;
    
    try {
      const canvas = await html2canvas(bannerRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'jongtour_banner_1190x216.png';
      link.click();
    } catch (err) {
      console.error('Error generating banner:', err);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="mb-8 text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">เครื่องมือสร้าง Banner</h1>
        <p className="text-gray-600 mb-4">
          ระบบจะทำการเรนเดอร์ HTML ออกมาเป็นรูปภาพขนาด 1190x216 px แบบเป๊ะๆ <br/>
          (เนื่องจาก AI วาดรูปมักจะสะกดภาษาไทยผิดและวาด QR Code ไม่สามารถสแกนได้จริง การใช้ HTML Render จึงได้ผลลัพธ์ที่ดีที่สุดและแก้ไขง่าย)
        </p>
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4">
          * กรุณานำไฟล์รูป QR Code ไปวางไว้ที่โฟลเดอร์ <code className="font-bold">public/images/qr/</code><br/>
          ตั้งชื่อไฟล์ว่า <code className="font-bold">line-qr.png</code> และ <code className="font-bold">fb-qr.png</code><br/>
          (ปัจจุบันถ้ายังไม่มีไฟล์ ระบบจะแสดงกล่องสีเทาแทนชั่วคราว)
        </p>
        <button 
          onClick={downloadBanner}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 mx-auto transition-transform hover:scale-105"
        >
          <Download size={20} />
          ดาวน์โหลด Banner เป็นไฟล์ PNG
        </button>
      </div>

      {/* Banner Container - EXACTLY 1190x216 */}
      <div className="bg-white p-4 rounded-xl shadow-2xl overflow-x-auto w-full flex justify-center">
        <div 
          ref={bannerRef}
          style={{ width: '1190px', height: '216px' }}
          className="relative bg-gradient-to-br from-white to-orange-50 overflow-hidden border border-gray-200 shadow-sm flex items-center"
        >
          {/* Decorative Orange Background Element */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-500 to-orange-400 transform -skew-x-12 translate-x-10 rounded-l-3xl"></div>
          
          <div className="relative z-10 flex w-full h-full p-6 items-center justify-between">
            
            {/* Left: Logo & Slogan */}
            <div className="flex items-center gap-5 w-[30%]">
              <img 
                src="/images/logos/logo_transparent.png" 
                alt="Jongtour Logo" 
                className="h-32 w-auto object-contain drop-shadow-md"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlYmQ2Ii8+PC9zdmc+';
                }}
              />
              <div className="flex flex-col">
                <h2 className="text-3xl font-extrabold text-orange-600 tracking-tight" style={{ fontFamily: 'var(--font-kanit), sans-serif' }}>JONGTOUR</h2>
                <div className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full mt-1 mb-2 inline-block w-max border border-orange-200">
                  ระบบจองทัวร์อัจฉริยะ
                </div>
                <p className="text-gray-700 font-semibold italic text-sm">เที่ยวคุ้ม วางแผนง่าย จองไว</p>
              </div>
            </div>

            {/* Middle: Company Info */}
            <div className="flex flex-col w-[35%] pl-4 border-l-2 border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">บริษัท พัชชาทราเวล จำกัด</h3>
              <div className="flex items-start gap-2 text-gray-600 text-xs mb-1">
                <MapPin size={14} className="mt-0.5 text-orange-500 flex-shrink-0" />
                <span>555/11 หมู่บ้าน สราญสิริ ราชพฤกษ์ 346<br/>ต.บางเดื่อ อ.เมือง จ.ปทุมธานี 12000</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span className="font-semibold">ใบอนุญาตนำเที่ยวเลขที่ 11/1103</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                  <Phone size={14} className="text-orange-500" />
                  02-0966364, 099-3937728
                </div>
              </div>
            </div>

            {/* Right: QR Codes */}
            <div className="flex items-center justify-end gap-6 w-[35%] pr-6">
              
              {/* Website / Contact Column */}
              <div className="flex flex-col items-end text-white text-right">
                <div className="text-2xl font-bold mb-1 shadow-sm">จองง่าย สอบถามไว</div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Globe size={16} />
                  <span className="font-semibold text-sm">www.jongtour.com</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex gap-3 bg-white p-3 rounded-xl shadow-lg transform rotate-1">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-green-600 mb-1 bg-green-50 w-full text-center rounded-sm">LINE Official</span>
                  <img 
                    src="/images/qr/line-qr.png" 
                    alt="LINE QR" 
                    className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-0.5"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
                    }}
                  />
                  <span className="text-[10px] font-semibold text-gray-500 mt-1">สแกนเพิ่มเพื่อน</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-blue-600 mb-1 bg-blue-50 w-full text-center rounded-sm">Facebook</span>
                  <img 
                    src="/images/qr/fb-qr.png" 
                    alt="Facebook QR" 
                    className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-0.5"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
                    }}
                  />
                  <span className="text-[10px] font-semibold text-gray-500 mt-1">ติดตามข่าวสาร</span>
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
}
