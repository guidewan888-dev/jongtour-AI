import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ดำเนินการชำระเงิน - Jongtour',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage({ params }: { params: { tourId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/checkout/' + params.tourId);
  }

  const serverSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI'
  );

  const { data: tourRaw, error } = await serverSupabase
    .from('tours')
    .select(`
      *,
      departures(*, prices(*)),
      destinations:tour_destinations(*),
      images:tour_images(*)
    `)
    .eq('id', params.tourId)
    .single();

  let tourData = tourRaw;
  if (tourData) {
    const today = new Date();
    const validDeps = (tourData.departures || []).filter((d: any) => new Date(d.startDate) >= today);
    validDeps.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    tourData.departures = validDeps;
  }

  if (!tourData) {
    console.error("Tour not found for checkout");
    notFound();
  }

  const tour = {
    id: tourData.id,
    title: tourData.tourName,
    durationDays: tourData.durationDays,
    destination: tourData.destinations?.[0]?.country || "ไม่ระบุ",
    imageUrl: tourData.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    departures: tourData.departures.map(d => ({
      id: d.id,
      startDate: d.startDate,
      endDate: d.endDate,
      price: d.prices?.[0]?.sellingPrice || 0
    }))
  };

  const sortedDepartures = tour.departures;

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2 text-orange-500">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">1</div>
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

        <CheckoutClient tour={tour} departures={sortedDepartures} />
      </div>
    </main>
  );
}
