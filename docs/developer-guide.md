# Developer guide

## Prerequisites

- Node.js 20 or newer
- npm
- Access to the WordPress GraphQL endpoint if working on CMS-backed blog pages

## Install and run

```bash
npm install
npm run dev
```

The dev server uses Next.js with Turbopack:

```bash
npm run dev -- --hostname 0.0.0.0
```

## Common commands

```bash
npm run build
npm run start
npm run lint
npm run youtube:data
```

`npm run build` should be treated as the main verification command before deployment. The site is configured for static export in `next.config.js`.

## Deployment model

`next.config.js` sets:

```js
output: 'export'
images: {
  unoptimized: true
}
trailingSlash: true
```

That means pages should be compatible with static output. When adding a route, avoid runtime-only server features unless the deployment model is intentionally changed. CMS-backed pages should fetch data at build time or through static-friendly patterns.

## Route conventions

| Route area | Purpose |
| --- | --- |
| `/` | Home page and high-level project/blog entry points |
| `/about` | Personal/about content |
| `/career` | Portfolio and resume-style project positioning |
| `/blog` | Blog index |
| `/blog/ranked` | Ranked review view |
| `/blog/post/[slug]` | CMS-backed post detail route |
| `/blog/post/interactive/*` | Interactive long-form pages |
| `/projects` | Project hub |
| `/projects/time-management` | Screen-time dashboard |
| `/projects/youtube-scholar` | YouTube Takeout analysis |
| `/side-track/*` | Product shell, changelog, legal, and support pages |

When adding a new project surface, prefer a dedicated route under `src/app/projects/<name>/` and project-specific components under `src/components/<name>/`.

## CMS behavior

Blog content is fetched from WordPress through WPGraphQL. Keep CMS-specific query details in `src/config/graphql.js` or small route-local helpers. Presentation code should receive normalized post/review data instead of GraphQL response shapes where possible.

When adding score categories or ranked review fields:

- Update the GraphQL query.
- Update category/score helpers in `src/utils/`.
- Verify list and detail pages render missing or partial scores gracefully.

## Styling

The repo uses CSS Modules. Keep styles route-local when they only apply to one page, and use shared component modules only for reusable UI. Project-specific visualization styles should live next to the component or route that owns the experience.

## Verification checklist

Before pushing changes:

```bash
npm run build
npm run lint
```

For data pages, also rerun the relevant script and inspect the generated JSON diff before committing.
