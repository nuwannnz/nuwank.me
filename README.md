# nuwank.me

The personal blog of Nuwan Karunarathna: practical notes on building software. Built with React and Next.js and exported as a static site.

The design is called **Margin**. See [docs/design](docs/design/README.md) for how it works and the [design system](docs/design/design-system.md) for tokens, components and rules.

## Quick start

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static site in out/, plus the Pagefind search index
pnpm preview      # serve out/ at http://localhost:4173
```

Node 22+ and pnpm 11 are required.

| Script                                         | What it does                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Dev server with hot reload. Drafts and scheduled posts are visible.                                                                      |
| `pnpm build`                                   | `next build` (static export to `out/`), then Pagefind indexes it and copies the index to `public/pagefind/` so search also works in dev. |
| `pnpm preview`                                 | Serves `out/` locally, with folder URLs and the 404 page, to check a build before pushing.                                               |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | ESLint, TypeScript, Prettier. CI runs all three, plus the build.                                                                         |

## Writing a post

Add `src/content/posts/<slug>.md` (or `.mdx`). Images go in `public/images/<slug>/` and are referenced as `/images/<slug>/file.png`.

```yaml
---
title: Using Claude as a Learning Partner # required
description: One sentence shown in lists and search. # required
pubDatetime: 2026-11-03T00:00:00.000Z # required
modDatetime: 2026-11-10T00:00:00.000Z # optional, shown as "Updated"
slug: using-claude-as-a-learning-partner # optional, defaults to the file name
tags: [AI, Learning] # optional, defaults to "others"
author: Nuwan Karunarathna # optional
draft: false # drafts never appear in a build
featured: false
ogImage: /images/my-post/cover.png # optional, otherwise one is generated
canonicalURL: https://medium.com/... # optional, shown as "First published on"
hideEditPost: false
timezone: UTC # optional, for showing the date
---
```

The post is served at `/posts/<slug>/`. Sub-folders inside `src/content/posts/` are only for organising files, and files starting with `_` are ignored. Posts dated in the future appear once their time is within 15 minutes.

Markdown supports:

- GitHub-flavoured Markdown (tables, task lists, footnotes)
- callouts written as `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`
- a `## Table of contents` heading, which is filled in automatically and collapsed
- image captions from the image title: `![alt](/images/x.png "Caption")`
- Shiki code blocks: ` ```ts file="app.ts" ` adds a file name, and `// [!code highlight]`, `// [!code ++]` and `// [!code --]` mark lines

To publish an article from Obsidian, ask your coding agent to use the `publish-obsidian-articles` skill (see [AGENTS.md](AGENTS.md)).

## Features

- Home page with every post grouped by year, plus topics
- Post pages with reading time, topics, a contents list that follows you, share links, back to top and previous/next posts
- Paginated `/posts/` and `/tags/<tag>/`, a topics index, `/archives/` and an About page from Markdown
- Full-text search with [Pagefind](https://pagefind.app/), opened from any page (`/` key) or at `/search/?q=`
- Light and dark mode that follows the system, with a saved toggle and no flash
- Generated social images (`/og.png`, `/posts/<slug>/index.png`), canonical URLs, Open Graph, JSON-LD
- `/rss.xml`, `/sitemap.xml`, `/robots.txt`
- Drafts, scheduled posts, an optional "Suggest an edit" link, MDX

Site settings (title, intro, social and share links, feature switches) live in [`src/site.config.ts`](src/site.config.ts).

## Project layout

```
src/
  app/            routes (pages, feeds, social images) and globals.css
  components/     React components
  lib/            content engine: posts.ts (reading, sorting, tags), markdown.ts (rendering), og.tsx
  content/        posts/ and pages/ in Markdown
  site.config.ts  site settings
public/           static files and post images
scripts/          postbuild (search index) and preview server
docs/design/      design notes, design system and the approved mockup
.agents/skills/   agent skills, shared by every coding agent
```

## Deploying

Vercel deploys the site when changes are pushed to GitHub. `vercel.json` sets the framework to Next.js and runs `pnpm build`, which exports the static site and builds the search index. The project's Output Directory setting in Vercel should be left at its default.

CI (`.github/workflows/ci.yml`) runs lint, type-check, format check and the build on every pull request.

## Migrating from Astro

This site used the AstroPaper theme until November 2026. Post, tag, archive, About, search and RSS URLs are unchanged. The differences:

- The sitemap is now `/sitemap.xml` (was `/sitemap-index.xml`). `robots.txt` points to the new one.
- Interface text is English only. `site.lang` still sets the page language.
