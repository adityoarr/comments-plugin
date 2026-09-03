# 💬 Comments Plugin (Adityoarr Comments)

Embeddable, Disqus-style **comment widget** built with **Next.js 16 (App Router)**, **Firebase** (Auth + Firestore), and **Vercel KV**. It runs as a single, centrally-hosted Next.js app and can be dropped into **any website** (static HTML, WordPress, another Next.js app, etc.) with a two-line snippet — no build step or framework lock-in required on the host site.

Live widget host: `https://apps.adityoarr.com/comments-plugin`

---

## What this project actually is

This repo is **not** a library you `npm install`. It is the **backend + widget application** that powers the comment box. It has three jobs:

1. **Widget delivery** — serves a small vanilla-JS loader (`public/embed.js`) that any site can include with a `<script>` tag.
2. **Widget UI** — renders the actual comment thread (list, post, delete) inside a **sandboxed `<iframe>`** at `/embed`, so host sites never load React/Firebase code directly.
3. **API + Dashboard** — a REST-style API (`/api/comments`, `/api/sites`, `/api/auth/*`) backed by Firestore, plus an authenticated dashboard (`/dashboard`) where a site owner registers domains, moderates comments, and manages settings.

```
┌─────────────────────┐        ┌──────────────────────────────────────────┐
│   Your website       │        │   apps.adityoarr.com/comments-plugin      │
│                       │        │                                            │
│  <div class=          │ script │  /embed.js  → injects sandboxed <iframe>  │
│   "adityoarr-comments"│───────▶│  /embed     → renders comment UI (React)  │
│   data-thread-id="…"> │        │  /api/*     → comments, sites, auth       │
│  </div>               │◀───────│             (Firestore + Vercel KV)       │
│                       │postMsg │                                            │
└─────────────────────┘ (resize)└──────────────────────────────────────────┘
```

## Features

- 🔌 **Drop-in embed** — one `<script>` + one `<div>`, works on any HTML page.
- 🖼️ **Sandboxed iframe** — the widget never runs arbitrary JS in the host page's DOM (`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`).
- 📐 **Auto-resize** — the iframe reports its content height to the parent via `postMessage`, validated against an allow-listed origin.
- 🐢 **Lazy loading** — widget only mounts when it's ~200px from entering the viewport (`IntersectionObserver`).
- 🔐 **Firebase Auth (anonymous by default)** — commenters get a stable UID without a forced sign-up flow; site owners log in with Google for the dashboard.
- 🛡️ **App Check + reCAPTCHA v3** — optional bot/abuse protection on comment submission.
- 🚦 **Rate limiting** — per-IP, per-user, and per-thread limits via Vercel KV (fails open if KV is unreachable).
- 🧼 **Server-side sanitization** — comment content is sanitized (`isomorphic-dompurify`) and validated (`zod`) before it's stored.
- 🗂️ **Multi-tenant sites** — each registered domain is isolated via Firestore security rules (`firestore.rules`) and an `ownerId`/`siteId` model.
- ✅ **Moderation dashboard** — approve / mark as spam / delete comments per site.
- 🌐 **CORS-aware** — configured both at the `next.config.ts` / `vercel.json` header level and in `middleware.ts` for per-request origin checks.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components + Route Handlers) |
| UI | React 19, Tailwind CSS 4 |
| Auth | Firebase Authentication (Anonymous for visitors, Google OAuth for dashboard) |
| Database | Cloud Firestore |
| Rate limiting | Vercel KV (Redis-compatible) |
| Bot protection | Firebase App Check + reCAPTCHA v3 |
| Validation / sanitization | Zod, isomorphic-dompurify |
| Hosting | Vercel (deployed under the `/comments-plugin` base path) |

---

## Getting started (running this repo locally)

### 1. Prerequisites

- Node.js 20+
- A Firebase project with **Authentication** (Anonymous + Google providers enabled) and **Firestore** enabled
- (Optional, for production-parity rate limiting) a **Vercel KV** store
- (Optional, for bot protection) a **reCAPTCHA v3** site key

### 2. Install

```bash
git clone https://github.com/adityoarr/comments-plugin.git
cd comments-plugin
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Firebase client SDK (public — safe to expose to the browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-only — from your service account JSON)
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional: App Check / bot protection
NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY=

# Optional: Vercel KV (rate limiting). Auto-populated if you link a KV store on Vercel.
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

> ⚠️ Never commit `.env.local` or the service account key — `.gitignore` already excludes `.env*`.

### 4. Deploy Firestore rules & indexes (optional but recommended)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run the dev server

```bash
npm run dev
```

Because the app uses `basePath: '/comments-plugin'` (see `next.config.ts`), the app is served at:

- App root → `http://localhost:3000/comments-plugin`
- Widget loader → `http://localhost:3000/comments-plugin/embed.js`
- Widget iframe → `http://localhost:3000/comments-plugin/embed?threadId=...`
- API → `http://localhost:3000/comments-plugin/api/comments`

---

## How to integrate this plugin into another website

You do **not** need to install this repo as a dependency on your site — you only need to load the hosted script and add one container element.

### 1. Add the container where you want comments to appear

```html
<div class="adityoarr-comments" data-thread-id="my-blog-post-slug"></div>
```

- `data-thread-id` should be a **stable, unique identifier** for the page/post (e.g. a slug or post ID). If omitted, it falls back to `window.location.pathname`, which works but is more fragile if your URLs ever change.
- You can place multiple `.adityoarr-comments` containers on the same page (e.g. for a paginated list) — the script initializes each one independently.

