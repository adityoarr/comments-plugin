import type { ReactNode } from 'react';

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {title}
      </h2>
      <div className="flex flex-col gap-4 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

export interface DocsTocItem {
  href: string;
  label: string;
}

export interface DocsContent {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  backHome: string;
  tocHeading: string;
  toc: DocsTocItem[];
  sections: ReactNode;
}
