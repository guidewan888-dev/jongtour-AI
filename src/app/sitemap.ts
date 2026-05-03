import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';
  
  // Basic static routes
  const staticRoutes = [
    '',
    '/tour/search',
    '/deals/flash-sale',
    '/ai-planner',
    '/compare',
    '/blog/guides',
    '/blog/destinations',
    '/faq',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Landing Pages configuration (Phase 6 UI layer)
  const landingPages = [
    '/country/japan', '/country/japan/tokyo', '/country/japan/osaka', '/country/japan/hokkaido', '/country/japan/sakura',
    '/country/china', '/country/china/beijing', '/country/china/shanghai', '/country/china/zhangjiajie', '/country/china/flash-sale',
    '/wholesale/letgo-group', '/wholesale/go365', '/wholesale/check-in-group', '/wholesale/tour-factory',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    );

    // Fetch published tours
    const { data: tours } = await supabase
      .from('tours')
      .select('id, updatedAt')
      .eq('status', 'PUBLISHED');

    const tourRoutes = (tours || []).map((tour) => ({
      url: `${baseUrl}/tour/${tour.id}`,
      lastModified: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...landingPages, ...tourRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
