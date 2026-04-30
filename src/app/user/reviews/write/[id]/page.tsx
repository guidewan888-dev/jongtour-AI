import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import WriteReviewForm from "./WriteReviewForm";

export default async function WriteReviewPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const bookingId = params.id;
  const isMock = bookingId.includes('mock');
  let booking: any = null;

  if (isMock) {
    booking = {
      id: bookingId,
      status: 'FULL_PAID',
      totalPrice: 28900,
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      departure: {
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        tour: {
          title: bookingId.includes('11223344') ? 'ทัวร์เกาหลี โซล นามิ สกีรีสอร์ท 5 วัน 3 คืน' : 'ทัวร์เวียดนาม ดานัง ฮอยอัน บานาฮิลล์ 4 วัน 3 คืน',
          destination: bookingId.includes('11223344') ? 'ประเทศเกาหลีใต้' : 'ประเทศเวียดนาม',
          imageUrl: bookingId.includes('11223344') ? 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop',
        }
      }
    };
  } else {
    // Fetch real data
    const dbUser = await prisma.user.findUnique({ where: { email: user.email || "" } });
    if (!dbUser) redirect('/user/bookings');

    booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: dbUser.id },
      include: {
        departure: { include: { tour: true } }
      }
    });

    if (!booking) redirect('/user/bookings');
  }

  // Serialize booking to avoid passing Date objects to Client Component
  const serializedBooking = JSON.parse(JSON.stringify(booking));

  return (
    <WriteReviewForm booking={serializedBooking} isMock={isMock} />
  );
}
