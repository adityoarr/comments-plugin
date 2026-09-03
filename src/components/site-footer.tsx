import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between sm:px-16">
        <p>
          {t('builtBy')}{' '}
          <a
            href="https://adityoarr.com"
            className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Adityo
          </a>
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-zinc-800 dark:hover:text-zinc-200">
            {t('docs')}
          </Link>
          <a
            href="https://github.com/adityoarr/comments-plugin"
            className="hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {t('sourceCode')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
