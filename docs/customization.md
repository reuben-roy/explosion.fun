# Customization guide

`explosion.fun` can be generalized into a personal publishing and quantified-self platform. The main work is separating reusable product structure from one person's content and datasets.

## What to customize first

| Area | Current shape | Generalized shape |
| --- | --- | --- |
| Site identity | Hardcoded personal brand and project copy | Site config file with name, links, nav, metadata, and owner profile |
| Project cards | Local arrays in route files | Project registry loaded from JSON, CMS, or typed config |
| CV content | `src/content/cv.md` plus route-specific data | Structured resume/profile content with optional markdown sections |
| Blog CMS | Fixed WordPress GraphQL endpoint | Configurable CMS endpoint and query adapter |
| Review scoring | Repo-specific categories and score helpers | Category schema per content type |
| Data stories | Personal exports committed under `public/data` | Per-user import pipeline and demo-safe sample datasets |
| Product shells | `side-track` and project pages | Project templates with route, changelog, legal, support, and analytics options |

## Recommended configuration layer

Add a small site config before adding more hardcoded product pages:

```js
export const siteConfig = {
  name: 'explosion.fun',
  owner: 'Reuben Roy',
  links: {
    github: 'https://github.com/reuben-roy',
    live: 'https://explosion.fun'
  },
  cms: {
    graphqlEndpoint: 'https://cms.explosion.fun/graphql'
  }
}
```

Then move project card data, nav entries, and social links behind that config. This makes it possible to fork the platform without rewriting every route.

## User data import model

For a reusable platform, each data experience should define:

- accepted raw input files
- local preprocessing command
- generated artifact schema
- privacy classification
- sample dataset for development
- UI component that consumes only the artifact, not the raw export

This keeps YouTube, time-management, and future personal-data projects interchangeable.

## CMS abstraction

WordPress/WPGraphQL is fine as the first CMS adapter. To support other users:

- keep GraphQL query details out of visual components
- normalize posts into a stable internal shape
- make score/category fields optional
- support a static content fallback for users without WordPress

## Productizing checklist

Before presenting this as reusable:

- Move owner-specific metadata into config.
- Move project cards into a registry.
- Document every generated data artifact schema.
- Add sample data that is clearly synthetic or demo-safe.
- Keep private exports out of default setup.
- Provide a CMS-less mode for static markdown/blog content.
- Add a clear import path for a new user's YouTube or screen-time data.

## What should remain personal

The published site can still be personal. The goal is not to remove identity; it is to keep identity and platform mechanics separate. Routes can render Reuben-specific content through config/content files while the rendering system stays portable.
