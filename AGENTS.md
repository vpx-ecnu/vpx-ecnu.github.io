# AGENTS.md

## Scope
This repository hosts an academic lab website for a professor and research group. Optimize for a polished, credible, easy-to-maintain site rather than generic marketing UI.

Use this file for repo-specific rules only. Prefer `README.md` for fuller setup and workflow details.

## Role
Act as a frontend-first, deployment-capable agent for a Vite + React + TypeScript + Tailwind CSS site.

Priorities:
- Keep tone professional, academic, and factual.
- Preserve clear separation between professor, lab, people, projects, publications, activities, and joining information.
- Favor maintainable structure over one-off patches.

## Important Paths
- `src/pages/`: route-level pages
- `src/components/`: shared layout and UI
- `src/data/`: structured site data
- `public/content/`: project content JSON
- `public/people/`: people data
- `public/publications/`: publication datasets and card media
- `src/backend/`: publication update scripts
- `.github/workflows/`: deployment and content automation

## Publication Workflow
Treat the publications pipeline as a maintained content workflow, not a generic scraper.

- `publication_updated.json` = Google Scholar primary source + `IHPDEP Selected Publications` overlay.
- If both sources match a paper, `IHPDEP Selected Publications` wins.
- If a selected publication is missing from Google Scholar, keep it.
- `project_webpage` comes from the curated overlay and is required by downstream card generators.
- Keep the downstream contract intact: changes must not break `recent_publications.json` or `project_publications.json`.
- Publication card media should stay automation-first; do not turn manual per-paper image curation into the default workflow.
- Both still images and project videos are valid card media. Prefer videos only when they produce a strong card-ready result.
- Normalize card media for stable `16:9` output; for videos, generate posters from sampled frames.
- If `project_webpage` returns `404`, skip that item from downstream card feeds.
- Keep media failures visible; prefer warnings and preserving previous good outputs over silently degrading feeds.
- When modifying the publication pipeline, regenerate:
  - `public/publications/publication_updated.json`
  - `public/publications/recent_publications.json`
  - `public/publications/project_publications.json`
  - referenced assets under `public/publications/recent_images/`

## Merge And Cleanup Rules
- Scheduled workflows may update generated publication JSON while local work is in progress. Merge conflicts in publication feeds are expected.
- When resolving those conflicts, use the newer remote data as baseline, then re-apply local improvements deliberately.
- For publication cards, preserve the richer feed shape when available: `image`, `mediaType`, `media`, and `poster`. Do not accidentally collapse entries back to image-only objects.
- After resolving publication-feed conflicts, confirm every JSON-referenced file under `public/publications/recent_images/` exists.
- If cleaning `public/publications/recent_images/`, keep only assets referenced by the current publication JSON outputs unless the task explicitly asks for a broader cleanup.

## Working Style
- Inspect existing patterns before editing.
- Preserve the current visual language unless the task is explicitly a redesign.
- When editing site copy, prefer clarity over hype and avoid inventing academic facts.
- Reuse existing scripts, templates, assets, and data files when possible.
- Use a local skill when the task clearly matches one.

## Verification
After code or content changes, unless blocked:

1. Run an appropriate local verification step. Default: `npm run build`.
2. Start a local preview, usually with `npm run preview -- --host 127.0.0.1 --port 4173`.
3. Open the relevant page in a browser. If `4173` is occupied, use the actual port Vite selects.
4. Report what was checked and what remains unverified.

## Git And Commits
- If remote is ahead and local changes exist, save local work first, update from remote, then reapply local changes carefully.
- Review diffs for low-value generated noise before committing.
- Keep commits focused.
- Do not commit temporary review artifacts unless explicitly requested.

## Guardrails
- Do not invent publication metadata, affiliations, positions, awards, or project facts.
- Do not silently remove user content or data sources without a reason.
- Do not break routing, navigation, or data-loading flows.
- Do not change publication source precedence away from `IHPDEP Selected Publications` overriding matching Google Scholar entries unless explicitly requested.
