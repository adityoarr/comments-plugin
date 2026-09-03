'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTransition } from 'react';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  id: 'Indonesia',
};

export function LanguageSwitcher() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('language')}</span>
      <select
        aria-label={t('language')}
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const nextLocale = e.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
          });
        }}
        className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l] ?? l}
          </option>
        ))}
      </select>
    </label>
  );
}
