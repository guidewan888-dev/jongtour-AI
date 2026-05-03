import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function QuotationPdfPage({ params }: { params: { id: string } }) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: params.id },
    include: {
      agent: true,
      departure: { include: { tour: true } }
    }
  });

  if (!quotation) {
    notFound();
  }

  // Derived values
  const issueDate = new Date(quotation.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntil = new Date(quotation.validUntil).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const paxTotal = quotation.paxAdult + quotation.paxChild;
  // Simulating per pax selling price (in reality, could be split if we stored it, but for MVP we divide)
  const avgPricePerPax = quotation.totalSellingPrice / paxTotal;

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:py-0 print:bg-white flex flex-col items-center">
      {/* Action Bar (Hidden when printing) */}
      <div className="w-[210mm] flex justify-end mb-4 print:hidden">
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors"
          onClick="window.print()"
        >
          <Printer size={18} />
          พิมพ์ใบเสนอราคา / Save PDF
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-[20mm] mx-auto relative overflow-hidden">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quotation.agent.companyName}</h1>
            <p className="text-sm text-slate-500 mt-1">{quotation.agent.email} | โทร: {quotation.agent.phone}</p>
            {quotation.agent.taxId && <p className="text-sm text-slate-500">เลขประจำตัวผู้เสียภาษี: {quotation.agent.taxId}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-indigo-100 uppercase tracking-widest mb-2">Quotation</h2>
            <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-600 text-right">
              <span className="font-semibold text-slate-800">เลขที่ (No.):</span>
              <span className="font-mono">{quotation.quotationRef}</span>
              
              <span className="font-semibold text-slate-800">วันที่ (Date):</span>
              <span>{issueDate}</span>
              
              <span className="font-semibold text-slate-800">ใช้ได้ถึง (Valid):</span>
              <span>{validUntil}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">เสนอราคาให้ (Customer)</h3>
            <p className="text-lg font-bold text-slate-800">{quotation.customerName}</p>
            {quotation.customerEmail && <p className="text-sm text-slate-600">{quotation.customerEmail}</p>}
          </div>
        </div>

        {/* Tour Information Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-sm">
                <th className="py-3 px-4 font-bold border border-slate-200">รายละเอียดทัวร์ (Description)</th>
                <th className="py-3 px-4 font-bold border border-slate-200 text-center w-24">จำนวน</th>
                <th className="py-3 px-4 font-bold border border-slate-200 text-right w-32">ราคาต่อหน่วย</th>
                <th className="py-3 px-4 font-bold border border-slate-200 text-right w-32">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 border border-slate-200">
                  <p className="font-bold text-slate-900 text-base">{quotation.departure.tour.tourName}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    เดินทาง: {new Date(quotation.departure.startDate).toLocaleDateString('th-TH')} - {new Date(quotation.departure.endDate).toLocaleDateString('th-TH')}
                  </p>
                  {quotation.notes && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 border-l-2 border-slate-300">
                      หมายเหตุ: {quotation.notes}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 border border-slate-200 text-center align-top font-medium text-slate-800">
                  {paxTotal} ท่าน
                </td>
                <td className="py-4 px-4 border border-slate-200 text-right align-top text-slate-800">
                  {avgPricePerPax.toLocaleString()}
                </td>
                <td className="py-4 px-4 border border-slate-200 text-right align-top font-bold text-slate-900">
                  {quotation.totalSellingPrice.toLocaleString()}
                </td>
              </tr>
              {/* Empty rows for layout */}
              <tr><td className="py-12 border-x border-slate-200"></td><td className="border-x border-slate-200"></td><td className="border-x border-slate-200"></td><td className="border-x border-slate-200"></td></tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="border-0"></td>
                <td className="py-3 px-4 border border-slate-200 font-bold text-right text-slate-800 bg-slate-50">ยอดสุทธิ (Net Total)</td>
                <td className="py-3 px-4 border border-slate-200 font-black text-right text-lg text-slate-900 bg-slate-50">฿{quotation.totalSellingPrice.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer & Signature */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] flex justify-between">
          <div className="w-64 text-center">
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="text-sm font-bold text-slate-800">ผู้ขอเสนอราคา (Authorized Signature)</p>
            <p className="text-xs text-slate-500 mt-1">{quotation.agent.companyName}</p>
          </div>
          
          <div className="w-64 text-center">
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="text-sm font-bold text-slate-800">ผู้อนุมัติสั่งซื้อ (Customer Signature)</p>
            <p className="text-xs text-slate-500 mt-1">วันที่ (Date): ______/______/______</p>
          </div>
        </div>

      </div>

      {/* Script for printing via a client component hook would be needed, but we'll inject a simple inline script tag for MVP */}
      <script dangerouslySetInnerHTML={{
        __html: `
          const btn = document.querySelector('button');
          if(btn) btn.onclick = () => window.print();
        `
      }} />
    </div>
  );
}
