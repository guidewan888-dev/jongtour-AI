// ─── Site Configuration ─────────────────────
import type { SiteConfig } from '../types.js';

export const sites: SiteConfig[] = [
  {
    name: 'worldconnection',
    enabled: true,
    type: 'wordpress',
    baseUrl: 'https://worldconnection.co.th',
    sitemapUrls: [
      'https://worldconnection.co.th/sitemap.xml',
      'https://worldconnection.co.th/sitemap_index.xml',
      'https://worldconnection.co.th/wp-sitemap.xml',
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
  {
    name: 'go365',
    enabled: true,
    type: 'wordpress',         // Not actually WordPress — using API, but type field is required
    baseUrl: 'https://api.kaikongservice.com/api/v1',
    sitemapUrls: [],           // API-based, no sitemap needed
    tourUrlPattern: /./,       // Not used — API returns tour IDs
    requestDelayMs: 300,       // Faster since it's API, not HTML
    userAgent: 'JongtourBot/1.0 (+https://jongtour.com)',
  },
];

