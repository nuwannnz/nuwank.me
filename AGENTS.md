# Agent guide for nuwank.me

Personal blog of Nuwan Karunarathna. A Next.js (App Router) React app that exports a static site. Read `README.md` for the full picture. `CLAUDE.md` is a symlink to this file.

## Development

- Install: `pnpm install` (Node 22+, pnpm 11).
- Dev server: `pnpm dev` on http://localhost:3000. Run it in the background and stop it when you're done.
- Production check: `pnpm build` (static export to `out/` and Pagefind index), then `pnpm preview` on http://localhost:4173.
- Before finishing a code change, run `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`. CI runs the same checks.

## Where things live

- Posts: `src/content/posts/<slug>.md` (frontmatter documented in `README.md`). Images go in `public/images/<slug>/`.
- Pages: `src/content/pages/` (e.g. `about.md`).
- Site settings: `src/site.config.ts`.
- Content engine: `src/lib/posts.ts` (loading, sorting, tags, pagination) and `src/lib/markdown.ts` (remark/rehype/Shiki pipeline).
- Routes: `src/app/`. Every route must be static: give dynamic segments `generateStaticParams`, and set `dynamic = "force-static"` on route handlers. `next.config.ts` uses `output: "export"`.
- Styles: `src/app/globals.css` only, built on the Margin design system. Read `docs/design/design-system.md` before changing any UI. Use the existing tokens, scale and components. Don't add one-off colours, sizes, cards, shadows or animations.

## Docs

- Next.js: https://nextjs.org/docs (App Router, static exports: https://nextjs.org/docs/app/guides/static-exports)
- Pagefind: https://pagefind.app/docs/
- Shiki: https://shiki.style/

## Skills

- **publish-obsidian-articles**: when asked to publish, add, import or convert one of Nuwan's Obsidian articles into a blog post, read and follow `.agents/skills/publish-obsidian-articles/SKILL.md` before doing anything. It uses `node .agents/skills/publish-obsidian-articles/scripts/prepare-article.mjs` for the conversion. Make a local change only; do not commit, push or deploy unless asked.

## Commit message formats

Use semantic commit messages, e.g. "(chore | docs | article | fix | feat): commit message". For articles, use "(article): [title]".
