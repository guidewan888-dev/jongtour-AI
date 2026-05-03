'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/components/ui/utils';

const faqs = [
  {
    question: "การจองทัวร์กับ Jongtour มีขั้นตอนอย่างไร?",
    answer: "1. ค้นหาโปรแกรมทัวร์ที่สนใจผ่านหน้าเว็บไซต์\n2. เลือกวันที่เดินทางและระบุจำนวนผู้เดินทาง\n3. กรอกข้อมูลการติดต่อ\n4. ชำระเงินมัดจำผ่านระบบ Payment Gateway เพื่อยืนยันที่นั่ง\n5. รอรับใบยืนยันการจอง (Voucher) ทางอีเมล"
  },
  {
    question: "ราคาทัวร์ที่แสดง รวมค่าใช้จ่ายอะไรบ้าง?",
    answer: "ราคาทัวร์ของเรามักจะรวม: ตั๋วเครื่องบินไป-กลับ, ค่าที่พัก, ค่าอาหารตามที่ระบุในโปรแกรม, ค่ารถบัสปรับอากาศ, ค่าเข้าชมสถานที่, และค่าวีซ่าแบบกรุ๊ป (ถ้ามี) ส่วนที่ไม่รวมมักจะเป็น ทิปไกด์ท้องถิ่น/คนขับรถ และค่าใช้จ่ายส่วนตัว"
  },
  {
    question: "สามารถชำระเงินผ่านช่องทางใดได้บ้าง?",
    answer: "เรารองรับการชำระเงินผ่าน QR Code (PromptPay), บัตรเครดิต/เดบิต (Visa, Mastercard, JCB) และการโอนเงินผ่านบัญชีธนาคารของบริษัทโดยตรง"
  },
  {
    question: "หากต้องการยกเลิกการเดินทาง จะได้เงินคืนหรือไม่?",
    answer: "การยกเลิกและการคืนเงิน (Refund) จะเป็นไปตามเงื่อนไขของแต่ละโปรแกรมทัวร์และ พ.ร.บ. ธุรกิจนำเที่ยว โดยทั่วไปหากยกเลิกก่อนเดินทาง 30 วัน จะได้รับเงินมัดจำคืน (หักค่าใช้จ่ายที่เกิดขึ้นจริง เช่น ค่ามัดจำตั๋วเครื่องบิน)"
  },
  {
    question: "บริษัทน่าเชื่อถือหรือไม่ มีใบอนุญาตถูกต้องไหม?",
    answer: "Jongtour จดทะเบียนบริษัทจำกัด และมีใบอนุญาตประกอบธุรกิจนำเที่ยวถูกต้องตามกฎหมาย ออกโดยกรมการท่องเที่ยว นอกจากนี้เรายังใช้ระบบเข้ารหัสความปลอดภัยขั้นสูง (SSL) ในการปกป้องข้อมูลของลูกค้า"
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">คำถามที่พบบ่อย (FAQ)</h1>
        <p className="text-slate-600">รวบรวมทุกข้อสงสัยที่คุณอยากรู้เกี่ยวกับการบริการของเรา</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all hover:border-blue-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-bold text-slate-900 text-lg">{faq.question}</span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-slate-400 transition-transform duration-300",
                  openIndex === idx ? "transform rotate-180 text-blue-600" : ""
                )} 
              />
            </button>
            <div 
              className={cn(
                "px-6 text-slate-600 leading-relaxed whitespace-pre-line overflow-hidden transition-all duration-300",
                openIndex === idx ? "max-h-96 pb-6 opacity-100" : "max-h-0 py-0 opacity-0"
              )}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
