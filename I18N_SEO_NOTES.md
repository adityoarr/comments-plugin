# i18n (EN/ID) + SEO changes — summary

This documents what changed in `comments-plugin`, why, and what's left for you to
do before deploying.

## What got bilingual, and what didn't

Only the **public marketing/docs site** — `/` (home) and `/docs` — is now
bilingual (English default, Indonesian at `/id` and `/id/docs`). Those are the
only pages meant to rank in search, so that's where translation + SEO effort
actually pays off.

`/login`, `/dashboard/*`, and `/embed` stay English-only and now ship with
`robots: { index: false }`. Reasons:
- They're account-gated or an iframe UI, not content anyone should be
  searching for.
- Translating the dashboard risked breaking the exact-path CSP/security
  headers in `vercel.json` (`/dashboard/(.*)`, `/embed`) if those routes moved
  under a `/id` prefix.
- Keeps the diff focused and low-risk instead of touching ~800 lines of
  authenticated app UI that has no SEO impact.

If you do want the dashboard translated later, the same pattern (next-intl +
`messages/*.json`) extends cleanly — just budget time to also update
`vercel.json`'s header `source` matchers if you move those routes under
`[locale]`.

## Architecture

```
src/app/
  [locale]/            # public site, locale-prefixed ("as-needed": en has no
    layout.tsx          # prefix, id uses /id) — own root <html lang>, JSON-LD,
    page.tsx             # metadata, nav/footer chrome
    docs/page.tsx
  (app)/                # route group — same URLs as before, own root layout,
    layout.tsx           # noindex, English only
    login/page.tsx
    dashboard/...
    embed/page.tsx
  api/...                # untouched
  sitemap.ts             # new
  robots.ts               # new
src/i18n/                # next-intl routing/navigation/request config
src/content/docs-en.tsx  # docs page copy, EN
src/content/docs-id.tsx  # docs page copy, ID (based on the original ID docs)
src/components/          # SiteNav, SiteFooter, LanguageSwitcher
messages/en.json          # short UI strings (nav, footer, home, metadata)
messages/id.json
```

Next.js supports multiple "root layouts" via route groups — that's how `[locale]`
and `(app)` each get their own `<html lang>` without conflicting.

## SEO work included

- **Per-locale metadata**: title/description in `messages/*.json`, wired through
  `generateMetadata` on both `/` and `/docs`.
- **Canonical + hreflang**: `src/lib/seo.ts` builds `alternates.canonical` and
  `alternates.languages` (including `x-default` → English) for every page.
- **`sitemap.xml`**: lists `/` and `/docs` in both locales with hreflang
  alternates, at `src/app/sitemap.ts`.
- **`robots.txt`**: allows the public routes, disallows `/dashboard`, `/login`,
  `/embed`, `/api`, and points to the sitemap — `src/app/robots.ts`.
- **JSON-LD structured data**: `SoftwareApplication` (layout), `FAQPage` (home),
  `BreadcrumbList` (docs).
- **OpenGraph / Twitter card metadata** per locale.

### ⚠️ One deployment thing to check

The app is deployed under `https://apps.adityoarr.com/comments-plugin`
(via `basePath` in `next.config.ts`), which means `sitemap.xml` and
`robots.txt` are served at `.../comments-plugin/sitemap.xml` and
`.../comments-plugin/robots.txt` — **not** at the true domain root
(`apps.adityoarr.com/robots.txt`), which is where crawlers look by default.

Since `apps.adityoarr.com` appears to host more than this one app, you'll
need to either:
1. Make whatever serves the domain-root `robots.txt` include a
   `Sitemap: https://apps.adityoarr.com/comments-plugin/sitemap.xml` line
   (or proxy `/robots.txt` requests to this app), or
2. Manually merge the rules from `src/app/robots.ts`'s output into that
   root-level file.

Without one of those, Google can still find pages via the sitemap once you
submit it directly in Search Console — but the "polite" convention of a
root `robots.txt` won't point at it automatically.

## What I verified

- `npm install next-intl` (added to `package.json`/`package-lock.json`)
- `next build` — compiles clean, all 19 routes generate correctly (fonts
  needed real network access to `fonts.googleapis.com`, which my sandbox
  didn't have — that's a sandbox limitation, not a code issue; it will work
  fine wherever you build with normal internet access)
- `next start` + manual `curl` smoke tests of `/`, `/id`, `/docs`, `/id/docs`,
  `/login`, `/sitemap.xml`, `/robots.txt` — all return correct status codes,
  `<html lang>`, titles, canonical tags, and JSON-LD
- Found and fixed a real middleware-matcher bug along the way: with
  `basePath` set, the bare root request had no trailing path segment, so my
  first regex-only matcher never matched it (404). Fixed by adding an
  explicit `'/'` entry to `middleware.ts`'s `matcher` array.
- `eslint` — zero new errors/warnings introduced (all pre-existing issues
  are in files I didn't touch: dashboard, embed, login, api routes, scripts)

## Not done (explicitly out of scope, flagged rather than silently skipped)

- Dashboard/login/embed translation (see "What got bilingual" above)
- An actual OG image (`og:image`) — currently the pages have no image
  reference, so shares fall back to a plain link card. Worth adding a
  1200×630 screenshot/banner later.
- Fixing the pre-existing lazy-load bug in `public/embed.js` (the iframe
  `src` is set immediately on creation, so the `IntersectionObserver` never
  actually defers the network request — it only prevents re-observing).
  Unrelated to this task, but worth a follow-up.
- Google Search Console / Bing Webmaster Tools submission — that's a manual
  step on your end once this is deployed, not something fixable in code.

## How to apply

Two files are attached:
- `comments-plugin-i18n-seo.zip` — the full working tree (minus
  `node_modules`/`.git`/`.next`) with all changes applied. Easiest: unzip
  over your local clone, review with `git status`/`git diff`, then commit.
- `i18n-seo-changes.patch` — a `git diff` of just the changes (excludes the
  noisy `package-lock.json`) if you'd rather review/apply that way
  (`git apply i18n-seo-changes.patch`), then separately run
  `npm install next-intl`.

Either way, run `npm install` (or at minimum `npm install next-intl`) before
building.
