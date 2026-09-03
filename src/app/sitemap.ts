import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/seo';

// Public, indexable routes only. Login/dashboard/embed are functional
// app screens (see src/app/(app)/layout.tsx, which sets `robots: noindex`)
// and are intentionally left out of the sitemap.
const ROUTES = ['/', '/docs'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ROUTES.map((href) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${SITE_URL}${getPathname({ href, locale })}`;
    }
    languages['x-default'] = `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`;

    return {
      url: `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
      lastModified: now,
      changeFrequency: href === '/' ? 'weekly' : 'monthly',
      priority: href === '/' ? 1 : 0.8,
      alternates: { languages },
    };
  });
}
