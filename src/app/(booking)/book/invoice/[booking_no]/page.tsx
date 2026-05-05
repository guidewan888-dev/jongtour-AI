import React from "react";
import Link from "next/link";
import { FileText, Download, Printer, Building } from "lucide-react";

export default function InvoicePage({ params }: { params: { booking_no: string } }) {
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ใบเสร็จรับเงิน / Invoice</h1>
            <p className="text-slate-500 mt-1">#{params.booking_no}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-sm flex items-center gap-1"><Printer className="w-4 h-4" /> พิมพ์</button>
            <button className="btn-primary text-sm flex items-center gap-1"><Download className="w-4 h-4" /> PDF</button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="g-card p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-primary">Jongtour</div>
              <p className="text-sm text-slate-500 mt-1">บริษัท จองทัวร์ จำกัด<br />เลขประจำตัวผู้เสียภาษี: xxx-x-xxxxx-xxxx-x</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">Invoice #{params.booking_no}</div>
              <div className="text-sm text-slate-500">วันที่: 15 พ.ค. 2026</div>
              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full inline-block mt-2">ชำระแล้ว</div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Customer */}
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">ลูกค้า</div>
            <div className="text-sm text-slate-900">นาย JOHN DOE<br />email@example.com<br />08x-xxx-xxxx</div>
          </div>

          {/* Items */}
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">รายการ</th><th className="pb-2 font-medium text-center">จำนวน</th><th className="pb-2 font-medium text-right">ราคา</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-3"><div className="font-medium text-slate-900">ทัวร์ญี่ปุ่น ไฮไลท์สุดคุ้ม พัก 4 ดาว</div><div className="text-xs text-slate-400">เดินทาง 15 มิ.ย. 2026 • LETGO</div></td>
                <td className="py-3 text-center">1 ท่าน</td>
                <td className="py-3 text-right font-medium">฿29,900</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">ราคารวม</span><span>฿29,900</span></div>
              <div className="flex justify-between"><span className="text-slate-500">VAT 7%</span><span>฿2,093</span></div>
              <hr className="border-slate-100" />
              <div className="flex justify-between font-bold text-lg"><span>ยอดรวมสุทธิ</span><span className="text-primary">฿31,993</span></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href={`/book/status/${params.booking_no}`} className="text-sm text-primary hover:underline">← กลับไปดูสถานะการจอง</Link>
        </div>
      </div>
    </div>
  );
}
