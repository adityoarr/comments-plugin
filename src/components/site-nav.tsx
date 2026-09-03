import { useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';

// Note: /login and /dashboard live outside the [locale] route tree
// (they're app-functional pages, not marketing/docs content), so they
// use the plain next/link instead of the locale-aware Link — a locale
// prefix would otherwise be added to a path that doesn't exist under it.

export function SiteNav() {
  const t = useTranslations('Nav');

  return (
    <header className="w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4 sm:px-16">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {t('brand')}
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t('docs')}
          </Link>
          <NextLink
            href="/login"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t('signIn')}
          </NextLink>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
