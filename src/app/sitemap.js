const routes = [
  "",
  "/about",
  "/blog",
  "/blog/ranked",
  "/cv",
  "/docs",
  "/projects",
  "/projects/auto-apply",
  "/projects/employment-by-sex",
  "/projects/greatness",
  "/projects/time-management",
  "/projects/youtube-scholar",
  "/projects/youtube-scholar/channels",
  "/projects/youtube-scholar/curiosity-velocity",
  "/side-track",
  "/side-track/changelog",
  "/side-track/privacy",
  "/side-track/support",
  "/side-track/terms",
];

export const dynamic = "force-static";

export default function sitemap() {
  return routes.map((route) => ({
    url: `https://www.explosion.fun${route}/`,
    changeFrequency: route === "" || route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
