import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuotationFormClient from "./QuotationFormClient";

export const dynamic = 'force-dynamic';

export default async function CreateQuotationPage({ params }: { params: { departureId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirect=/b2b/quotations/create/' + params.departureId);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email || "" },
    include: { agent: true }
  });

  if (!dbUser || !dbUser.agent) {
    redirect('/auth/login');
  }

  const departure = await prisma.departure.findUnique({
    where: { id: params.departureId },
    include: {
      tour: true,
      prices: true
    }
  });

  if (!departure) {
    notFound();
  }

  // Calculate Net Price based on Agent Tier
  const basePrice = departure.prices.find(p => p.paxType === 'ADULT')?.price || 0;
  const childPrice = departure.prices.find(p => p.paxType === 'CHILD_WITH_BED')?.price || basePrice;
  const discountRate = dbUser.agent.discountRate || 0; // %
  
  const adultNet = basePrice - (basePrice * (discountRate / 100));
  const childNet = childPrice - (childPrice * (discountRate / 100));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">สร้างใบเสนอราคา (Create Quotation)</h2>
        <p className="text-sm text-slate-500">สำหรับส่งให้ลูกค้าพิจารณา (ราคาสุทธิของคุณจะไม่ถูกเปิดเผยในเอกสาร PDF)</p>
      </div>

      <QuotationFormClient 
        departureId={departure.id}
        tourName={departure.tour.tourName}
        startDate={departure.startDate.toISOString()}
        endDate={departure.endDate.toISOString()}
        adultNet={adultNet}
        childNet={childNet}
        suggestedRetailPrice={basePrice}
      />
    </div>
  );
}
