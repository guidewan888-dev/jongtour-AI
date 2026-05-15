import { notFound, redirect } from 'next/navigation';
import { resolveCentralTourRouteBySourceCode } from '@/services/central-wholesale.service';

type PageProps = {
  params: { code: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LegacySourceTourPage({ params, searchParams }: PageProps) {
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

  const target = resolved.wholesaleId
    ? `/tour/${resolved.slug}?wholesale=${encodeURIComponent(resolved.wholesaleId)}`
    : `/tour/${resolved.slug}`;

  redirect(target);
}
