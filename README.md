# VPX Lab Website

> Project note: this repository is also a vibe-coding experiment. The initial version of the site was scaffolded with Lovable, then revised by @uujianghhh, and it is currently being iterated with Codex-based vibe coding. Hope you enjoy it.

This repository maintains the frontend for an academic lab website, along with several scripts and GitHub Actions workflows used to update publications, activities, and social/news content.

The project is now maintained and deployed as a standard GitHub repository. The frontend is built with Vite + React + TypeScript + Tailwind CSS, and the site is deployed to GitHub Pages.

## Overview

The site currently includes the following main routes and content areas:

- `/` home page and lab overview
- `/about` professor and lab introduction
- `/projects` ongoing and completed projects
- `/publications` publication list and publication cards
- `/people` faculty, PhD students, graduate students, undergraduates, part-time members, and alumni
- `/activities` academic activities, reading club, and lab news
- `/join` admissions and joining information
- `/intranet` internal portal

This is a static website project. Most content is loaded from structured data in `src/data/`, `public/content/`, `public/people/`, `public/publications/`, and other static assets under `public/`.

## Tech Stack

- Vite
- React 18
- TypeScript
- React Router
- Tailwind CSS
- Radix UI / shadcn-style components
- GitHub Actions
- Python scripts for publications, reading club, and news updates

## Local Development

Recommended environment:

- Node.js 20 or newer
- npm
- Python 3.11 or similar for update scripts

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

If you want to match the repository's default local verification flow, you can explicitly set the host and port:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Common commands:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

The production build is written to `dist/`. For local preview:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

## Project Structure

```text
.
├── .github/workflows/          # GitHub Actions for deployment and content updates
├── public/
│   ├── content/                # Project content JSON and project images
│   ├── people/                 # People JSON files and profile images
│   ├── publications/           # Publication data, card feeds, generated media assets
│   ├── reading_club_covers/    # Reading club cover images
│   ├── xhs_news_images/        # Cached news images
│   └── xhs_news_videos/        # Cached news videos
├── scripts/                    # General content update scripts
├── src/
│   ├── backend/                # Publication update and card-generation scripts
│   ├── components/             # Shared UI and layout components
│   ├── data/                   # Structured site data
│   └── pages/                  # Route-level pages
├── MediaCrawler/               # Dependency used for Xiaohongshu/XHS crawling
└── run_xhs_pipeline_mediacrawler.py
```

## Content Maintenance

### 1. Pages and Copy

- Route-level pages are in `src/pages/`
- Shared layout and UI components are in `src/components/`
- Structured site data is in `src/data/`

Content that is commonly edited directly includes:

- `src/data/activities.ts`
- `src/data/labLife.ts`
- `src/data/readingClub.json`
- `public/content/*.json`
- `public/people/*.json`

### 2. Project Content

The projects page mainly depends on:

- `public/content/ongoing-projects.json`
- `public/content/completed-projects.json`
- `public/content/ongoing_image/`
- `public/content/completed_image/`

If you are only updating project descriptions, links, or images, you usually do not need to modify the React components.

### 3. People Data

The people page mainly depends on:

- `public/people/faculty.json`
- `public/people/phd.json`
- `public/people/graduate.json`
- `public/people/Undergraduate.json`
- `public/people/part-time.json`
- `public/people/alumni.json`
- `public/people/people_image/`

### 4. Publication Data

The main publication-related frontend inputs are:

- `public/publications/publication_updated.json`
- `public/publications/recent_publications.json`
- `public/publications/project_publications.json`
- `public/publications/recent_images/`

In practice:

- `publication_updated.json` is the complete publication dataset
- `recent_publications.json` powers recent publication cards on the homepage
- `project_publications.json` powers project-linked publication cards
- `recent_images/` stores images, videos, and poster assets used by publication cards

## Publication Update Workflow

The publication update scripts live in `src/backend/`. The current local workflow is:

```bash
python3 src/backend/build_publication_updated.py
python3 src/backend/update_recent_publications_cards.py
python3 src/backend/update_project_publications_cards.py
```

Before running them locally, you will typically need:

```bash
python3 -m pip install requests beautifulsoup4 lxml pillow
```

After the update, verify that these outputs were refreshed consistently:

- `public/publications/publication_updated.json`
- `public/publications/recent_publications.json`
- `public/publications/project_publications.json`
- `public/publications/recent_images/`

The publication workflow in this repository follows these rules:

- Google Scholar is the primary source
- `IHPDEP Selected Publications` acts as a curated overlay
- If a publication appears in both sources, the metadata from `IHPDEP Selected Publications` takes precedence
- If a selected publication does not appear in Google Scholar, it should still remain in the final output
- If `project_webpage` returns `404`, the downstream card feed should not keep that broken entry alive

## Reading Club Updates

Reading club data is automatically fetched and written back into the repository with:

```bash
python3 scripts/update_reading_club.py
```

