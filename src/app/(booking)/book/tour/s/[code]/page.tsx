import { notFound, redirect } from 'next/navigation';
import { resolveCentralTourRouteBySourceCode } from '@/services/central-wholesale.service';

type PageProps = {
  params: { code: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LegacySourceBookPage({ params, searchParams }: PageProps) {
  const code = decodeURIComponent(String(params.code || '')).trim();
  const wholesaleRaw = searchParams?.wholesale;
  const wholesaleId = Array.isArray(wholesaleRaw) ? wholesaleRaw[0] : wholesaleRaw;

  const resolved = await resolveCentralTourRouteBySourceCode({
    sourceCode: code,
    wholesaleId: wholesaleId ? String(wholesaleId).trim() : undefined,
  });

  if (!resolved) {
    notFound();
  }

  const search = new URLSearchParams();
  if (resolved.wholesaleId) {
    search.set('wholesale', resolved.wholesaleId);
  }
  const depRaw = searchParams?.dep;
  const depId = Array.isArray(depRaw) ? depRaw[0] : depRaw;
  if (depId) {
    search.set('dep', String(depId));
  }

  const query = search.toString();
  const target = query
    ? `/book/tour/${resolved.slug}?${query}`
    : `/book/tour/${resolved.slug}`;

  redirect(target);
}
