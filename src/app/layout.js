import { Inter, Inter_Tight, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import "./globals.css";

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  metadataBase: new URL("https://www.explosion.fun"),
  title: {
    default: "Explosion.fun — Reuben Roy's Blog and Project Lab",
    template: "%s | Explosion.fun",
  },
  description:
    "Reuben Roy's personal publishing and software project site: essays, ranked reviews, data visualisations, and open web experiments.",
  applicationName: "Explosion.fun",
  authors: [{ name: "Reuben Roy", url: "https://www.explosion.fun/about/" }],
  creator: "Reuben Roy",
  publisher: "Reuben Roy",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Explosion.fun",
    title: "Explosion.fun — Reuben Roy's Blog and Project Lab",
    description:
      "A personal publishing and software project site featuring essays, ranked reviews, data visualisations, and open web experiments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explosion.fun — Reuben Roy's Blog and Project Lab",
    description:
      "Essays, ranked reviews, data visualisations, and open web experiments.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0f" },
  ],
  colorScheme: "light dark",
};

const themeScript = `(function(){try{var s=localStorage.getItem('ef-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='dark'||s==='light')?s:(d?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explosion.fun",
    url: "https://www.explosion.fun/",
    description: "Reuben Roy's personal publishing and software project site.",
    author: {
      "@type": "Person",
      name: "Reuben Roy",
      url: "https://www.explosion.fun/about/",
      sameAs: [
        "https://github.com/reuben-roy",
        "https://www.linkedin.com/in/reuben-roy",
      ],
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`.ef-reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a href="#main" className="ef-skip">
          Skip to content
        </a>
        <div className="ef-page">
          <SiteHeader />
          <main id="main" className="ef-main">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
