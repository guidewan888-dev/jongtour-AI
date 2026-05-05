import { redirect } from "next/navigation";

export default function DepartureSelectPage({ params }: { params: { slug: string; departure_id: string } }) {
  // Redirect to travelers step with tour + departure params
  redirect(`/book/checkout/travelers?tour=${params.slug}&departure=${params.departure_id}`);
}
