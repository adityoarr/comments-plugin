import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { buildAlternates, SITE_URL } from '@/lib/seo';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });
  const alternates = buildAlternates('/', locale as 'en' | 'id');

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: '%s · Comments Plugin',
    },
    description: t('description'),
    alternates,
    openGraph: {
      type: 'website',
      siteName: 'Comments Plugin',
      title: t('title'),
      description: t('description'),
      url: alternates.canonical,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Comments Plugin',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url: SITE_URL,
    description:
      locale === 'id'
        ? 'Widget komentar yang dapat ditanam di website mana pun, dibangun dengan Next.js dan Firebase.'
        : 'An embeddable comments widget for any website, built with Next.js and Firebase.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Adityo',
      url: 'https://adityoarr.com',
    },
    inLanguage: locale,
  };

  return (
    <html
      lang={locale}
      className={"h-full antialiased"}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider>
          <SiteNav />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
