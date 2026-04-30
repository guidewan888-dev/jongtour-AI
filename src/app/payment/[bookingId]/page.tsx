import { CheckCircle2 } from "lucide-react";
import PaymentTabs from "./PaymentTabs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function PaymentPage({ 
  params,
  searchParams 
}: { 
  params: { bookingId: string },
  searchParams: { type?: string }
}) {
  const bookingId = params.bookingId;
  const paymentType = searchParams.type || 'full';
  
  // Mock logic based on our mock bookings
  let totalAmount = 0;
  let paymentTitle = "แจ้งชำระเงิน";
  let paymentSubtitle = "ยอดชำระทั้งหมด";
  
  if (bookingId.includes('12345678')) {
    if (paymentType === 'deposit') {
      totalAmount = 10000;
      paymentTitle = "ชำระเงินมัดจำบางส่วน";
      paymentSubtitle = "ยอดชำระมัดจำ (Deposit)";
    } else {
      totalAmount = 45900;
      paymentTitle = "ชำระเงินเต็มจำนวน";
      paymentSubtitle = "ยอดชำระทั้งหมด (Total Amount)";
    }
  } else if (bookingId.includes('87654321')) {
    totalAmount = 5900; // 15900 - 10000 deposit
    paymentTitle = "ชำระเงินส่วนที่เหลือ";
    paymentSubtitle = "ยอดคงเหลือที่ต้องชำระ (Remaining Balance)";
  } else {
    totalAmount = 15900;
  }

  async function handlePayment() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.set(`paid_${bookingId}`, 'true', { path: '/' });
    redirect(`/payment/${bookingId}/success`);
  }

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
            <div className="w-12 h-px bg-[#5392f9]"></div>
            <div className="flex items-center gap-2 text-[#5392f9]">
              <div className="w-8 h-8 rounded-full bg-[#5392f9] text-white flex items-center justify-center">2</div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{paymentTitle}</h1>
            <p className="text-gray-500">หมายเลขการจอง: <span className="font-bold text-gray-800">{bookingId.slice(-8).toUpperCase()}</span></p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 md:p-8 text-center mb-8 border border-blue-100">
            <p className="text-gray-600 mb-2 font-medium">{paymentSubtitle}</p>
            <h2 className="text-5xl font-bold text-[#5392f9] mb-2">{totalAmount.toLocaleString()} ฿</h2>
            <p className="text-sm text-gray-500">กรุณาชำระเงินภายใน 2 ชั่วโมง เพื่อรักษาสิทธิ์การจองของท่าน</p>
          </div>

          <PaymentTabs bookingId={bookingId} handlePayment={handlePayment} totalAmount={totalAmount} />

        </div>
      </div>
    </main>
  );
}
