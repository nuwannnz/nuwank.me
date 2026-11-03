---
name: publish-obsidian-articles
description: Add a finalized article from the user's Obsidian Articles folder to the nuwank.me blog as a reviewable local change. Use when the user asks to publish, add, import, convert, or prepare one of their Obsidian articles (proofread.md) as a blog post on nuwank.me.
---

# Publish Obsidian Articles

Move one requested article from the user's Obsidian vault into the nuwank.me blog repo as a local source change the user can review. A bundled script does the mechanical conversion so every agent gets the same result; you handle the judgement calls (which article, publish date, description, tags, alt text, anything the script could not resolve).

## Source and selection

- Articles live under `/Users/nuwan-swivel/Documents/notes-obsidian/Personal/Articles/`. The vault root is `/Users/nuwan-swivel/Documents/notes-obsidian`.
- Each named subfolder that contains `proofread.md` is an article. `proofread.md` is the finalized copy; `article.md` is the original draft and is never published.
- Ignore Markdown files sitting directly in the Articles root. Never publish every folder: select only the article the user asked for. If the name is ambiguous or missing, list the folders that have a `proofread.md` and ask.
- Preserve the finalized wording. Change only the formatting and embeds the blog needs, unless the user asks for editing.

## Blog target

- Repo: work in the nuwank.me checkout the user is currently in (the main checkout or any git worktree of it). If unclear, default to `/Users/nuwan-swivel/projects/test-apps/nuwank.me`.
- Posts: `src/content/posts/<slug>.md` (use `.mdx` only if the post truly needs MDX). Public URL: `/posts/<slug>/`.
- Images: `public/images/<slug>/<file>`, referenced in the post as `/images/<slug>/<file>`.
- Frontmatter: `title` (required), `description` (required), `pubDatetime` (required, ISO date), optional `modDatetime`, `slug`, `tags` (list), `author` (default `Nuwan Karunarathna`), `draft`, `featured`, `ogImage`, `canonicalURL`, `hideEditPost`, `timezone`. For a requested ready-to-add post include an explicit stable `slug`, tags, `author: Nuwan Karunarathna`, and `draft: false`.
- Rendering features you can rely on: GitHub-flavoured Markdown (tables, task lists, footnotes), GitHub-style callouts (`> [!NOTE] Optional title`), Shiki code blocks (a `file="name.ts"` meta after the language adds a filename label; `// [!code highlight]`, `// [!code ++]`, `// [!code --]` annotate lines), and a `## Table of contents` heading that is filled in automatically.
- The site renders the title itself, so the post body must not start with a duplicate `# Title`.

## Workflow

1. **Check the target checkout.** Look at its git status and note any existing changes. They are not yours: leave them untouched and do not include them in anything you report as your change.
2. **Read the article.** Read `proofread.md` yourself so you know the context: where a publish date might be stated, what a good one-sentence description would be, and what each image shows.
3. **Dry run the script** (it lives next to this file, at `scripts/prepare-article.mjs`; it needs Node 22+ and nothing else):

   ```sh
   node <this-skill-folder>/scripts/prepare-article.mjs "<Article Name>" --repo <checkout> --dry-run
   ```

   It prints a JSON summary and writes nothing. Options: `--slug`, `--date YYYY-MM-DD`, `--tags "A,B"`, `--description "..."`, `--vault <path>` (only if the vault moved). The article can also be given as a folder path or a path to `proofread.md`.
4. **Fill in what the summary lists under `needsInput`.**
   - `pubDatetime`: use a date the user gave or one the article clearly states. Otherwise ask the user. Never invent a date. A `hints.pubDatetime` value (for example an Obsidian `created` field) is only a suggestion to confirm with the user.
   - `description`: use one from the Obsidian frontmatter if present; otherwise draft one sentence from the article's own intro and show it to the user with your result.
   - `tags`: reuse the site's existing tags where they fit (read the `tags` of posts in `src/content/posts/`; they use Title Case such as `AI`, `Learning`, `UWP`). Review tags carried over from Obsidian, since vault tags can be workflow tags rather than topics.
   - Slug: the default is the kebab-cased title. Pass `--slug` if that is very long or the user wants something specific.
