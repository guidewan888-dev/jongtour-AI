import { redirect } from 'next/navigation';

// City-specific pages redirect to the parent country page
// (we don't have city-level tour filtering yet)
export default function CityPage({ params }: { params: { slug: string; city: string } }) {
  redirect(`/country/${params.slug}`);
}
