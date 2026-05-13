# explosion.fun

> Live deployment repo for [explosion.fun](https://explosion.fun) — a personal blog, portfolio, and interactive tools hub built with Next.js.

## What It Does

This repository powers the live site at [explosion.fun](https://explosion.fun). It combines:

- **Portfolio & Blog** — A ranked, categorized blog for reviewing anime, manga, movies, TV series, and books with custom scoring systems.
- **Interactive Visualizations** — Bird migration maps, solar system simulations, and animated data stories using D3.js and Three.js.
- **Data Tools** — YouTube Google Takeout analyzer and time-management dashboards.
- **App Changelogs** — Public changelog pages for side projects like Side-Track.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 15 (App Router) |
| Frontend | React 19, CSS Modules |
| Data Viz | [D3.js](https://d3js.org/), [Three.js](https://threejs.org/), TopoJSON |
| Backend CMS | WordPress Headless (GraphQL API at `cms.explosion.fun`) |
| Analytics | Vercel Analytics, Vercel Speed Insights |
| Auth/Data | Firebase (v11) |
| Font | Geist (Google Fonts) |

## Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run youtube:data` | Process YouTube export data |

## Key Features

- **GraphQL-powered Blog** — Posts and reviews fetched from a headless WordPress instance with category-specific scoring fields.
- **Interactive Posts** — Dedicated interactive blog posts with bird migration visualizations, solar system simulations, and narrative experiences.
- **YouTube Data Tools** — Client-side analysis of Google Takeout exports (watch history, subscriptions, playlists) — no API key required, fully private.
- **Time Management Dashboard** — Analyzes exported activity data for productivity insights.

## Project Structure

```
src/
  app/              # Next.js App Router pages
    blog/           # Blog listing, ranked views, post pages
    career/         # Portfolio / resume page
    projects/       # Project showcases (YouTube Scholar, Time Management)
    side-track/     # App changelog & legal pages
  components/       # Reusable React components
  config/           # GraphQL queries for WordPress CMS
  utils/            # Data parsers & category helpers
public/
  data/             # Static datasets (bird migration, world map, YouTube exports)
scripts/            # Data processing & analysis scripts
```

## Configuration

### CMS Endpoint

The WordPress GraphQL endpoint is configured in `src/config/graphql.js`:
- Production: `https://cms.explosion.fun/graphql`

## License

No explicit LICENSE file in this repository. Assume all rights reserved unless otherwise stated.

---

Built with curiosity by [Reuben Roy](https://github.com/reuben-roy).
