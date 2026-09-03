import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { buildAlternates, SITE_URL } from '@/lib/seo';
import { docsEn } from '@/content/docs-en';
import { docsId } from '@/content/docs-id';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.docs' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/docs', locale as 'en' | 'id'),
  };
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = locale === 'id' ? docsId : docsEn;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Comments Plugin', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: content.title,
        item: buildAlternates('/docs', locale as 'en' | 'id').canonical,
      },
    ],
  };

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="grid w-full max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar / TOC */}
        <aside className="lg:sticky lg:top-16 lg:h-fit">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {content.backHome}
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {content.tocHeading}
          </p>
          <nav className="flex flex-col gap-2 text-sm">
            {content.toc.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex flex-col gap-14">
          <header className="flex flex-col gap-3 border-b border-zinc-200 pb-8 dark:border-zinc-800">
            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {content.eyebrow}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
              {content.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {content.intro}
            </p>
          </header>

          {content.sections}
        </main>
      </div>
    </div>
  );
}
