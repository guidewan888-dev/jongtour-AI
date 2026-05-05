"use client";

import React from "react";
import Link from "next/link";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

const docs = [
  { name: "สำเนาพาสปอร์ต", status: "required", desc: "หน้าที่มีรูปถ่ายและข้อมูลส่วนตัว" },
  { name: "รูปถ่ายหน้าตรง 2 นิ้ว", status: "optional", desc: "พื้นหลังขาว ไม่สวมแว่น" },
  { name: "สำเนาบัตรประชาชน", status: "optional", desc: "สำหรับการทำวีซ่า (ถ้ามี)" },
];

export default function DocumentUploadPage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">อัพโหลดเอกสาร</h1>
          <p className="text-slate-500 mt-1">Booking #{params.booking_no}</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">กรุณาอัพโหลดเอกสารก่อนเดินทาง 14 วัน</p>
            <p className="text-amber-600">Deadline: 1 มิ.ย. 2026</p>
          </div>
        </div>

        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.name} className="g-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-slate-900">{doc.name}</span>
                  {doc.status === "required" ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">จำเป็น</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">ไม่บังคับ</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-3">{doc.desc}</p>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-sm text-slate-500">คลิกเพื่ออัพโหลด หรือลากไฟล์มาวาง</p>
                <p className="text-xs text-slate-400">JPG, PNG, PDF (ไม่เกิน 5MB)</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Link href={`/book/status/${params.booking_no}`} className="btn-outline">← ดูสถานะ</Link>
          <button className="btn-primary flex items-center gap-2"><CheckCircle className="w-5 h-5" /> บันทึกเอกสาร</button>
        </div>
      </div>
    </div>
  );
}
