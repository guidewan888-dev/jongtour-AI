import DocumentPreviewClient from "@/components/user/DocumentPreviewClient";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocumentPreviewPage({ 
  searchParams 
}: { 
  searchParams: { doc?: string, bookingId?: string } 
}) {
  const docType = searchParams.doc || 'invoice';
  const bookingId = searchParams.bookingId;
  let bookingData = null;

  if (bookingId && !bookingId.includes('mock')) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: dbUser } = await supabase
        .from('User')
        .select('*')
        .eq('email', user.email || '')
        .single();
      if (dbUser) {
        // Fetch the booking if it belongs to the user or if user is ADMIN
        const { data } = await supabase
          .from('Booking')
          .select(`
            *,
            user:User(*),
            departure:TourDeparture(
              *,
              tour:Tour(*)
            ),
            travelers:Traveler(*),
            payments:Payment(*)
          `)
          .eq('id', bookingId)
          .single();
        
        bookingData = data;

        // Basic security check: Only allow the owner or ADMIN to view the document
        if (bookingData && bookingData.userId !== dbUser.id && dbUser.role !== "ADMIN") {
          bookingData = null; // Deny access to data
        }
      }
    }
  }

  // If mock data is needed, we generate a mock ID
  const docId = bookingId ? (docType.toUpperCase().substring(0,3) + "-" + bookingId.slice(-8).toUpperCase()) : 'DOC-001';

  return (
    <DocumentPreviewClient 
      docType={docType} 
      bookingData={bookingData} 
      docId={docId} 
    />
  );
}
