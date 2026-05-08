// ─── Site Configuration ─────────────────────
import type { SiteConfig } from '../types.js';

export const sites: SiteConfig[] = [
  {
    name: 'oneworldtour',
    enabled: true,
    type: 'wordpress',
    baseUrl: 'https://www.oneworldtour.co.th',
    sitemapUrls: [
      'https://www.oneworldtour.co.th/sitemap.xml',
      'https://www.oneworldtour.co.th/sitemap_index.xml',
      'https://www.oneworldtour.co.th/wp-sitemap.xml',
    ],
    tourUrlPattern: /\/(tour\/[a-z]{2,}[0-9]+|custom-landingpage\/[\w%-]+)\/?$/i,
    requestDelayMs: 2000,
    userAgent: 'JongtourBot/1.0 (+https://jongtour.com)',
  },
  {
    name: 'itravels',
    enabled: true,
    type: 'nextjs_spa',
    baseUrl: 'https://itravels.center',
    sitemapUrls: [], // No sitemap — discover via listing pages
    tourUrlPattern: /\/programs\/[A-Z0-9]{3,}\/?$/i,
    requestDelayMs: 3000,
    userAgent: 'JongtourBot/1.0 (+https://jongtour.com)',
    usePlaywright: true,
    waitSelector: 'main, h1, h2',
  },
  {
    name: 'bestintl',
    enabled: true,
    type: 'nextjs_spa',
    baseUrl: 'https://www.bestinternational.com',
    sitemapUrls: [],
    tourUrlPattern: /\/tour\/[A-Z0-9_-]+$/i,
    requestDelayMs: 3000,
    userAgent: 'JongtourBot/1.0 (+https://jongtour.com)',
    usePlaywright: true,
    waitSelector: 'main, h1, h2',
  },
  {
    name: 'gs25',
    enabled: true,
    type: 'nextjs_spa',
    baseUrl: 'https://gs25travel.com',
    sitemapUrls: [],
    tourUrlPattern: /\/programs/i,
    requestDelayMs: 2000,
    userAgent: 'JongtourBot/1.0 (+https://jongtour.com)',
    usePlaywright: true,
    waitSelector: 'table',
  },
];

