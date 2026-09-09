import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.explosion.fun"),
  title: {
    default: "Explosion.fun — Reuben Roy's Blog and Project Lab",
    template: "%s | Explosion.fun",
  },
  description:
    "Reuben Roy's personal publishing and software project site, featuring essays, media reviews, data visualizations, and open web experiments.",
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
      "A personal publishing and software project site featuring essays, media reviews, data visualizations, and open web experiments.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explosion.fun",
    url: "https://www.explosion.fun/",
    description:
      "Reuben Roy's personal publishing and software project site.",
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
