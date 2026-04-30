"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateTravelerDocument } from "@/app/actions/documents";

export default function TravelerUploadItem({ traveler, index }: { traveler: any, index: number }) {
  const [isUploaded, setIsUploaded] = useState(!!traveler.passportFileUrl || !!traveler.passportUploaded);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(traveler.passportFileUrl || null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        // If it's a mock traveler without ID, just simulate
        if (!traveler.id) {
          setTimeout(() => {
            setIsUploading(false);
            setIsUploaded(true);
          }, 1500);
          return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${traveler.id}-${Date.now()}.${fileExt}`;
        const filePath = `passports/${fileName}`;

        // 1. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่");
          setIsUploading(false);
          return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // 3. Save URL to Database via Server Action
        const result = await updateTravelerDocument(traveler.id, "passport", publicUrl);
        
        if (result.error) {
          console.error("DB update error:", result.error);
          alert("บันทึกข้อมูลไม่สำเร็จ");
        } else {
          setFileUrl(publicUrl);
          setIsUploaded(true);
        }

      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
          <p className="font-bold text-gray-800">{traveler.name}</p>
        </div>
        
        {isUploaded ? (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> ครบแล้ว
          </span>
        ) : (
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> ยังขาด
          </span>
        )}
      </div>
      
      <div className="pl-8 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          พาสปอร์ต: <span className="font-mono text-gray-700">{traveler.passportNo || 'ยังไม่ระบุ'}</span>
        </p>
        
        {!isUploaded && (
          <label className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer
            ${isUploading ? 'bg-blue-50 border-blue-200 text-blue-400 pointer-events-none' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'}
          `}>
            <input 
              type="file" 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleUpload}
            />
            {isUploading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลด</>
            ) : (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              อัปโหลด</>
            )}
          </label>
        )}
        {isUploaded && (
          <button 
            onClick={() => {
              if (fileUrl) {
                window.open(fileUrl, '_blank');
              } else {
                alert("นี่คือข้อมูลจำลอง (Mock Data) ไม่มีไฟล์จริงให้ดาวน์โหลดครับ");
              }
            }}
            className="text-[10px] text-gray-400 hover:text-blue-500 underline transition-colors"
          >
            ดูเอกสาร
          </button>
        )}
      </div>
    </div>
  );
}
