import NextLink from 'next/link';
// /login lives outside the [locale] route tree, so it must use the
// plain next/link rather than the locale-aware Link from '@/i18n/navigation'.
import { CodeBlock, Section, type DocsContent, type DocsTocItem } from './docs-shared';

export const TOC_EN: DocsTocItem[] = [
  { href: '#quick-install', label: '1. Quick install' },
  { href: '#how-it-works', label: '2. How the widget works' },
  { href: '#thread-id', label: '3. Configuring the thread ID' },
  { href: '#multi-widget', label: '4. Multiple widgets on one page' },
  { href: '#framework', label: '5. Framework notes' },
  { href: '#csp', label: '6. Content Security Policy (CSP)' },
  { href: '#dashboard', label: '7. Moderation & dashboard' },
  { href: '#troubleshooting', label: '8. Troubleshooting' },
  { href: '#faq', label: '9. FAQ' },
];

export const docsEn: DocsContent = {
  eyebrow: 'Integration guide',
  title: 'How to install & use Comments Plugin',
  backHome: '← Back to home',
  tocHeading: 'On this page',
  toc: TOC_EN,
  intro: (
    <>
      This comments widget can be installed on any website — static HTML,
      WordPress, Next.js, or any other CMS — with a single{' '}
      <code>&lt;div&gt;</code> tag and a single <code>&lt;script&gt;</code>{' '}
      tag. No package to install, no database of your own.
    </>
  ),
  sections: (
    <>
      <Section id="quick-install" title="1. Quick install">
        <p>Add the following two snippets to your page:</p>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          a. Comment container — place it where comments should appear:
        </p>
        <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="my-post-slug"></div>`}</CodeBlock>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          b. Loader script — add it once, anywhere after the container above
          (ideally right before <code>&lt;/body&gt;</code>):
        </p>
        <CodeBlock>{`<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</CodeBlock>
        <p>
          That&apos;s it. The widget loads itself automatically, lazy-loads
          once it&apos;s about to come into view, and resizes itself to fit
          the number of comments.
        </p>
      </Section>

      <Section id="how-it-works" title="2. How the widget works">
        <p>So it doesn&apos;t feel like magic, here&apos;s the flow:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <code>embed.js</code> finds every{' '}
            <code>div.adityoarr-comments</code> element on the page.
          </li>
          <li>
            For each one, it creates a sandboxed, isolated{' '}
            <code>&lt;iframe&gt;</code> pointing at the widget page on our
            servers.
          </li>
          <li>
            The iframe only fully loads once it&apos;s about to scroll into
            view (lazy loading), so it doesn&apos;t slow down your page.
          </li>
          <li>
            Comment content, the post form, and anonymous login all run{' '}
            <em>inside</em> the iframe — none of our scripts run directly on
            your page.
          </li>
          <li>
            The iframe messages the parent page to report its content
            height, so the iframe automatically resizes (no odd scrollbars).
            That message&apos;s origin is validated, so other sites
            can&apos;t spoof it.
          </li>
        </ol>
      </Section>

      <Section id="thread-id" title="3. Configuring the thread ID">
        <p>
          The <code>data-thread-id</code> attribute determines which
          &ldquo;comment thread&rdquo; is shown. Use a value that is{' '}
          <strong>unique and stable</strong> for each page or post — for
          example the article&apos;s slug or post ID:
        </p>
        <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="how-to-build-a-nextjs-plugin"></div>`}</CodeBlock>
        <p>
          If this attribute is left out, the widget automatically falls back
          to <code>window.location.pathname</code>. That works, but it&apos;s
          risky: if the page URL ever changes (a redesign, slug migration,
          etc.), existing comments get &ldquo;detached&rdquo; from their new
          page. It&apos;s best to always set <code>data-thread-id</code>{' '}
          explicitly and never change it after it&apos;s published.
        </p>
      </Section>

      <Section id="multi-widget" title="4. Multiple widgets on one page">
        <p>
          You can place more than one <code>.adityoarr-comments</code>{' '}
          container on the same page — for example for a product list where
          each item has its own comments. Just give each container a
          different <code>data-thread-id</code>; a single{' '}
          <code>&lt;script&gt;</code> tag is still enough to initialize all
          of them.
        </p>
        <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="product-1"></div>
<div class="adityoarr-comments" data-thread-id="product-2"></div>

<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</CodeBlock>
      </Section>

      <Section id="framework" title="5. Framework notes">
        <p>
          <strong>Static HTML / WordPress / other CMS:</strong> paste both
          snippets directly into your page template (e.g.{' '}
          <code>single.php</code> in WordPress, or a &ldquo;Custom
          HTML&rdquo; block).
        </p>
        <p>
          <strong>Next.js / React:</strong> load the script with{' '}
          <code>next/script</code> using{' '}
          <code>strategy=&quot;lazyOnload&quot;</code>, and render the{' '}
          <code>&lt;div&gt;</code> container from inside your component.
        </p>
        <CodeBlock>{`import Script from "next/script";

export default function BlogPost() {
  return (
    <>
      <div className="adityoarr-comments" data-thread-id="my-post-slug" />
      <Script
        src="https://apps.adityoarr.com/comments-plugin/embed.js"
        strategy="lazyOnload"
      />
    </>
  );
}`}</CodeBlock>
        <p>
          <strong>Vue / Nuxt / Svelte / other frameworks:</strong> the same
          pattern applies — render the <code>&lt;div&gt;</code> container,
          then load <code>embed.js</code> after the component mounts (e.g.
          in <code>onMounted</code> or the equivalent of{' '}
          <code>useEffect</code>).
        </p>
      </Section>

      <Section id="csp" title="6. Content Security Policy (CSP)">
        <p>
          If your website enforces a strict CSP, add the following
          directives so the widget can load correctly:
        </p>
        <CodeBlock>{`script-src https://apps.adityoarr.com;
frame-src https://apps.adityoarr.com;`}</CodeBlock>
        <p>
          Without these two directives, the browser can silently block the
          loader script or the widget&apos;s iframe — usually showing up as
          a console error rather than anything visible on the page.
        </p>
      </Section>

      <Section id="dashboard" title="7. Moderation & dashboard">
        <p>
          Comments still display even if you haven&apos;t registered your
          domain. But if you need moderation (approve/delete/mark as spam)
          and per-site settings, register your domain:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Open the{' '}
            <NextLink
              href="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              login page
            </NextLink>{' '}
            and sign in with a Google account.
          </li>
          <li>
            In the dashboard, click <strong>Add New Site</strong> and enter
            your site&apos;s name and domain.
          </li>
          <li>
            Manage incoming comments from{' '}
            <strong>Dashboard → Comments</strong>.
          </li>
        </ol>
      </Section>

      <Section id="troubleshooting" title="8. Troubleshooting">
        <p>
          <strong>The widget doesn&apos;t show up at all.</strong> Make sure
          the <code>&lt;div class=&quot;adityoarr-comments&quot;&gt;</code>{' '}
          element exists in the DOM <em>before</em> <code>embed.js</code>{' '}
          runs, and check the browser console for CSP or CORS errors.
        </p>
        <p>
          <strong>The widget&apos;s height doesn&apos;t adjust / gets cut
          off.</strong> This is usually because the resize{' '}
          <code>postMessage</code> is being blocked. Make sure no browser
          extension or proxy is filtering <code>postMessage</code>, and that
          your domain doesn&apos;t block the{' '}
          <code>apps.adityoarr.com</code> origin.
        </p>
        <p>
          <strong>Comments fail to post.</strong> Check the console for
          errors from <code>/api/comments</code> — the most common causes
          are rate limiting (too many comments in a short window) or a slow
          connection during token verification.
        </p>
      </Section>

      <Section id="faq" title="9. FAQ">
        <p>
          <strong>Do I need to install any npm package?</strong> No. This
          widget runs as an already-hosted service — you just paste the
          HTML/JS snippet above into your page.
        </p>
        <p>
          <strong>Do visitors need an account to comment?</strong> No. By
          default visitors comment anonymously; they&apos;re never asked to
          create an account.
        </p>
        <p>
          <strong>Can it be used on multiple domains at once?</strong> Yes.
          Register each domain from the dashboard so it gets its own
          settings and moderation queue.
        </p>
      </Section>
    </>
  ),
};
