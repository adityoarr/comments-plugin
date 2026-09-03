import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All locales supported by the marketing/docs site.
  locales: ['en', 'id'],

  // English is the default: it is served with no URL prefix
  // (apps.adityoarr.com/comments-plugin/...), while Indonesian
  // is served under the /id prefix
  // (apps.adityoarr.com/comments-plugin/id/...).
  defaultLocale: 'en',

  // 'as-needed' -> default locale has no prefix, other locales do.
  localePrefix: 'as-needed',

  // Used to build hreflang alternates / canonical URLs.
  localeCookie: {
    name: 'ADITYOARR_LOCALE',
  },
});

export type AppLocale = (typeof routing.locales)[number];
