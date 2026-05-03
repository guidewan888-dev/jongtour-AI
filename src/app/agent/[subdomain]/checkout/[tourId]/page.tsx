import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "@/app/checkout/[tourId]/CheckoutClient";
import { prisma } from "@/lib/prisma";

export default async function AgentCheckoutPage({ params }: { params: { subdomain: string, tourId: string } }) {
  const { subdomain, tourId } = params;

  // Verify the agent exists
  const agentCompany = await prisma.company.findUnique({
    where: { subdomain }
  });

  if (!agentCompany || agentCompany.type !== 'AGENT') {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?redirect=/checkout/${tourId}`);
  }

  const { data: tour, error } = await supabase
    .from('Tour')
    .select(`
      *,
      departures:TourDeparture(*)
    `)
    .eq('id', tourId)
    .single();

  if (error || !tour) {
    console.error("Tour not found for checkout:", error);
    notFound();
  }

  // Sort departures by date
  const sortedDepartures = tour.departures?.sort((a: any, b: any) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  ) || [];

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2" style={{ color: 'var(--theme-color)' }}>
              <div className="w-8 h-8 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: 'var(--theme-color)' }}>1</div>
              <span>ข้อมูลผู้เดินทาง</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">2</div>
              <span>ชำระเงิน</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div>
              <span>เสร็จสิ้น</span>
            </div>
          </div>
        </div>

        <CheckoutClient tour={tour} departures={sortedDepartures} agentId={agentCompany.id} />
      </div>
    </main>
  );
}
