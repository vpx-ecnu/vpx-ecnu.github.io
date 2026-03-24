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

## Fast Start For New Threads
- Do not rescan the whole repository to rediscover basic project structure if the task is a routine page/content/layout update. Read `AGENTS.md` first, then only inspect the files directly relevant to the request.
- Default task-to-file starting points:
  - Homepage layout/content: `src/pages/Index.tsx`
  - Homepage news data: `public/news.json`
  - Activities page layout/content: `src/pages/Activities.tsx`
  - Reading Club data: `src/data/readingClub.json`
  - Homepage / projects data: `public/content/ongoing-projects.json`
  - Homepage / publication cards: `public/publications/project_publications.json`
  - Homepage people/stat counts: `public/people/faculty.json`, `public/people/phd.json`, `public/people/graduate.json`, `public/people/part-time.json`, `public/people/Undergraduate.json`
  - Publication pipeline: `src/backend/` scripts plus `.github/workflows/update_publications.yml`
  - News pipeline: `src/pages/StudioNews.tsx`, `src/server/index.js`, `run_xhs_pipeline_mediacrawler.py`, and `.github/workflows/update_xhs_news.yml`
  - Reading Club pipeline: `scripts/update_reading_club.py` plus `.github/workflows/update-reading-club.yml`
- Escalate to broader repo exploration only when the task actually changes architecture, routing, build/deploy behavior, or a data source contract.

## Homepage Data Flow
- The homepage ongoing-research carousel is sourced from `public/content/ongoing-projects.json`. Keep it aligned with the `Projects` page instead of maintaining duplicate hardcoded slide content in `src/pages/Index.tsx`.
- The homepage `Recent Publications` section consumes the first 6 items from the full `project_publications.json` feed. Treat `recent_publications.json` as a derived compatibility artifact, not the primary source of homepage ordering.
- The homepage `Latest News & Activities` section currently consumes the latest 8 items from `public/news.json` and renders them as an editorial mosaic in `src/pages/Index.tsx`.
- Homepage stats are intentional data contracts:
  - `Publications` = total items in `public/publications/publication_updated.json`
  - `Current Members` = sum of the current people JSON files used on the homepage (`faculty.json`, `phd.json`, `graduate.json`, `part-time.json`, `Undergraduate.json`)
  - `Years of Research` = floor of elapsed years since October 2020, not a simple calendar-year delta and not a manually entered number

## Activities And News Data Flow
- The `/activities` page `News & Activities` tab and the homepage news mosaic intentionally share the same source: `public/news.json`.
- The `/activities` page `VPX Reading Club` tab uses `src/data/readingClub.json`, not `public/news.json`.
- `public/news.json` is the maintained source of truth for site news cards. Keep its companion media directories aligned:
  - `public/xhs_news_images/`
  - `public/xhs_news_videos/`
- `src/data/activities.ts` is currently legacy/static draft data and is not the active source for the homepage or `/activities` page. Do not update it unless you are intentionally reconnecting that file to the UI.
- When modifying homepage or `/activities` news presentation, prefer preserving the shared `public/news.json` contract rather than introducing duplicate page-specific datasets.
- The primary XHS operator workflow is local studio:
  - `/studio/news` for preview, merge, local verification, git push, and optional GitHub secret sync
  - `run_xhs_pipeline_mediacrawler.py` for the underlying creator-mode crawl / transform
  - `.github/workflows/update_xhs_news.yml` as a low-frequency backup path, not the primary day-to-day publishing path
- Local studio publishing is intentionally merge-based:
  - add new Xiaohongshu note IDs into `public/news.json`
  - preserve existing entries and manual edits for matching IDs
- Local studio can refresh `secrets/xhs_cookies.txt` from a successful browser login and optionally sync safe GitHub secrets (`XHS_COOKIES`, stable creator ID, target IDs) through the local `gh` CLI session. Do not treat volatile `xsec_token` values as durable repo configuration.

## Publication Workflow
Treat the publications pipeline as a maintained content workflow, not a generic scraper.

- `publication_updated.json` = Google Scholar primary source + `IHPDEP Selected Publications` overlay.
- `project_publications.json` = full ordered feed of project-backed publication cards.
- `recent_publications.json` = top 6 derived from `project_publications.json`; keep ordering logic centralized in the full feed instead of maintaining separate selection rules in multiple places.
- If both sources match a paper, `IHPDEP Selected Publications` wins.
- If a selected publication is missing from Google Scholar, keep it.
- `project_webpage` comes from the curated overlay and is required by downstream card generators.
- Keep the downstream contract intact: changes must not break `recent_publications.json` or `project_publications.json`.
- Publication card media should stay automation-first; do not turn manual per-paper image curation into the default workflow.
- Both still images and project videos are valid card media. Prefer videos only when they produce a strong card-ready result.
- Normalize card media for stable `16:9` output; for videos, generate posters from sampled frames.
- If `project_webpage` returns `404`, skip that item from downstream card feeds.
- Keep media failures visible; prefer warnings and preserving previous good outputs over silently degrading feeds.
- In `update_publications.yml`, preserve the generation order: `build_publication_updated.py` -> `update_project_publications_cards.py` -> `update_recent_publications_cards.py` -> `generate_derived_media.py`.
- When modifying the publication pipeline, regenerate:
  - `public/publications/publication_updated.json`
  - `public/publications/recent_publications.json`
  - `public/publications/project_publications.json`
  - referenced assets under `public/publications/recent_images/`

## Deployment Automation
- `deploy.yml` intentionally listens to `workflow_run` from content-updating workflows because bot-authored commits created with `GITHUB_TOKEN` do not reliably trigger downstream `push` deploy workflows.
- If you change scheduled content automation, preserve an explicit path from automated content updates to GitHub Pages deployment.

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
- For this repository, do not treat local verification alone as permission to commit or push. Commit and push only after the user explicitly asks for it or clearly approves it in the current thread.
- Once that explicit approval has been given, do not ask for a second redundant confirmation before the actual `commit` or `push` unless the scope changed, the diff now includes unexpected files, or there is another concrete risk that should be surfaced first.
- When committing or pushing, do not include unrelated local changes in the commit; keep the user's separate working changes untouched.

## Guardrails
- Do not invent publication metadata, affiliations, positions, awards, or project facts.
- Do not silently remove user content or data sources without a reason.
- Do not break routing, navigation, or data-loading flows.
- Do not change publication source precedence away from `IHPDEP Selected Publications` overriding matching Google Scholar entries unless explicitly requested.