### 2. Load the embed script (once per page, anywhere after the container)

```html
<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>
```

That's it. On page load, the script:

1. Finds every `div.adityoarr-comments` on the page.
2. Injects a sandboxed `<iframe>` pointing to `.../comments-plugin/embed?threadId=<id>&host=<your-domain>`.
3. Lazy-loads it once it's near the viewport.
4. Listens for `postMessage` height updates (origin-checked) to auto-resize the iframe — no manual CSS needed.

### 3. (Optional) Register your domain in the dashboard

Comments will load for any `threadId` out of the box, but if you want **moderation, per-site settings, and analytics**, register your domain:

1. Go to `https://apps.adityoarr.com/comments-plugin/login` and sign in with Google.
2. In the dashboard, click **Add New Site** and enter your site name + domain.
3. Approve/mark-as-spam/delete comments from **Dashboard → Comments**.

### 4. Framework-specific notes

- **Next.js / React sites:** load `embed.js` with `next/script` (`strategy="lazyOnload"`) instead of a raw `<script>` tag, and render the container `<div>` from a Client Component.
- **WordPress / static HTML:** paste the two snippets directly into your template/theme (e.g. `single.php`, or a "Custom HTML" block).
- **Content Security Policy (CSP):** if your site sets a strict CSP, allow `frame-src https://apps.adityoarr.com` and `script-src https://apps.adityoarr.com`.

### Example: full integration snippet

```html
<article>
  <h1>My Blog Post</h1>
  <p>...post content...</p>

  <h2>Comments</h2>
  <div class="adityoarr-comments" data-thread-id="my-blog-post-slug"></div>
</article>

<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>
```

---

## API reference (for the widget/dashboard — not meant for direct third-party use)

All endpoints are served under the `/comments-plugin/api` base path in production.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/comments?threadId=...&limit=10` | Public | List approved comments for a thread (widget mode) |
| `GET` | `/api/comments?dashboard=true&filter=...` | Session cookie | List comments across the owner's sites (dashboard mode) |
| `POST` | `/api/comments` | Firebase ID token | Create a comment (rate-limited, sanitized, validated) |
| `PATCH` | `/api/comments?id=...` | Session cookie | Moderate a comment's status (`approved` / `pending` / `spam`) |
| `DELETE` | `/api/comments?id=...` | Bearer token (author only) | Delete your own comment |
| `GET` `POST` | `/api/sites` | Session cookie | List / register sites owned by the logged-in user |
| `GET` | `/api/sites/[id]` | Session cookie | Get a single site's details |
| `POST` | `/api/auth/login` | Firebase ID token | Exchange ID token for an httpOnly session cookie |
| `GET` | `/api/auth/status` | Session cookie | Check current session |
| `POST` | `/api/auth/logout` | Session cookie | Clear session cookie |

## Security model

- **Iframe sandboxing** — the widget is isolated from the host page's DOM/JS.
- **Origin-checked `postMessage`** — resize messages are only accepted from the configured `ALLOWED_ORIGIN`.
- **Server-side validation** (`zod`) and **sanitization** (`isomorphic-dompurify`) on every comment.
- **Rate limiting** per IP / user / thread via Vercel KV.
- **Firestore security rules** enforce multi-tenant isolation — a site owner can only read/moderate comments belonging to their own registered sites.
- **httpOnly session cookies** for the dashboard; **Firebase ID tokens** (short-lived, refreshed per request) for widget actions.
- CSP, `X-Frame-Options`, and related security headers are set per-route in `vercel.json` (e.g. `/dashboard` disallows framing; `/embed` allows it, since it's meant to be embedded).

## Deployment

This app is deployed on **Vercel** under a subpath (`basePath: '/comments-plugin'`), which lets it live alongside other apps/pages on the same domain (`apps.adityoarr.com`). To deploy your own instance:

1. Push this repo to GitHub and import it into Vercel.
2. Add all environment variables from the `.env.local` section above to the Vercel project.
3. (Optional) Provision and link a **Vercel KV** store for rate limiting.
4. Update `ALLOWED_ORIGIN` in `public/embed.js` and `ALLOWED_ORIGINS` in `src/middleware.ts` to match your production domain.
5. Deploy Firestore rules with `firebase deploy --only firestore:rules,firestore:indexes`.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/       # login / logout / status (session cookie management)
│   │   ├── comments/   # CRUD + moderation for comments
│   │   └── sites/      # site registration & lookup
│   ├── dashboard/      # authenticated site-owner UI (sites, comments)
│   ├── embed/          # the actual comment widget rendered inside the iframe
│   └── login/          # Google sign-in for dashboard access
├── lib/
│   ├── firebase/       # client & admin SDK initialization
│   ├── auth.ts         # anonymous sign-in + ID token helper (widget side)
│   ├── app-check.ts    # App Check / reCAPTCHA v3 token helper
│   ├── rate-limit.ts   # Vercel KV-based rate limiter
│   ├── sanitize.ts     # server-side content sanitization
│   └── validations.ts  # zod schemas for API input
├── middleware.ts        # CORS handling + dashboard route protection
public/
└── embed.js              # the vanilla-JS loader third-party sites include
```

## License

No license file is currently included in this repository — all rights reserved by default. Add a `LICENSE` file (e.g. MIT) if you intend for others to reuse the code.