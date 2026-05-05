export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: params.id },
    include: {
      departure: {
        include: {
          tour: { select: { tourName: true, tourCode: true, durationDays: true, durationNights: true } },
          prices: true,
        },
      },
    },
  });

  if (!quotation) return notFound();

  const adultPrice = quotation.departure?.prices?.find((p: any) => p.paxType === 'ADULT')?.sellingPrice || 0;
  const childPrice = quotation.departure?.prices?.find((p: any) => p.paxType === 'CHILD')?.sellingPrice || 0;
  const isExpired = new Date(quotation.validUntil) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <a href="/sales/quotations" className="text-xs font-bold text-blue-600 hover:underline">← กลับไปรายการใบเสนอราคา</a>
        <h1 className="text-2xl font-black text-slate-900 mt-1">ใบเสนอราคา {quotation.quotationRef}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            quotation.status === 'ACTIVE' && !isExpired ? 'bg-emerald-100 text-emerald-700' :
            quotation.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
            'bg-red-100 text-red-700'
          }`}>{isExpired ? 'EXPIRED' : quotation.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">👤 ข้อมูลลูกค้า</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-500">ชื่อ</p>
              <p className="font-medium text-slate-800">{quotation.customerName}</p>
            </div>
            {quotation.customerEmail && (
              <div>
                <p className="text-xs font-bold text-slate-500">อีเมล</p>
                <p className="text-sm text-slate-700">{quotation.customerEmail}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-500">จำนวน</p>
              <p className="text-sm text-slate-700">{quotation.paxAdult} ผู้ใหญ่ {quotation.paxChild > 0 ? `+ ${quotation.paxChild} เด็ก` : ''}</p>
            </div>
          </div>
        </div>

        {/* Tour Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">🏖️ ข้อมูลทัวร์</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-500">ชื่อทัวร์</p>
              <p className="font-medium text-slate-800">{quotation.departure?.tour?.tourName || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">รหัสทัวร์</p>
              <p className="text-sm font-mono text-slate-700">{quotation.departure?.tour?.tourCode || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">ระยะเวลา</p>
              <p className="text-sm text-slate-700">{quotation.departure?.tour?.durationDays || '-'}D{quotation.departure?.tour?.durationNights || '-'}N</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">วันเดินทาง</p>
              <p className="text-sm text-slate-700">{quotation.departure ? new Date(quotation.departure.startDate).toLocaleDateString('th-TH') : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">💰 รายละเอียดราคา</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-bold text-slate-600">รายการ</th>
              <th className="text-center py-2 font-bold text-slate-600">จำนวน</th>
              <th className="text-right py-2 font-bold text-slate-600">ราคา/ท่าน</th>
              <th className="text-right py-2 font-bold text-slate-600">รวม</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3">ผู้ใหญ่ (Adult)</td>
              <td className="py-3 text-center">{quotation.paxAdult}</td>
              <td className="py-3 text-right">฿{adultPrice.toLocaleString()}</td>
              <td className="py-3 text-right font-medium">฿{(quotation.paxAdult * adultPrice).toLocaleString()}</td>
            </tr>
            {quotation.paxChild > 0 && (
              <tr className="border-b border-slate-100">
                <td className="py-3">เด็ก (Child)</td>
                <td className="py-3 text-center">{quotation.paxChild}</td>
                <td className="py-3 text-right">฿{childPrice.toLocaleString()}</td>
                <td className="py-3 text-right font-medium">฿{(quotation.paxChild * childPrice).toLocaleString()}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold text-lg">
              <td colSpan={3} className="py-4 text-right">ยอดรวมทั้งสิ้น</td>
              <td className="py-4 text-right text-emerald-700">฿{quotation.totalSellingPrice.toLocaleString()}</td>
            </tr>
            {quotation.netPriceEstimate && (
              <tr className="text-sm text-slate-500">
                <td colSpan={3} className="py-1 text-right">Net Price (ประมาณ)</td>
                <td className="py-1 text-right">฿{quotation.netPriceEstimate.toLocaleString()}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Notes + Validity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-2">📝 หมายเหตุ</h2>
          <p className="text-sm text-slate-600">{quotation.notes || 'ไม่มีหมายเหตุ'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-2">📅 วันหมดอายุ</h2>
          <p className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
            {new Date(quotation.validUntil).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {isExpired && <p className="text-xs text-red-500 mt-1">⚠️ ใบเสนอราคานี้หมดอายุแล้ว</p>}
        </div>
      </div>
    </div>
  );
}
