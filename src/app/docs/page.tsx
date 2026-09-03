import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cara Pasang & Pakai — Comments Plugin",
  description:
    "Panduan lengkap memasang dan menggunakan widget komentar Adityoarr di website mana pun.",
};

const TOC = [
  { href: "#instalasi-cepat", label: "1. Instalasi cepat" },
  { href: "#cara-kerja", label: "2. Cara kerja widget" },
  { href: "#konfigurasi", label: "3. Konfigurasi thread ID" },
  { href: "#multi-widget", label: "4. Beberapa widget dalam satu halaman" },
  { href: "#framework", label: "5. Catatan per-framework" },
  { href: "#csp", label: "6. Content Security Policy (CSP)" },
  { href: "#dashboard", label: "7. Moderasi & dashboard" },
  { href: "#troubleshooting", label: "8. Troubleshooting" },
  { href: "#faq", label: "9. FAQ" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
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

export default function DocsPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar / TOC */}
        <aside className="lg:sticky lg:top-16 lg:h-fit">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Kembali ke beranda
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Daftar isi
          </p>
          <nav className="flex flex-col gap-2 text-sm">
            {TOC.map((item) => (
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
              Panduan Integrasi
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
              Cara pasang &amp; pakai Comments Plugin
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Widget komentar ini bisa dipasang di website apa pun — HTML
              statis, WordPress, Next.js, atau CMS lain — cukup dengan satu
              tag <code>&lt;div&gt;</code> dan satu tag{" "}
              <code>&lt;script&gt;</code>. Tidak perlu install package,
              tidak perlu database sendiri.
            </p>
          </header>

          <Section id="instalasi-cepat" title="1. Instalasi cepat">
            <p>Tambahkan dua potong kode berikut ke halaman website kamu:</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              a. Wadah komentar — taruh di tempat komentar ingin muncul:
            </p>
            <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="slug-artikel-kamu"></div>`}</CodeBlock>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              b. Script loader — taruh sekali saja di mana pun setelah wadah
              di atas (idealnya sebelum{" "}
              <code>&lt;/body&gt;</code>):
            </p>
            <CodeBlock>{`<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</CodeBlock>
            <p>
              Selesai. Widget akan otomatis dimuat, di-lazy-load saat mulai
              terlihat di layar, dan menyesuaikan tingginya sendiri sesuai
              jumlah komentar.
            </p>
          </Section>

          <Section id="cara-kerja" title="2. Cara kerja widget">
            <p>Supaya tidak seperti &ldquo;sihir&rdquo;, berikut alurnya:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Script <code>embed.js</code> mencari semua elemen{" "}
                <code>div.adityoarr-comments</code> di halaman.
              </li>
              <li>
                Untuk tiap elemen, script membuat satu{" "}
                <code>&lt;iframe&gt;</code> yang sandboxed (terisolasi) dan
                mengarah ke halaman widget di server kami.
              </li>
              <li>
                Iframe baru benar-benar dimuat saat posisinya sudah mendekati
                area layar yang terlihat (lazy loading), supaya tidak
                memperlambat halaman kamu.
              </li>
              <li>
                Isi komentar, form posting, dan proses login anonim semuanya
                berjalan <em>di dalam</em> iframe — tidak ada script dari
                kami yang berjalan langsung di halaman kamu.
              </li>
              <li>
                Iframe mengirim pesan ke halaman induk untuk memberi tahu
                tinggi kontennya, sehingga tinggi iframe otomatis
                menyesuaikan (tanpa scrollbar aneh). Pesan ini divalidasi
                asalnya, jadi situs lain tidak bisa memalsukannya.
              </li>
            </ol>
          </Section>

          <Section id="konfigurasi" title="3. Konfigurasi thread ID">
            <p>
              Atribut <code>data-thread-id</code> menentukan &ldquo;thread
              komentar&rdquo; mana yang ditampilkan. Gunakan nilai yang{" "}
              <strong>unik dan stabil</strong> untuk tiap halaman/postingan,
              misalnya slug artikel atau ID postingan:
            </p>
            <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="cara-membuat-nextjs-plugin"></div>`}</CodeBlock>
            <p>
              Jika atribut ini tidak diisi, widget akan otomatis memakai{" "}
              <code>window.location.pathname</code> sebagai fallback. Ini
              berfungsi, tapi berisiko: kalau suatu saat URL halaman berubah
              (redesign, migrasi slug, dsb.), komentar lama akan
              &ldquo;terlepas&rdquo; dari halaman barunya. Sebaiknya selalu
              set <code>data-thread-id</code> secara eksplisit dan jangan
              mengubahnya setelah dipublikasikan.
            </p>
          </Section>

          <Section
            id="multi-widget"
            title="4. Beberapa widget dalam satu halaman"
          >
            <p>
              Kamu bisa menaruh lebih dari satu wadah{" "}
              <code>.adityoarr-comments</code> di halaman yang sama — misalnya
              untuk daftar produk yang masing-masing punya komentarnya
              sendiri. Cukup beri <code>data-thread-id</code> yang berbeda
              untuk tiap wadah; satu tag <code>&lt;script&gt;</code> tetap
              cukup untuk menginisialisasi semuanya.
            </p>
            <CodeBlock>{`<div class="adityoarr-comments" data-thread-id="produk-1"></div>
<div class="adityoarr-comments" data-thread-id="produk-2"></div>

<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`}</CodeBlock>
          </Section>

          <Section id="framework" title="5. Catatan per-framework">
            <p>
              <strong>HTML statis / WordPress / CMS lain:</strong> tempel
              kedua snippet langsung ke template halaman (misalnya{" "}
              <code>single.php</code> di WordPress, atau blok &ldquo;Custom
              HTML&rdquo;).
            </p>
            <p>
              <strong>Next.js / React:</strong> muat script dengan{" "}
              <code>next/script</code> memakai{" "}
              <code>strategy=&quot;lazyOnload&quot;</code>, dan render wadah{" "}
              <code>&lt;div&gt;</code>-nya dari dalam komponen.
            </p>
            <CodeBlock>{`import Script from "next/script";

export default function BlogPost() {
  return (
    <>
      <div className="adityoarr-comments" data-thread-id="slug-artikel" />
      <Script
        src="https://apps.adityoarr.com/comments-plugin/embed.js"
        strategy="lazyOnload"
      />
    </>
  );
}`}</CodeBlock>
            <p>
              <strong>Vue / Nuxt / Svelte / framework lain:</strong> pola yang
              sama berlaku — render wadah <code>&lt;div&gt;</code> lalu muat{" "}
              <code>embed.js</code> setelah komponen ter-mount (misalnya di{" "}
              <code>onMounted</code> / <code>useEffect</code> yang setara).
            </p>
          </Section>

          <Section id="csp" title="6. Content Security Policy (CSP)">
            <p>
              Kalau website kamu menerapkan CSP yang ketat, tambahkan izin
              berikut agar widget bisa dimuat dengan benar:
            </p>
            <CodeBlock>{`script-src https://apps.adityoarr.com;
frame-src https://apps.adityoarr.com;`}</CodeBlock>
            <p>
              Tanpa dua directive ini, browser bisa memblokir script loader
              atau iframe widget secara diam-diam — biasanya muncul sebagai
              error di console, bukan error yang terlihat di halaman.
            </p>
          </Section>

          <Section id="dashboard" title="7. Moderasi & dashboard">
            <p>
              Komentar akan tetap tampil walau kamu belum mendaftarkan
              domain. Tapi kalau kamu butuh moderasi (approve/hapus/tandai
              spam) dan pengaturan per situs, daftarkan domain kamu:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Buka{" "}
                <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                  halaman login
                </Link>{" "}
                dan masuk dengan akun Google.
              </li>
              <li>
                Di dashboard, klik <strong>Add New Site</strong> lalu isi
                nama situs dan domainnya.
              </li>
              <li>
                Kelola komentar masuk dari menu{" "}
                <strong>Dashboard → Comments</strong>.
              </li>
            </ol>
          </Section>

          <Section id="troubleshooting" title="8. Troubleshooting">
            <p>
              <strong>Widget tidak muncul sama sekali.</strong> Pastikan
              elemen <code>&lt;div class=&quot;adityoarr-comments&quot;&gt;</code>{" "}
              ada di DOM <em>sebelum</em> script <code>embed.js</code>{" "}
              dieksekusi, dan cek console browser untuk pesan error CSP atau
              CORS.
            </p>
            <p>
              <strong>Tinggi widget tidak menyesuaikan / terpotong.</strong>{" "}
              Biasanya karena pesan <code>postMessage</code> untuk resize
              diblokir. Pastikan tidak ada extension browser atau proxy yang
              memfilter <code>postMessage</code>, dan domain kamu tidak
              memblokir origin <code>apps.adityoarr.com</code>.
            </p>
            <p>
              <strong>Komentar gagal terkirim.</strong> Cek console untuk
              error dari <code>/api/comments</code> — penyebab paling umum
              adalah rate limit (terlalu banyak komentar dalam waktu
              singkat) atau koneksi yang lambat saat verifikasi token.
            </p>
          </Section>

          <Section id="faq" title="9. FAQ">
            <p>
              <strong>Apakah saya perlu install package npm apa pun?</strong>{" "}
              Tidak. Widget ini berjalan sebagai layanan yang sudah
              di-hosting — kamu hanya menempelkan snippet HTML/JS di atas.
            </p>
            <p>
              <strong>
                Apakah komentar pengunjung memerlukan akun/pendaftaran?
              </strong>{" "}
              Tidak. Secara default pengunjung berkomentar secara anonim;
              mereka tidak diminta membuat akun.
            </p>
            <p>
              <strong>Apakah bisa dipakai di banyak domain sekaligus?</strong>{" "}
              Bisa. Daftarkan tiap domain lewat dashboard agar masing-masing
              punya pengaturan dan moderasi sendiri.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}