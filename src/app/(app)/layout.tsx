import type { Metadata } from "next";
import "../globals.css";

// This group holds functional, account-gated app screens (dashboard, login)
// and the embeddable widget iframe (embed). None of these are content pages
// meant to rank in search - they're kept out of the public [locale] site and
// marked noindex so they don't compete with / dilute the marketing/docs SEO.
export const metadata: Metadata = {
  title: "Comments Plugin - Dashboard",
  description: "Manage your Comments Plugin sites and moderate comments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppRootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={"h-full antialiased"}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
