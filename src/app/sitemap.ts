import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

  // ─── Static pages ────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deals/flash-sale`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/visa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/talents`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // ─── Country/destination pages ───────────────────
  const countries = ['japan', 'korea', 'china', 'europe', 'usa', 'turkey', 'vietnam', 'taiwan', 'singapore', 'egypt'];
  const countryPages: MetadataRoute.Sitemap = countries.map(c => ({
    url: `${baseUrl}/tour/${c}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // ─── Tour detail pages ──────────────────────────
  let tourPages: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    tourPages = tours.map(t => ({
      url: `${baseUrl}/tour/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {}

  // ─── Visa pages ─────────────────────────────────
  const visaCountries = ['japan', 'usa', 'uk', 'schengen', 'australia', 'china', 'india', 'canada'];
  const visaPages: MetadataRoute.Sitemap = visaCountries.map(c => ({
    url: `${baseUrl}/visa/${c}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ─── Blog posts ─────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    blogPages = posts.map(p => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...countryPages, ...tourPages, ...visaPages, ...blogPages];
}
