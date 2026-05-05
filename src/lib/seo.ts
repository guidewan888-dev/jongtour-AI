import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

/**
 * generateTourMetadata — Per-tour SEO metadata for generateMetadata()
 */
export function generateTourMetadata(tour: {
  tourName: string; slug: string; durationDays: number; durationNights: number;
  description?: string; price?: number; coverImage?: string;
}): Metadata {
  const title = `${tour.tourName} ${tour.durationDays} วัน ${tour.durationNights} คืน${tour.price ? ` ฿${tour.price.toLocaleString()}` : ''}`;
  const description = tour.description || `${tour.tourName} ${tour.durationDays} วัน ${tour.durationNights} คืน จองออนไลน์ง่ายๆ พร้อมไกด์มืออาชีพ ราคาดีที่สุด`;
  const ogImage = `${siteUrl}/og/tour/${tour.slug}`;

  return {
    title,
    description: description.substring(0, 160),
    openGraph: {
      title,
      description: description.substring(0, 160),
      url: `${siteUrl}/tour/${tour.slug}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: tour.tourName }],
      locale: 'th_TH',
      siteName: 'Jongtour',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.substring(0, 160),
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/tour/${tour.slug}`,
    },
    other: {
      'product:price:amount': tour.price?.toString() || '',
      'product:price:currency': 'THB',
      'product:availability': 'in stock',
    },
  };
}

/**
 * generateVisaMetadata — Per-visa-country SEO metadata
 */
export function generateVisaMetadata(visa: {
  country: string; countryTh: string; price?: number; slug: string;
}): Metadata {
  const title = `บริการรับยื่นวีซ่า${visa.countryTh}${visa.price ? ` ค่าบริการเริ่ม ฿${visa.price.toLocaleString()}` : ''}`;
  const description = `บริการรับยื่นวีซ่า${visa.countryTh}แบบครบวงจร ปรึกษาฟรี ตรวจเอกสารโดยผู้เชี่ยวชาญ จองออนไลน์ผ่าน Jongtour`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/visa/${visa.slug}`,
      type: 'website',
      images: [{ url: `${siteUrl}/og/visa/${visa.slug}.jpg`, width: 1200, height: 630 }],
    },
    alternates: { canonical: `${siteUrl}/visa/${visa.slug}` },
  };
}

/**
 * generateBlogMetadata — Per-blog-post SEO metadata
 */
export function generateBlogMetadata(post: {
  title: string; slug: string; excerpt?: string; coverImage?: string;
  publishedAt: string; author?: string; tags?: string[];
}): Metadata {
  return {
    title: post.title,
    description: post.excerpt?.substring(0, 160) || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt?.substring(0, 160) || post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author || 'Jongtour Team'],
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : [],
    },
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
  };
}

/**
 * generateCountryMetadata — Per-country listing page
 */
export function generateCountryMetadata(country: {
  name: string; nameTh: string; slug: string; tourCount?: number;
  minPrice?: number;
}): Metadata {
  const title = `ทัวร์${country.nameTh} 2026${country.minPrice ? ` ราคาเริ่ม ฿${country.minPrice.toLocaleString()}` : ''}${country.tourCount ? ` ${country.tourCount}+ โปรแกรม` : ''}`;
  const description = `ทัวร์${country.nameTh} 2026 รวมหลายโปรแกรม จากทุก Wholesale จองออนไลน์ง่ายๆ ราคาดีที่สุด พร้อมไกด์ไทย`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/tour/${country.slug}`,
      type: 'website',
    },
    alternates: { canonical: `${siteUrl}/tour/${country.slug}` },
  };
}
