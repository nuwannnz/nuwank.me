# publish-obsidian-articles

Agent skill that moves a finalized article (`proofread.md`) from the Obsidian vault into this blog as a reviewable local change. This folder is the single canonical copy; every agent is pointed here instead of keeping its own duplicate.

| File | Purpose |
| --- | --- |
| `SKILL.md` | Instructions, written for any agent (frontmatter `name` + `description`). |
| `scripts/prepare-article.mjs` | Deterministic conversion (Node 22+, no dependencies). Run with `--help`. |
| `agents/openai.yaml` | Codex display metadata. Other agents ignore it. |

## How each agent finds it

- **Claude Code**: reads skills from `.claude/skills/`. `.claude/skills/publish-obsidian-articles` is a relative symlink to `../../.agents/skills/publish-obsidian-articles`, so the project skill loads from this folder.
- **Codex**: reads user skills from `~/.codex/skills/`. Until this branch is merged, `~/.codex/skills/publish-obsidian-articles/` holds a copy of `SKILL.md`, `scripts/` and `agents/openai.yaml`. After merging, replace that copy with a symlink so there is only one source:

  ```sh
  rm -rf ~/.codex/skills/publish-obsidian-articles
  ln -s /Users/nuwan-swivel/projects/test-apps/nuwank.me/.agents/skills/publish-obsidian-articles ~/.codex/skills/publish-obsidian-articles
  ```

  (Codex versions that scan `.agents/skills/` in the repo pick it up directly.)
- **Cursor, Gemini CLI, GitHub Copilot and other AGENTS.md readers**: they have no skill loader, so `AGENTS.md` points them at `SKILL.md` with the entry below.

## AGENTS.md entry

```markdown
## Skills

- **publish-obsidian-articles**: when asked to publish, add, import or convert one of Nuwan's Obsidian articles into a blog post, read and follow `.agents/skills/publish-obsidian-articles/SKILL.md` before doing anything. It uses `node .agents/skills/publish-obsidian-articles/scripts/prepare-article.mjs` for the conversion. Make a local change only; do not commit, push or deploy unless asked.
```

## Testing the script

Point it at a throwaway vault and repo, never the real ones:

```sh
node scripts/prepare-article.mjs "My Article" --vault /tmp/fake-vault --repo /tmp/fake-repo --dry-run
```

The fake vault needs `Personal/Articles/My Article/proofread.md`; the fake repo needs empty `src/content/posts/` and `public/images/` folders.
