import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';
  
  // Basic static routes
  const staticRoutes = [
    '',
    '/destinations',
    '/last-minute',
    '/ai-planner',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
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

    return [...staticRoutes, ...tourRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
