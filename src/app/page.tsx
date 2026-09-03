import Link from "next/link";

const FEATURES = [
  {
    title: "Drop-in embed",
    desc: "One <script> tag and one <div>. Works on any HTML page — no framework required on your side.",
  },
  {
    title: "Sandboxed & safe",
    desc: "Runs inside a sandboxed iframe with origin-checked messaging, so it never touches your page's DOM directly.",
  },
  {
    title: "Firebase-powered",
    desc: "Anonymous auth for commenters, Google sign-in for site owners, Firestore for storage — no backend to run yourself.",
  },
  {
    title: "Built-in moderation",
    desc: "Approve, mark as spam, or delete comments per site from a simple dashboard.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-24 sm:px-16">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            Comments Plugin
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            An embeddable comments widget for any website
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Add a real, moderated comment section to your blog, docs, or app
            with two lines of code. No database, no auth system, and no
            server to run on your end — this app handles all of it.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in to your dashboard
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Read integration docs
            </Link>
          </div>
        </section>

        {/* Quick integration snippet */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Add it to your site
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
            <code>{`<div class="adityoarr-comments" data-thread-id="my-post-slug"></div>
<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</code>
          </pre>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            That&apos;s it — the widget lazy-loads itself and auto-resizes to
            fit its content.{" "}
            <Link href="/docs" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              See the full installation guide →
            </Link>
          </p>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
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
        </section>
      </main>

      <footer className="w-full border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        Built by{" "}
        <a
          href="https://adityoarr.com"
          className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Adityo
        </a>
      </footer>
    </div>
  );
}