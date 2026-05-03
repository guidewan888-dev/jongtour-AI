import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'ดำเนินการชำระเงิน - Jongtour',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: { tourId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirect=/checkout/' + params.tourId);
  }

  // Fetch real data from Prisma
  const tourData = await prisma.tour.findUnique({
    where: { id: params.tourId },
    include: {
      departures: {
        where: { startDate: { gte: new Date() }, remainingSeats: { gt: 0 } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      },
      tourDestinations: true,
      tourImages: true
    }
  });

  if (!tourData || tourData.departures.length === 0) {
    console.error("Tour not found or no available departures");
    notFound();
  }

  const tour = {
    id: tourData.id,
    title: tourData.tourName,
    durationDays: tourData.durationDays,
    destination: tourData.tourDestinations?.[0]?.country || "ไม่ระบุ",
    imageUrl: tourData.tourImages?.[0]?.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
    price: tourData.departures[0]?.prices?.find(p => p.paxType === 'ADULT')?.price || 0
  };

  const sortedDepartures = tourData.departures.map(d => ({
    id: d.id,
    startDate: d.startDate.toISOString(),
    endDate: d.endDate.toISOString(),
    availableSeats: d.remainingSeats,
    price: d.prices.find(p => p.paxType === 'ADULT')?.price || 0,
    childPrice: d.prices.find(p => p.paxType === 'CHILD_WITH_BED')?.price || (d.prices.find(p => p.paxType === 'ADULT')?.price || 0),
    singleRoomPrice: d.prices.find(p => p.paxType === 'SINGLE_SUPPLEMENT')?.price || 0,
    depositPrice: d.depositAmount || 0
  }));

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
