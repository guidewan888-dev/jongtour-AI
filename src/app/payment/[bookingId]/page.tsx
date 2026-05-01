import { CheckCircle2 } from "lucide-react";
import PaymentTabs from "./PaymentTabs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function PaymentPage({ 
  params,
  searchParams 
}: { 
  params: { bookingId: string },
  searchParams: { type?: string }
}) {
  const bookingId = params.bookingId;
  const paymentType = searchParams.type || 'full';
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch real booking
  const { data: booking, error } = await supabase
    .from('Booking')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    console.error("Booking not found:", error);
    notFound();
  }

  // Only allow owner or ADMIN
  const { data: dbUser } = await supabase.from('User').select('*').eq('email', user.email || '').single();
  if (!dbUser || (dbUser.role !== 'ADMIN' && booking.userId !== dbUser.id)) {
    notFound();
  }

  let totalAmount = booking.totalPrice;
  let paymentTitle = "ชำระเงินเต็มจำนวน";
  let paymentSubtitle = "ยอดชำระทั้งหมด (Total Amount)";
  
  if (booking.paymentType === 'deposit' && booking.depositAmount) {
    totalAmount = booking.depositAmount;
    paymentTitle = "ชำระเงินมัดจำ";
    paymentSubtitle = "ยอดมัดจำที่ต้องชำระ (Deposit Amount)";
  }

  async function handlePayment() {
    "use server";
    const cookieStore = await cookies();
    const supabaseServer = createClient(cookieStore);
    
    // Mark as DEPOSIT_PAID or FULL_PAID depending on the chosen type
    const newStatus = booking.paymentType === 'deposit' ? 'DEPOSIT_PAID' : 'FULL_PAID';
    
    await supabaseServer
      .from('Booking')
      .update({ status: newStatus })
      .eq('id', bookingId);

    // Also record a payment
    await supabaseServer
      .from('Payment')
      .insert({
        bookingId,
        amount: totalAmount,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        transactionId: 'TXN_' + Date.now()
      });

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

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{paymentTitle}</h1>
            <p className="text-gray-500">{paymentSubtitle}</p>
            <div className="text-4xl font-bold text-[#5392f9] mt-4">
              {totalAmount.toLocaleString()} ฿
            </div>
            <p className="text-sm text-gray-400 mt-2">รหัสการจอง: {bookingId.slice(0, 8).toUpperCase()}</p>
          </div>

          <PaymentTabs bookingId={bookingId} totalAmount={totalAmount} handlePayment={handlePayment} />

        </div>

      </div>
    </main>
  );
}
