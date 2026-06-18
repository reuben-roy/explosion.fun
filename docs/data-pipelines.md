# Data pipelines

The site keeps expensive parsing out of runtime pages. Raw exports are processed offline into compact JSON files under `public/data/`, and client experiences read those artifacts directly.

## Pipeline overview

| Experience | Raw/source data | Processor | Runtime artifact |
| --- | --- | --- | --- |
| YouTube Scholar | `public/data/Youtube_Data/` Takeout files | `scripts/process-youtube-data.js` | `public/data/youtube-scholar.json` |
| Curiosity Velocity | YouTube Takeout history/channel data | `scripts/process-youtube-data.js` | `public/data/youtube-curiosity-velocity.json` |
| Time Management | Screen-time spreadsheets under `public/data/time-management/` | `scripts/time-management/*.py` | `public/data/time-management/analysis.json`, `activities_data.json` |
| Bird Migration | `public/data/bird_migration.csv` | parser utilities and committed processed data | `public/data/migration_lite.json` |
| Blog/ranked reviews | WordPress CMS | GraphQL fetches | Static route output |

## YouTube data

Run:

```bash
npm run youtube:data
```

This calls `scripts/process-youtube-data.js`. Keep raw Takeout files and generated artifacts clearly separated. If adding support for another Takeout export shape, normalize it in the script rather than branching throughout React components.

## Time-management data

The time-management pipeline is Python-based:

```bash
python3 scripts/time-management/explore_data.py
python3 scripts/time-management/merge_activities.py
python3 scripts/time-management/analyze_time_usage.py
python3 scripts/time-management/generate_detailed_analysis.py
```

Use the generated JSON files from `public/data/time-management/` in the dashboard. Do not make the dashboard parse `.xlsx` files at runtime.

## Static artifact rules

- Commit small, public, demo-safe generated JSON when it is needed by static pages.
- Do not commit private raw exports unless the repo is explicitly meant to publish them.
- Prefer compact arrays or pre-aggregated summaries for visualization payloads.
- Keep schema notes in this document when adding a new generated artifact.

## Adding a new data story

1. Create a route under `src/app/projects/<story>/` or `src/app/blog/post/interactive/<story>/`.
2. Add processing code under `scripts/<story>/`.
3. Write generated runtime artifacts under `public/data/<story>/`.
4. Keep raw inputs out of UI code.
5. Document the input format, command, and output file here.

## Privacy boundary

Personal exports can reveal browsing, watch history, routines, and preferences. Treat raw exports as private by default. A public artifact should be either anonymized, aggregated, or intentionally published as part of the narrative.
