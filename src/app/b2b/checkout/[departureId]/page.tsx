import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import CheckoutFormClient from './CheckoutFormClient';

export const dynamic = 'force-dynamic';

export default async function B2BCheckoutPage({ params }: { params: { departureId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser?.agent) {
    redirect('/b2b');
  }
  const agent = dbUser.agent;

  const { data: departure } = await supabase
    .from('departures')
    .select('*, tour:tours(*)')
    .eq('id', params.departureId)
    .single();

  // Fetch prices manually
  const { data: prices } = await supabase
    .from('departure_prices')
    .select('*')
    .eq('departureId', params.departureId);

  if (!departure || departure.remainingSeats <= 0) {
    notFound(); // Or redirect to error page
  }

  // Find adult price from related prices table or fallback
  const adultPrice = prices?.find(p => p.paxType === 'ADULT')?.price || departure.adultPrice || 0;
  
  // Calculate B2B Net Price
  const discountAmount = adultPrice * (agent.discountRate / 100);
  const netPrice = adultPrice - discountAmount;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">ทำรายการจองทัวร์ (B2B Checkout)</h2>
        <p className="text-sm text-slate-500">สำหรับเอเจนซี่: {agent.companyName} (ส่วนลด {agent.discountRate}%)</p>
      </div>

      <CheckoutFormClient 
        departure={departure} 
        agent={agent} 
        adultPrice={adultPrice} 
        netPrice={netPrice} 
        discountAmount={discountAmount}
      />
    </div>
  );
}
