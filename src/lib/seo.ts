import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

/**
 * Public origin + basePath the app is deployed under.
 * Kept as one constant so canonical/OG/sitemap URLs never drift
 * from next.config.ts's `basePath: '/comments-plugin'`.
 */
export const SITE_ORIGIN = 'https://apps.adityoarr.com';
export const BASE_PATH = '/comments-plugin';
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/**
 * Builds the `alternates` object (canonical + hreflang) for a given
 * app route (e.g. "/" or "/docs") and the locale currently being rendered.
 */
export function buildAlternates(href: string, locale: (typeof routing.locales)[number]) {
  const languages: Record<string, string> = {};

  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}${getPathname({ href, locale: l })}`;
  }
  // x-default points search engines to the default-locale (English) URL.
  languages['x-default'] = `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`;

  return {
    canonical: `${SITE_URL}${getPathname({ href, locale })}`,
    languages,
  };
}
