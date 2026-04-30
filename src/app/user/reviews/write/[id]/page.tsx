import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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
  let booking: any = null;

  // Fetch real data
  const { data: dbUser } = await supabase
      .from('User')
      .select('*')
      .eq('email', user.email || '')
      .single();
    if (!dbUser) redirect('/user/bookings');

    const { data: bookingData } = await supabase
      .from('Booking')
      .select(`
        *,
        departure:TourDeparture(
          *,
          tour:Tour(*)
        )
      `)
      .eq('id', bookingId)
      .eq('userId', dbUser.id)
      .single();
    
    booking = bookingData;

    if (!booking) redirect('/user/bookings');

  // Serialize booking to avoid passing Date objects to Client Component
  const serializedBooking = JSON.parse(JSON.stringify(booking));

  return (
    <WriteReviewForm booking={serializedBooking} isMock={false} />
  );
}
