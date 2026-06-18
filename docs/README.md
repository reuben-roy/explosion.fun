# explosion.fun developer docs

`explosion.fun` is a Next.js publishing and project-lab site. It combines a headless CMS blog, ranked media reviews, static data visualizations, interactive essays, and product surfaces backed by exported personal datasets.

These docs explain how to work on the repo without mixing personal content, reusable platform code, generated data artifacts, and deployment assumptions.

## Docs map

| Document | Use it for |
| --- | --- |
| [Developer guide](developer-guide.md) | Local setup, route conventions, CMS behavior, and deployment checks |
| [Data pipelines](data-pipelines.md) | YouTube, time-management, bird migration, and generated `public/data` artifacts |
| [Customization guide](customization.md) | Turning the site into a reusable personal-data publishing platform |

## Main code areas

| Path | Responsibility |
| --- | --- |
| `src/app/` | Next.js App Router pages and route handlers |
| `src/components/` | Shared visual components, blog cards, navigation, ranked views, and project-specific components |
| `src/config/graphql.js` | WordPress GraphQL endpoint/query configuration |
| `src/content/` | Local content such as CV markdown |
| `src/utils/` | Score/category helpers and parsers |
| `scripts/` | Offline data processing scripts |
| `public/data/` | Generated or imported static datasets consumed by client experiences |
| `public/images/` | Static media assets |

## Working rule

Runtime pages should consume stable JSON or CMS responses. Heavy parsing belongs in `scripts/`, and personal raw exports should stay out of reusable code paths unless they are explicitly committed as public demo data.
