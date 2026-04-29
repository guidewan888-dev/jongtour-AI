import Link from "next/link";
import { Copy, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  const bookingId = params.bookingId;
  const totalAmount = 71800;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-gray-500">ข้อมูลผู้เดินทาง</span>
            </div>
            <div className="w-12 h-px bg-orange-500"></div>
            <div className="flex items-center gap-2 text-orange-500">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">2</div>
              <span>ชำระเงิน</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">แจ้งชำระเงิน</h1>
            <p className="text-gray-500">หมายเลขการจอง: <span className="font-bold text-gray-800">{bookingId}</span></p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6 md:p-8 text-center mb-8 border border-orange-100">
            <p className="text-gray-600 mb-2 font-medium">ยอดชำระทั้งหมด (Total Amount)</p>
            <h2 className="text-5xl font-bold text-orange-500 mb-2">{totalAmount.toLocaleString()} ฿</h2>
            <p className="text-sm text-gray-500">กรุณาชำระเงินภายใน 2 ชั่วโมง เพื่อรักษาสิทธิ์การจองของท่าน</p>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ช่องทางการโอนเงิน (Bank Transfer)</h3>
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Kasikornbank_logo.svg/1200px-Kasikornbank_logo.svg.png" alt="KBank" className="w-16 h-16 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" />
                <div>
                  <p className="font-bold text-gray-800 text-lg">ธนาคารกสิกรไทย</p>
                  <p className="text-gray-500 text-sm mb-1">บริษัท จองทัวร์ เอไอ จำกัด (JONGTOUR AI CO., LTD.)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono text-gray-800 font-bold tracking-wider">012-3-45678-9</span>
                    <button className="text-orange-500 hover:text-orange-600 p-1 flex items-center gap-1 text-xs font-bold bg-orange-50 rounded px-2 border border-orange-100">
                      <Copy className="w-3 h-3" /> คัดลอก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">แนบหลักฐานการชำระเงิน (Upload Slip)</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-orange-400 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-700 mb-1">คลิกเพื่ออัปโหลดสลิป</p>
              <p className="text-sm text-gray-500 mb-4">หรือลากไฟล์มาวางที่นี่ (รองรับ JPG, PNG, PDF ขนาดไม่เกิน 5MB)</p>
              <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                เลือกไฟล์
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-8">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>เมื่อท่านกดส่งหลักฐานการชำระเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและยืนยันการจองพร้อมส่งเอกสารใบเตรียมตัวเดินทาง (Preparation Guide) ภายใน 1-2 ชั่วโมงเวลาทำการครับ</p>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4">
            <Link href="/" className="flex-1 py-4 text-center font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              ยกเลิก / กลับไปหน้าแรก
            </Link>
            <Link href="/admin" className="flex-1 py-4 text-center font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-500/30 transition-colors relative overflow-hidden group">
              <span className="relative z-10">แจ้งชำระเงินเรียบร้อย</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
