"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuotation } from "@/actions/b2b-quotation";
import { Calculator, Save, AlertCircle } from "lucide-react";

interface Props {
  departureId: string;
  tourName: string;
  startDate: string;
  endDate: string;
  adultNet: number;
  childNet: number;
  suggestedRetailPrice: number;
}

export default function QuotationFormClient({
  departureId,
  tourName,
  startDate,
  endDate,
  adultNet,
  childNet,
  suggestedRetailPrice
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [paxAdult, setPaxAdult] = useState(2);
  const [paxChild, setPaxChild] = useState(0);
  const [markupPerAdult, setMarkupPerAdult] = useState(suggestedRetailPrice - adultNet);
  const [markupPerChild, setMarkupPerChild] = useState(suggestedRetailPrice - childNet); // Simplistic

  // Calculations
  const sellingAdult = adultNet + markupPerAdult;
  const sellingChild = childNet + markupPerChild;
  
  const totalSellingPrice = (sellingAdult * paxAdult) + (sellingChild * paxChild);
  const totalNetPrice = (adultNet * paxAdult) + (childNet * paxChild);
  const totalProfit = totalSellingPrice - totalNetPrice;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("departureId", departureId);
    formData.append("totalSellingPrice", totalSellingPrice.toString());
    formData.append("netPriceEstimate", totalNetPrice.toString());

    startTransition(async () => {
      const res = await createQuotation(formData);
      if (res.success) {
        // Rediect to quotations list
        router.push("/b2b/quotations");
        router.refresh();
      } else {
        setError(res.error || "Something went wrong.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tour Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="font-bold text-slate-800">{tourName}</h3>
        <p className="text-sm text-slate-600 mt-1">
          เดินทาง: {new Date(startDate).toLocaleDateString('th-TH')} - {new Date(endDate).toLocaleDateString('th-TH')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-3">ข้อมูลลูกค้า (Customer Details)</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล ลูกค้า *</label>
            <input required name="customerName" type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="เช่น คุณสมชาย ใจดี" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมลลูกค้า (Optional)</label>
            <input name="customerEmail" type="email" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="somchai@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ใหญ่ (Pax) *</label>
              <input required name="paxAdult" type="number" min="1" value={paxAdult} onChange={e => setPaxAdult(parseInt(e.target.value)||0)} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เด็ก (Pax)</label>
              <input name="paxChild" type="number" min="0" value={paxChild} onChange={e => setPaxChild(parseInt(e.target.value)||0)} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุในใบเสนอราคา</label>
            <textarea name="notes" rows={3} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="เงื่อนไขพิเศษ, รวมค่าวีซ่า, ฯลฯ"></textarea>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-slate-800">ตั้งราคาขาย (Pricing)</h3>
            <Calculator size={18} className="text-slate-400" />
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-3 text-sm">
            <p className="text-indigo-800 font-medium mb-2">ต้นทุน B2B ของคุณ (Net Price)</p>
            <div className="flex justify-between">
              <span className="text-indigo-600">ผู้ใหญ่: ฿{adultNet.toLocaleString()}</span>
              <span className="text-indigo-600">เด็ก: ฿{childNet.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">บวกกำไรผู้ใหญ่ (ต่อท่าน)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
                <input type="number" value={markupPerAdult} onChange={e => setMarkupPerAdult(parseFloat(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <p className="text-xs text-slate-500 mt-1">ราคาขายให้ลูกค้า: ฿{sellingAdult.toLocaleString()}</p>
            </div>
            
            {paxChild > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">บวกกำไรเด็ก (ต่อท่าน)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
                  <input type="number" value={markupPerChild} onChange={e => setMarkupPerChild(parseFloat(e.target.value)||0)} className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">ราคาขายให้ลูกค้า: ฿{sellingChild.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">ยอดขายรวม (Selling Total)</span>
              <span className="font-bold text-slate-900">฿{totalSellingPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">ต้นทุนรวม (Net Total)</span>
              <span className="font-medium text-slate-700">฿{totalNetPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-dashed border-slate-200">
              <span className="text-emerald-700 font-bold">กำไรสุทธิของคุณ (Estimated Profit)</span>
              <span className="font-bold text-emerald-600">฿{totalProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          {isPending ? "กำลังบันทึก..." : (
            <>
              <Save size={18} />
              บันทึกใบเสนอราคา
            </>
          )}
        </button>
      </div>
    </form>
  );
}
