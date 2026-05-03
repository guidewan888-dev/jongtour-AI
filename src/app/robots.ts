import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/checkout/',
        '/auth/',
        '/api/',
        '/agent/',
        '/b2b/',
        '/tour-cms/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
