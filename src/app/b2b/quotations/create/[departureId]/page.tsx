import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import QuotationFormClient from "./QuotationFormClient";

export const dynamic = 'force-dynamic';

export default async function CreateQuotationPage({ params }: { params: { departureId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirect=/b2b/quotations/create/' + params.departureId);
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser || !dbUser.agent) {
    redirect('/auth/login');
  }

  const { data: departure } = await supabase
    .from('departures')
    .select('*, tour:tours(*)')
    .eq('id', params.departureId)
    .single();

  if (!departure) {
    notFound();
  }

  // Fetch Prices
  const { data: prices } = await supabase
    .from('departure_prices')
    .select('*')
    .eq('departureId', params.departureId);

  // Calculate Net Price based on Agent Tier
  const basePrice = prices?.find(p => p.paxType === 'ADULT')?.price || departure.adultPrice || 0;
  const childPrice = prices?.find(p => p.paxType === 'CHILD_WITH_BED')?.price || basePrice;
  const discountRate = dbUser.agent.discountRate || 0; // %
  
  const adultNet = basePrice - (basePrice * (discountRate / 100));
  const childNet = childPrice - (childPrice * (discountRate / 100));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">สร้างใบเสนอราคา (Create Quotation)</h2>
        <p className="text-sm text-gray-500">สำหรับส่งให้ลูกค้าพิจารณา (ราคาสุทธิของคุณจะไม่ถูกเปิดเผยในเอกสาร PDF)</p>
      </div>

      <QuotationFormClient 
        departureId={departure.id}
        tourName={departure.tour?.tourName || "ไม่ระบุทัวร์"}
        startDate={departure.startDate}
        endDate={departure.endDate}
        adultNet={adultNet}
        childNet={childNet}
        suggestedRetailPrice={basePrice}
      />
    </div>
  );
}
