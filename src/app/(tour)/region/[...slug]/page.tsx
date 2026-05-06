import { redirect } from 'next/navigation';

// Redirect all /region/* URLs to /search
export default function RegionRedirectPage({ params }: { params: { slug: string[] } }) {
  const region = params.slug?.[0] || '';
  redirect(`/search?q=${encodeURIComponent(region)}`);
}