5. **Run it for real** with the same arguments plus the answers, without `--dry-run`. It refuses (non-zero exit, clear message) to overwrite an existing post, a post that already uses the slug, or an existing image with different content. If that happens, do not delete or replace anything; pick another slug or ask the user.
6. **Finish what the script left for you** (all listed in its summary):
   - `unresolvedEmbeds`: these are left in the post as `![[...]]`. Find the image (ask the user if it is not in the vault) and copy it into `public/images/<slug>/` with a kebab-case name, or ask the user how to handle note/PDF embeds. No vault-specific syntax may remain.
   - `altFromFilename`: the alt text was derived from a file name such as `Pasted image 2024...`. Replace it with a short description of what the image shows.
   - `flattenedWikilinks`: links to vault notes became plain text because those notes are not on the site. If the target is already a published post, you may link to `/posts/<slug>/`; otherwise leave the text.
   - `warnings`: for example a callout type outside `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Check it renders; if not, switch to the closest of those five.
   - Light formatting only: add missing code-block languages, fix heading levels if the article skipped one. Do not reword prose.
7. **Verify.** In the checkout run `pnpm build` (production check) or `pnpm dev` and open `http://localhost:3000/posts/<slug>/`. If the repo's `package.json` defines different scripts, use those. Confirm the post builds, images load, callouts and code blocks render.
8. **Report** the post path, the image files added, any input you assumed or still need, and remind the user nothing was committed.

## What the script converts

So you can check its work, or do it by hand if Node is unavailable:

- Obsidian frontmatter is parsed and merged: `title`, `slug`, `description` (or `summary`/`excerpt`), `tags` (`#` prefix and nested `parent/` prefix removed), `pubDatetime`/`publishDate`/`published`, and schema fields such as `canonicalURL` are kept; Obsidian-only keys (`aliases`, `created`, `cssclasses`, ...) are dropped and listed in `warnings`.
- Title: frontmatter `title`, else the first `# H1` (which is removed from the body), else the folder name.
- `![[img.png]]` becomes `![alt](/images/<slug>/img.png)`; `![[img.png|Alt text]]` keeps the alt text; `![[img.png|300]]` or `|300x200` becomes `<img src="..." alt="..." width="300" height="200" />`. Relative Markdown images `![alt](attachments/img.png)` are handled the same way.
- Images are looked up as written, then in the article folder, then anywhere in the vault, preferring an `attachments`/`assets`/`images`-style folder when several files share the name. Only images the article uses are copied, renamed to safe kebab-case (`Pasted image 1.PNG` becomes `pasted-image-1.png`). An identical file already in place is reused.
- `[[Note]]`, `[[Note|label]]`, `[[Note#Heading]]` become plain text (the label, or the note name).
- `==highlight==` becomes `<mark>highlight</mark>`; `%%comments%%` (inline or multi-line) are removed; block IDs like ` ^abc123` are removed.
- Obsidian callouts `> [!note] Title` (including `+`/`-` fold markers) are kept, with the type upper-cased to the GitHub form `> [!NOTE] Title`.
- Fenced code blocks and inline code are never altered.

## Boundaries

- Make a local source change for review only. Do not commit, push, deploy, open a PR, or publish anywhere unless the user separately asks. If they ask for a commit, use the message format `(article): <title>`.
- Inspect the working tree first and preserve unrelated changes. Never overwrite an existing post or asset; resolve name collisions deliberately (new slug or ask).
- Do not modify site configuration, layout code, other posts, or the Obsidian vault. Never publish root-level files in the Articles folder or `article.md` drafts.
- Ask rather than invent: publish date, missing images, and anything else you cannot infer from the article or the user.
