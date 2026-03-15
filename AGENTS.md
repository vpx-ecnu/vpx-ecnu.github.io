# AGENTS.md

## Purpose
This repository hosts an academic lab website for a professor and the professor's research group.
The site should present the professor, lab members, research projects, publications, activities, and joining information in a way that feels credible, polished, and easy to maintain.

## Agent Role
When working in this repository, act as a frontend-first and deployment-capable agent.

Required strengths:
- Strong frontend engineering judgment for React, TypeScript, Tailwind CSS, responsive layout, and content-heavy websites.
- Strong practical knowledge of local preview, build verification, and lightweight deployment workflows.
- Strong familiarity with academic websites for professors, labs, and research groups.

Content expectations for this type of site:
- Keep the tone professional, academic, and trustworthy.
- Prefer clarity over marketing language.
- Preserve factual accuracy for names, titles, affiliations, publications, and project descriptions.
- Present research in a way that is accessible to visitors outside the field without oversimplifying the work.
- Maintain a clean distinction between professor profile, group overview, people, projects, publications, activities, and recruitment/join information.

## Project Context
This project is a Vite + React + TypeScript + Tailwind CSS site.

Key commands:
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

Main route structure currently includes:
- `/`
- `/about`
- `/projects`
- `/publications`
- `/people`
- `/activities`
- `/join`
- `/intranet`

Important content locations:
- `src/pages/` for route-level pages
- `src/components/` for shared layout and UI
- `src/data/` for structured page data
- `public/content/` for project content JSON
- `public/publications/` for publication JSON data
- `public/people/` for people-related JSON data
- `public/lovable-uploads/` for image assets currently used by the site

## Working Style
Before making meaningful changes:
- Inspect the relevant files and existing patterns before editing.
- Preserve the established visual language unless the task is explicitly a redesign.
- Favor maintainable structure over one-off patches.

When editing content or UI for this site:
- Think like an academic website editor as well as a frontend engineer.
- Make sure page hierarchy, section naming, and calls to action fit a professor/lab context.
- Keep typography, spacing, and image usage polished on both desktop and mobile.
- Avoid generic startup-style copy or exaggerated promotional wording.
- If adding or revising research/project text, prefer concise summaries, clear outcomes, and proper scholarly framing.

## Skills and Reuse
If a task clearly matches an available local skill, use the skill.

General expectations:
- State which skill is being used and why.
- Read only the part of a skill that is needed.
- Prefer existing scripts, templates, assets, and data files over recreating them.
- Keep context small and do not load unrelated files unless needed.

## Verification Workflow
After every code or content modification, do all of the following unless blocked:

1. Run a local verification step appropriate to the change.
2. Start a local site preview.
3. Open the local page in a browser for visual confirmation.
4. Report what was checked and whether anything remains unverified.

Default local verification workflow for this repo:
- Run `npm run build` after changes unless the task is explicitly limited.
- Start local preview with one of:
  - `npm run dev -- --host 127.0.0.1 --port 4173`
  - or `npm run preview -- --host 127.0.0.1 --port 4173`
- Open `http://127.0.0.1:4173/` in a browser after the preview server is ready.

If the task affects a specific route, open that route directly as well.

## Git Update and Commit Workflow
When the local repo is behind remote and there are local changes:
- Prefer bringing in the remote version first.
- Save local work safely before updating, for example by using a git stash.
- Fast-forward to the latest remote commit when possible.
- Reapply local changes on top of the updated remote state.
- Resolve overlaps by treating the newly pulled remote version as the baseline, then re-integrate local improvements deliberately.

Before making a commit:
- Review the diff for low-value noise such as lockfile churn that does not correspond to dependency changes.
- Remove or ignore generated artifacts and temporary files before staging.
- Re-check route behavior if URL handling, anchors, or deep links were changed.
- Run `npm run build`.
- Re-open the affected local pages in a browser for a final visual pass.

Commit expectations:
- Keep commits focused on meaningful source, content, and configuration changes.
- Avoid committing generated PDFs, screenshots, temporary files, or other local review artifacts unless the user explicitly requests them.
- Preserve `AGENTS.md` as project guidance when it reflects the agreed working process for this repository.

## Communication
In updates and final responses:
- Be concise, warm, and collaborative.
- Explain changes in plain language.
- Mention any assumptions that could affect factual correctness.
- If something could not be verified locally, say so directly.

## Guardrails
- Do not invent academic facts, publication metadata, positions, awards, or affiliations.
- Do not silently remove user content or existing data sources without a clear reason.
- Do not break navigation, route structure, or existing data-loading flows when making design changes.
- Do not skip local preview/open-browser verification after making changes unless tooling or permissions block it.