This script updates:

- `src/data/readingClub.json`
- `public/reading_club_covers/`

The current source is a designated Bilibili series API.

## Xiaohongshu/XHS News Updates

Phase 1 of the local XHS studio uses the same Python pipeline, but the intended
operator flow is now local rather than GitHub-hosted:

1. Start the local studio API:

```bash
npm run studio:install
npm run studio:server
```

2. Start the site locally:

```bash
npm run dev
```

3. Open `http://127.0.0.1:5173/studio/news` (or the port Vite prints)
4. Run a local preview sync, review the draft, then merge / publish
5. Optionally sync the freshest local XHS cookie cache back to GitHub secrets from the studio UI
   - This uses the local GitHub CLI session, so run `gh auth login` on your machine first
   - The studio keeps this separate from normal content `Commit and push`, so secret rotation and content publishing stay independently recoverable
6. Commit and push when the local result looks right

The pipeline entry point remains:

```bash
python3 run_xhs_pipeline_mediacrawler.py
```

Inputs and dependencies:

- `MediaCrawler/`
- `secrets/xhs_cookies.txt` or the `XHS_COOKIES` environment variable
- Preferred: `secrets/xhs_creator_url.txt` or `XHS_CREATOR_URL`
  - The local studio now uses creator mode as the primary sync strategy; a full creator profile URL is preferred because it can carry the freshest `xsec` context
- Fallback: `secrets/xhs_creator_id.txt` or `XHS_CREATOR_ID`
  - A 24-character internal creator user ID also works when a full profile URL is not available
- Optional: `secrets/xhs_target_user_id.txt` or `XHS_TARGET_USER_ID`
  - Used as the stable local filter and identity contract for the VPX account; supports one or more IDs separated by commas or new lines
- Optional: `secrets/xhs_target_nicknames.txt` or `XHS_TARGET_NICKNAMES`
  - Fallback nickname filter when needed
- Optional: `secrets/xhs_search_keywords.txt` or `XHS_SEARCH_KEYWORDS`
  - Search mode still exists for debugging, but it is no longer the primary studio flow

This script updates:

- `public/news.json`
- `public/xhs_news_images/`
- `public/xhs_news_videos/`

Publishing from the local studio now merges by note `id`:

- New Xiaohongshu note IDs are added to `public/news.json`
- Existing items are kept unchanged, so manual edits in `public/news.json` are not overwritten by a later sync

The local studio also writes preview and operator state under:

- `.local/studio/news/`

During local preview sync, the studio also refreshes:

- `secrets/xhs_cookies.txt`
  - exported from the local browser session after a successful Xiaohongshu login
  - stores the full current cookie string, not just `web_session`
  - can then be synced back into the repository's `XHS_COOKIES` GitHub secret from the studio UI

The GitHub credential sync in the studio intentionally updates only the stable pieces needed for the backup workflow:

- `XHS_COOKIES`
- `XHS_CREATOR_ID`
- `XHS_CREATOR_URL`
  - written with the stable creator user ID to override any stale URL-style secret without reintroducing volatile `xsec_token` values
- `XHS_TARGET_USER_ID`
- `XHS_TARGET_NICKNAMES`

The GitHub workflow remains available for low-frequency backup runs, but the
primary Xiaohongshu operator flow is the local studio.

## GitHub Actions

The workflows most directly related to site maintenance are:

- `.github/workflows/deploy.yml`
  - Builds and deploys the site to GitHub Pages whenever `main` is updated
- `.github/workflows/update_publications.yml`
  - Updates publication data monthly and can also be triggered manually
- `.github/workflows/update-reading-club.yml`
  - Updates reading club data and covers daily
- `.github/workflows/update_xhs_news.yml`
  - Low-frequency backup XHS path; the normal news publishing path is now local studio -> local verification -> git push -> deploy

The deployment workflow copies `dist/index.html` to `dist/404.html` after build time so SPA route refreshes work correctly on GitHub Pages.

## Deployment

The current deployment target is GitHub Pages:

1. Make and verify local changes
2. Run `npm run build`
3. Commit and push to `main`
4. GitHub Actions builds and deploys `dist/`

Even for content-only changes, it is still recommended to run a local build before pushing so that data-loading issues are caught early.

## Recommended Maintenance Flow

For most changes, the recommended sequence is:

1. Update pages, JSON data, or scripts
2. Run `npm run lint` if frontend code changed
3. Run `npm run build`
4. Review the site locally with `npm run preview -- --host 127.0.0.1 --port 4173`
5. Push to `main` after everything looks correct

## Notes

- `dist/` is a build artifact and is not intended for manual editing
- Some files under `public/publications/` are generated outputs, so publication-pipeline changes should always be checked against the generated results
- Most site maintenance can still be done through normal git-based edits, but XHS news publishing is now designed around the local studio workflow rather than GitHub-hosted crawling
