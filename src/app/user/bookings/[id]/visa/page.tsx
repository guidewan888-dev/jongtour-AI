"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Camera, Building, CreditCard, ChevronDown, ChevronUp, Plus, Loader2, File, X } from "lucide-react";

export default function VisaDocumentsPage({ params }: { params: { id: string } }) {
  const bookingId = params.id;

  // Mock state for travelers and their documents (supporting multiple files per doc)
  const [travelers, setTravelers] = useState([
    { 
      id: 1, name: 'คุณสมชาย ใจดี', status: 'missing', reqCount: 4, isExpanded: false,
      docs: [
        { id: 'passport', name: '1. สำเนาพาสปอร์ต', files: [{ id: 101, name: 'passport_somchai.pdf' }], required: true },
        { id: 'photo', name: '2. รูปถ่ายวีซ่า (3.5 x 4.5 ซม)', files: [{ id: 102, name: 'photo_somchai.jpg' }], required: true },
        { id: 'employment', name: '3. หนังสือรับรองการทำงาน', files: [], required: true },
        { id: 'bank', name: '4. สเตทเม้นท์ธนาคาร', files: [], required: true },
        { id: 'other', name: '5. เอกสารอื่นๆ (ถ้ามี)', files: [], required: false }
      ]
    },
    { 
      id: 2, name: 'คุณสมหญิง รักดี', status: 'missing', reqCount: 4, isExpanded: true,
      docs: [
        { id: 'passport', name: '1. สำเนาพาสปอร์ต', files: [{ id: 201, name: 'passport_somying.jpg' }], required: true },
        { id: 'photo', name: '2. รูปถ่ายวีซ่า (3.5 x 4.5 ซม)', files: [{ id: 202, name: 'photo_somying.jpg' }], required: true },
        { id: 'employment', name: '3. หนังสือรับรองการทำงาน', files: [], required: true },
        { id: 'bank', name: '4. สเตทเม้นท์ธนาคาร', files: [], required: true },
        { id: 'other', name: '5. เอกสารอื่นๆ (ถ้ามี)', files: [], required: false }
      ]
    },
    { 
      id: 3, name: 'ด.ช.สมบูรณ์ ใจดี', status: 'complete', reqCount: 4, isExpanded: false,
      docs: [
        { id: 'passport', name: '1. สำเนาพาสปอร์ต', files: [{ id: 301, name: 'passport_kid.pdf' }], required: true },
        { id: 'photo', name: '2. รูปถ่ายวีซ่า (3.5 x 4.5 ซม)', files: [{ id: 302, name: 'photo_kid.jpg' }], required: true },
        { id: 'employment', name: '3. หนังสือรับรองการทำงาน (ผู้ปกครอง)', files: [{ id: 303, name: 'emp_parent.pdf' }], required: true },
        { id: 'bank', name: '4. สเตทเม้นท์ธนาคาร (ผู้ปกครอง)', files: [{ id: 304, name: 'bank_parent_1.pdf' }, { id: 305, name: 'bank_parent_2.pdf' }], required: true },
        { id: 'other', name: '5. เอกสารอื่นๆ (ถ้ามี)', files: [{ id: 306, name: 'birth_certificate.pdf' }], required: false }
      ]
    }
  ]);

  const [uploadingDoc, setUploadingDoc] = useState<{travelerId: number, docId: string} | null>(null);

  const toggleExpand = (id: number) => {
    setTravelers(prev => prev.map(t => t.id === id ? { ...t, isExpanded: !t.isExpanded } : t));
  };

  const handleUpload = (travelerId: number, docId: string, file: File) => {
    setUploadingDoc({ travelerId, docId });
    
    // Simulate upload delay
    setTimeout(() => {
      setTravelers(prev => prev.map(t => {
        if (t.id === travelerId) {
          const newDocs = t.docs.map(d => {
            if (d.id === docId) {
              const newFile = { id: Date.now(), name: file.name };
              return { ...d, files: [...d.files, newFile] };
            }
            return d;
          });
          const uploadedRequiredCount = newDocs.filter(d => d.required && d.files.length > 0).length;
          const newStatus = uploadedRequiredCount === t.reqCount ? 'complete' : 'missing';
          return { ...t, docs: newDocs, status: newStatus };
        }
        return t;
      }));
      setUploadingDoc(null);
    }, 1000); // 1 second upload simulation
  };

  const handleDeleteFile = (travelerId: number, docId: string, fileId: number) => {
    setTravelers(prev => prev.map(t => {
      if (t.id === travelerId) {
        const newDocs = t.docs.map(d => {
          if (d.id === docId) {
            return { ...d, files: d.files.filter(f => f.id !== fileId) };
          }
          return d;
        });
        const uploadedRequiredCount = newDocs.filter(d => d.required && d.files.length > 0).length;
        const newStatus = uploadedRequiredCount === t.reqCount ? 'complete' : 'missing';
        return { ...t, docs: newDocs, status: newStatus };
      }
      return t;
    }));
  };

  const completeCount = travelers.filter(t => t.status === 'complete').length;
  const missingCount = travelers.filter(t => t.status === 'missing').length;

  const getDocIcon = (docId: string) => {
    switch(docId) {
      case 'passport': return <FileText className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'employment': return <Building className="w-4 h-4" />;
      case 'bank': return <CreditCard className="w-4 h-4" />;
      case 'other': return <Plus className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/user/bookings/${bookingId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เอกสารยื่นวีซ่า (Schengen Visa)</h1>
          <p className="text-sm text-gray-500 mt-1">รหัสการจอง: {bookingId.slice(-8).toUpperCase()} | ทัวร์เยอรมัน สวิตเซอร์แลนด์ ฝรั่งเศส</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="p-6 border-b border-gray-100 bg-indigo-50/50">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-indigo-900 mb-1">สิ่งที่ต้องเตรียมสำหรับวีซ่าเชงเก้น (เยอรมนี)</h2>
              <p className="text-sm text-indigo-700">กรุณาอัปโหลดรูปถ่ายเอกสารที่ชัดเจน ไม่เบลอ สามารถอัปโหลดได้หลายไฟล์ต่อ 1 รายการ (PDF, JPG) ภายใน 30 วันก่อนวันเดินทาง</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 border-b border-gray-100 pb-4 gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">รายการผู้เดินทาง ({travelers.length} ท่าน)</h3>
              <div className="flex gap-2">
                {missingCount > 0 && <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold border border-red-100">ยังขาด {missingCount} ท่าน</span>}
                {completeCount > 0 && <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-sm font-bold border border-green-100">ครบแล้ว {completeCount} ท่าน</span>}
              </div>
            </div>
            
            {/* Wholesale Export Simulation Button */}
            <div className="w-full md:w-auto">
              <button 
                onClick={() => alert("ระบบ Admin ของ Jongtour จะทำการรวบรวมไฟล์ทั้งหมด แยกโฟลเดอร์ตามชื่อลูกค้าแต่ละคน และบีบอัดเป็นไฟล์ .ZIP หรือสร้าง Secure Link เพื่อส่งให้ Wholesale ได้ใน 1 คลิกเลยครับ!")}
                className="w-full md:w-auto bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                สร้างลิงก์ส่ง Wholesale (มุมมอง Admin)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {travelers.map((traveler, index) => {
              const uploadedReqCount = traveler.docs.filter(d => d.required && d.files.length > 0).length;
              
              return (
                <div key={traveler.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${traveler.status === 'complete' ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white hover:border-indigo-300'}`}>
                  {/* Header */}
                  <div 
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => toggleExpand(traveler.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${traveler.status === 'complete' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{traveler.name}</p>
                        <p className="text-xs text-gray-500">สถานะ: {uploadedReqCount}/{traveler.reqCount} เอกสารจำเป็น</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      {traveler.status === 'complete' ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1.5 rounded-full text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4" /> เอกสารครบถ้วน
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-full text-sm font-bold">
                          <AlertCircle className="w-4 h-4" /> ต้องอัปโหลดเพิ่ม
                        </div>
                      )}
                      {traveler.isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {traveler.isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {traveler.docs.map(doc => {
                          const isUploading = uploadingDoc?.travelerId === traveler.id && uploadingDoc?.docId === doc.id;
                          const hasFiles = doc.files.length > 0;
                          
                          return (
                            <div key={doc.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-colors
                              ${hasFiles ? 'border-green-200' : doc.required ? 'border-dashed border-red-200 hover:border-indigo-400' : 'border-dashed border-gray-200 hover:border-indigo-400'}
                            `}>
                              
                              <div className="p-3 flex justify-between items-center border-b border-gray-50 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 
                                    ${hasFiles ? 'bg-green-50 text-green-600' : doc.required ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}
                                  `}>
                                    {getDocIcon(doc.id)}
                                  </div>
                                  <div>
                                    <p className={`font-bold text-sm ${hasFiles ? 'text-gray-800' : doc.required ? 'text-red-600' : 'text-gray-600'}`}>
                                      {doc.name} {!doc.required && <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded font-normal ml-1">เพิ่มเติม</span>}
                                    </p>
                                    <p className={`text-[10px] flex items-center gap-1 ${hasFiles ? 'text-green-600 font-bold' : doc.required ? 'text-red-500' : 'text-gray-400'}`}>
                                      {hasFiles ? (
                                        <><CheckCircle2 className="w-3 h-3" /> อัปโหลดแล้ว {doc.files.length} ไฟล์</>
                                      ) : (
                                        doc.required ? 'จำเป็นต้องอัปโหลด' : 'อัปโหลดเพื่อประกอบการพิจารณา'
                                      )}
                                    </p>
                                  </div>
                                </div>
                                
                                <label 
                                  className={`h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer
                                    ${isUploading ? 'bg-indigo-50 text-indigo-400 pointer-events-none' : 
                                      hasFiles ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 
                                      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20'}
                                  `}
                                >
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        handleUpload(traveler.id, doc.id, e.target.files[0]);
                                        e.target.value = ''; // Reset to allow re-upload of same file
                                      }
                                    }}
                                  />
                                  {isUploading ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลด</>
                                  ) : hasFiles ? (
                                    <><Plus className="w-3 h-3" /> เพิ่มไฟล์</>
                                  ) : (
                                    <><UploadCloud className="w-3 h-3" /> อัปโหลด</>
                                  )}
                                </label>
                              </div>

                              {/* File List for this document type */}
                              {hasFiles && (
                                <div className="bg-gray-50 p-2 space-y-1.5">
                                  {doc.files.map((file, i) => (
                                    <div key={file.id} className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-md group">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span className="text-xs text-gray-600 truncate">{file.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline">ดูไฟล์</button>
                                        <button 
                                          onClick={() => handleDeleteFile(traveler.id, doc.id, file.id)}
                                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                          title="ลบไฟล์นี้"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
