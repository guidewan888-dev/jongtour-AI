/**
 * StructuredData — JSON-LD Schema.org injection for SEO
 */
import React from 'react';

// ─── Base Component ─────────────────────────────────
export function StructuredData({ schemas }: { schemas: object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
      }}
    />
  );
}

// ─── Organization (every page) ──────────────────────
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': 'https://jongtour.com/#organization',
    name: 'Jongtour',
    alternateName: 'จองทัวร์',
    url: 'https://jongtour.com',
    logo: 'https://jongtour.com/logo.png',
    description: 'แพลตฟอร์มจองทัวร์ออนไลน์ครบวงจร พร้อม AI ช่วยค้นหาทัวร์ที่ใช่',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangkok',
      addressRegion: 'Bangkok',
      postalCode: '10110',
      addressCountry: 'TH',
    },
    priceRange: '฿฿-฿฿฿฿',
    currenciesAccepted: 'THB',
    paymentAccepted: 'Credit Card, PromptPay, Bank Transfer',
    areaServed: { '@type': 'Country', name: 'Thailand' },
    sameAs: [
      'https://www.facebook.com/jongtour',
      'https://www.instagram.com/jongtour',
      'https://line.me/ti/p/@jongtour',
      'https://www.youtube.com/@jongtour',
      'https://www.tiktok.com/@jongtour',
    ],
  };
}

// ─── WebSite + SearchAction ────────────────────────
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://jongtour.com/#website',
    url: 'https://jongtour.com',
    name: 'Jongtour',
    publisher: { '@id': 'https://jongtour.com/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://jongtour.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'th-TH',
  };
}

// ─── TouristTrip (tour detail page) ────────────────
export function tourSchema(tour: {
  name: string; description: string; slug: string; images: string[];
  price: number; duration: string; places: string[];
  rating?: number; reviewCount?: number; priceValidUntil?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `https://jongtour.com/tour/${tour.slug}#trip`,
    name: tour.name,
    description: tour.description,
    image: tour.images,
    url: `https://jongtour.com/tour/${tour.slug}`,
    duration: tour.duration, // P5D format
    itinerary: tour.places.map(p => ({ '@type': 'Place', name: p })),
    offers: {
      '@type': 'Offer',
      price: tour.price.toString(),
      priceCurrency: 'THB',
      priceValidUntil: tour.priceValidUntil || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      url: `https://jongtour.com/tour/${tour.slug}`,
      seller: { '@id': 'https://jongtour.com/#organization' },
    },
    provider: { '@id': 'https://jongtour.com/#organization' },
    ...(tour.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: tour.rating.toString(),
        reviewCount: (tour.reviewCount || 0).toString(),
      },
    }),
  };
}

// ─── Service (visa pages) ──────────────────────────
export function serviceSchema(visa: {
  country: string; price: number; description: string; slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `บริการรับยื่นวีซ่า${visa.country}`,
    description: visa.description,
    url: `https://jongtour.com/visa/${visa.slug}`,
    provider: { '@id': 'https://jongtour.com/#organization' },
    areaServed: { '@type': 'Country', name: 'Thailand' },
    offers: {
      '@type': 'Offer',
      price: visa.price.toString(),
      priceCurrency: 'THB',
    },
  };
}

// ─── Article (blog) ────────────────────────────────
export function articleSchema(article: {
  title: string; description: string; slug: string; image: string;
  publishedAt: string; modifiedAt?: string; author?: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: `https://jongtour.com/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Jongtour Team',
    },
    publisher: { '@id': 'https://jongtour.com/#organization' },
    ...(article.tags && { keywords: article.tags.join(', ') }),
  };
}

// ─── BreadcrumbList ────────────────────────────────
export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

// ─── FAQPage ───────────────────────────────────────
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
