import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// NOTE on deployment: this app is mounted under the /comments-plugin
// basePath on apps.adityoarr.com, which appears to host multiple apps.
// Because of that, this file is served at
//   https://apps.adityoarr.com/comments-plugin/robots.txt
// — NOT at the true domain root (https://apps.adityoarr.com/robots.txt),
// which is where crawlers look by default. Either:
//   1) configure whatever serves the domain-root robots.txt to add
//      `Sitemap: https://apps.adityoarr.com/comments-plugin/sitemap.xml`,
//      or proxy /robots.txt requests here, or
//   2) merge the rules below into that root-level robots.txt by hand.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/docs', '/id', '/id/docs'],
        disallow: ['/dashboard', '/login', '/embed', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
