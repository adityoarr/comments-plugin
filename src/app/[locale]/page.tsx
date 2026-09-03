import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import NextLink from 'next/link';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/', locale as 'en' | 'id'),
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  const features = t.raw('features') as { title: string; desc: string }[];
  const faq = t.raw('faq') as { q: string; a: string }[];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-24 sm:px-16">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            {t('badge')}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {/* /login lives outside the [locale] tree (see src/components/site-nav.tsx) */}
            <NextLink
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('ctaDashboard')}
            </NextLink>
            <Link
              href="/docs"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {t('ctaDocs')}
            </Link>
          </div>
        </section>

        {/* Quick integration snippet */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('installHeading')}
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
            <code>{`<div class="adityoarr-comments" data-thread-id="my-post-slug"></div>
<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</code>
          </pre>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('installNote')}{' '}
            <Link
              href="/docs"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('installLink')}
            </Link>
          </p>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('featuresHeading')}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="mb-1 font-medium text-black dark:text-zinc-50">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ (mirrors the FAQPage JSON-LD above for on-page SEO) */}
        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('faqHeading')}
          </h2>
          <div className="flex flex-col gap-5">
            {faq.map((item) => (
              <div key={item.q}>
                <h3 className="mb-1 font-medium text-black dark:text-zinc-50">
                  {item.q}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
