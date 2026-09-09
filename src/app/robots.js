export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.explosion.fun/sitemap.xml",
    host: "https://www.explosion.fun",
  };
}
