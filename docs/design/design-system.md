# Margin design system

The rules, tokens and components behind nuwank.me. Every value here exists as a CSS custom property or class in [`src/app/globals.css`](../../src/app/globals.css). For the reasoning behind the design, see [README.md](./README.md).

## Colour

Seven tokens, each defined for light and dark. Components use tokens only, never raw hex.

| Token      | Light     | Dark      | Use                                                                    |
| ---------- | --------- | --------- | ---------------------------------------------------------------------- |
| `--paper`  | `#f5f6f3` | `#151917` | Page background                                                        |
| `--ink`    | `#1f2421` | `#e2e6e1` | Body text, titles, active nav                                          |
| `--quiet`  | `#646b67` | `#939b96` | Secondary text: dates, descriptions, labels, inactive nav              |
| `--hair`   | `#daddd8` | `#2b312e` | Hairline rules and image borders                                       |
| `--pine`   | `#22604b` | `#93c8b1` | Links in articles, focus ring, active contents marker, hover on topics |
| `--lichen` | `#dfe9d6` | `#29392f` | Text selection, search matches (`<mark>`), highlighted code lines      |
| `--well`   | `#ebede8` | `#1d2220` | Code background, callouts, icon-button hover                           |

Contrast on `--paper` (WCAG):

|       | `--ink` | `--quiet` | `--pine` |
| ----- | ------- | --------- | -------- |
| Light | 14.5:1  | 5.0:1     | 6.8:1    |
| Dark  | 14.1:1  | 6.2:1     | 9.4:1    |

`--quiet` on `--well` is 4.6:1 in light mode and 5.7:1 in dark mode, so it still passes AA on code and callout backgrounds.

Warnings and cautions in callouts, and removed lines in diffs, use `#b4442e`. That's the only extra hue, and it's for meaning, not decoration.

### Themes

- The default follows the system (`prefers-color-scheme`).
- The toggle in the header sets `data-theme="light|dark"` on `<html>` and saves it in `localStorage` under `theme`.
- An inline script in `<head>` applies the saved theme before first paint, so the page never flashes.
- CSS order: tokens on `:root` (light) → dark overrides inside `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` → the same dark overrides on `:root[data-theme="dark"]`.

## Typography

| Role                       | Family           | Token     | Notes                                                        |
| -------------------------- | ---------------- | --------- | ------------------------------------------------------------ |
| Interface, headings, lists | Hanken Grotesk   | `--sans`  | Weights 300 (display), 400, 500 (titles), 600 (site name)    |
| Article text, summaries    | Source Serif 4   | `--serif` | Optical sizing on; italic for the summary under a post title |
| Code                       | Google Sans Code | `--mono`  | Code blocks and inline code only, never labels               |

Fonts load through `next/font/google` (self-hosted at build time). Social images use the TTFs in `src/assets/fonts/`.

### Scale

| Token      | Size                              | Used for                                                      |
| ---------- | --------------------------------- | ------------------------------------------------------------- |
| `--s-1`    | 0.8125rem                         | Small details: margin labels, captions, search status, footer |
| `--s0`     | 1rem                              | Interface text, post descriptions                             |
| `--s-body` | 1.1875rem (1.0625rem under 760px) | Article text, line-height 1.72                                |
| `--s1`     | 1.25rem                           | Post titles in lists, year labels, bio, summaries             |
| `--s2`     | 1.625rem                          | Article `h2`, search input                                    |
| `--s3`     | clamp(1.875rem → 2.5rem)          | Page and post titles, weight 400                              |
| `--s4`     | clamp(2.125rem → 3.375rem)        | The home intro only, weight 300, tracking −0.022em            |

Rules:

- Headings use `text-wrap: balance`; list titles use `text-wrap: pretty`.
- Line length stays under about 70 characters (`--column: 40rem` at the body size).
- No all-caps labels and no tracked-out eyebrows. Labels are sentence case in `--quiet`.
- Numbers that line up (dates, counts, years) use `tabular-nums`.
- Never emphasise one word of a heading with colour, italics or weight.

## Layout

```
| page gutter | --margin | --gap | --column (≤ 40rem) | room |
```

| Token          | Value                                           |
| -------------- | ----------------------------------------------- |
| `--margin`     | 9.5rem (7.5rem under 1000px, 11rem from 1440px) |
| `--column`     | 40rem                                           |
| `--gap`        | clamp(1.5rem, 4vw, 3.5rem)                      |
| Page max width | margin + gap + column + 6rem                    |
| Side gutter    | `max(16px, safe-area inset, 4vw)`               |

- `.grid` creates the two columns. `.margin` puts content in column 1 and `.main` in column 2.
- Everything is left-aligned to the column edge, with three exceptions: dates in post rows and the "Next post" link are right-aligned, and images in posts are centred in the column with their captions centred beneath them.
- Sections are separated by `.section`: `2.25rem` padding with a top hairline. Year groups, topics and pagination all use it.

### Breakpoints

| Width    | Change                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 1440px | Root size grows fluidly from 16px to 18px (at 2560px), scaling the whole grid and type scale; margin widens to 11rem                                                |
| ≤ 1000px | Margin narrows to 7.5rem                                                                                                                                            |
| ≤ 760px  | Single column: margin content moves above the column; post details become a two-up grid; contents list hides; dates move above titles; body text drops to 1.0625rem |
| ≤ 480px  | Header nav spreads across one full-width line                                                                                                                       |

Nothing scrolls sideways at any width. Code blocks and tables scroll inside their own box.

## Components

| Component    | Class / file                     | Description                                                                                                                                                                                                                                                   |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header       | `.site-header`, `SiteHeader.tsx` | Name on the left; Writing, Topics, About, Search and theme icon on the right. Active page is `--ink` with a 1px underline.                                                                                                                                    |
| Search band  | `.search`, `Search.tsx`          | Opens under the header from the Search button or the `/` key; Esc closes. Margin label "Search", large light input, live status line, results as post rows. Uses Pagefind for full text after a build, and falls back to titles, summaries and topics in dev. |
| Theme toggle | `.icon-btn`, `ThemeToggle.tsx`   | Moon in light mode, sun in dark mode. 36px round hit area, label "Switch to dark/light theme".                                                                                                                                                                |
| Intro        | `.hero`                          | `--s4` light heading, bio at `--s1`, then the social links row. Home page only.                                                                                                                                                                               |
| Links row    | `.links`                         | Icon plus label, `--quiet`, turns `--ink` on hover. Used for socials and 404 actions.                                                                                                                                                                         |
| Year group   | `YearArchive` in `PostList.tsx`  | `.section` with the year in the margin (`.section-label`) and an ordered list of post rows.                                                                                                                                                                   |
| Post row     | `.post-row`                      | Title (`--s1`, 500) with the date at the right; description below in `--quiet`. Title underlines in pine on hover.                                                                                                                                            |
| Topic list   | `.topic-list`                    | Inline wrapped list of topics; counts shown in small `--quiet` numerals only when above 1.                                                                                                                                                                    |
| Page head    | `.page-head`, `PageHead.tsx`     | Optional back link (arrow-left + label) in the margin; title at `--s3`; italic serif summary.                                                                                                                                                                 |
| Post details | `.meta`                          | Definition list in the margin: Published, Updated, Reading time, Topics, First published on (for posts with a canonical URL).                                                                                                                                 |
| Contents     | `.toc`, `PostToc.tsx`            | "On this page" list of h2/h3, sticky in the margin. The current section gets a pine left border. Hidden under 760px and when there are fewer than two headings.                                                                                               |
| Prose        | `.prose`, `Prose.tsx`            | Article body: serif text, sans headings, pine links, centred images with a hairline border and 6px radius, centred captions from the image title, tables, callouts, code.                                                                                     |
| Code block   | `.prose pre`, `.code-name`       | Shiki dual theme (`min-light` / `night-owl`) on `--well`. A `file="name"` meta adds a file name above. Highlighted lines use `--lichen`.                                                                                                                      |
| Callout      | `.prose .callout`                | `> [!NOTE]` style: `--well` fill, 2px pine left edge (`#b4442e` for warning and caution).                                                                                                                                                                     |
| Post footer  | `.post-foot`                     | Share links and "Back to top ↑" on one row; optional edit link; previous (← older) and next (newer →) posts.                                                                                                                                                  |
| Pagination   | `.pagination`                    | "← Newer posts", "Page n of m", "Older posts →". Disabled ends keep their space so the middle stays put.                                                                                                                                                      |
| Footer       | `.site-footer`                   | Copyright on the left; icon-only social and RSS links on the right.                                                                                                                                                                                           |

### Icons

Outline icons from Tabler, drawn with `currentColor` at 1.6 stroke (`Icon.tsx`). They're 18px (`1.125rem`) next to text, or 16px in small links.

Use icons only for:

- social and feed links (always with a visible label, except in the footer where `aria-label` is set)
- the theme toggle
- direction: arrow-left for back and previous, arrow-right for next and older pages, arrow-up for back to top

Don't add icons to headings, post rows or plain links.

## Motion

- The search band fades in over 180ms when opened. That's the only animation.
- No entrance, scroll or hover animations beyond colour changes.
- `prefers-reduced-motion: reduce` removes the fade and makes "Back to top" jump instead of scroll.

## Accessibility

- A skip link goes to `#main-content`.
- Focus is a 2px pine outline offset by 3px on every interactive element.
- Pages have one `h1`. Year labels are `h2` and post titles in lists are `h3`.
- Icon-only controls have `aria-label` and `title`.
- The search status is `aria-live="polite"`. Closing search returns focus to the Search button.
- The current contents item uses `aria-current="true"`, and the current nav item uses `aria-current="page"`.
- Images keep their alt text. Captions come from the Markdown image title, so alt text isn't read twice.

## Writing in the interface

- Sentence case everywhere. Name things the way readers do: Writing, Topics, Search, "All writing", "Previous post".
- Status text says what happened and what to do next: "No posts match “x”. Try a shorter word, or browse the topics."
- Don't use middle-dot meta strings, eyebrow labels, emoji or "→" appended to link text. Arrows are icons, and only in the places listed above.

## Rules

1. One bold element per page: the home intro or the page title. Everything else stays quiet.
2. New colours must be added as tokens with light and dark values. No one-off hex in components.
3. Put metadata in the margin, and reading in the column.
4. Add structure (rules, labels, numbers) only when it carries information.
5. No cards, shadows or gradients. Borders are 1px `--hair`, and only on images, rules and inputs.
6. Radius is 6px for code, images and callouts, round for the icon button, and none elsewhere.
7. Use the existing scale steps. If a size isn't in the scale, the design probably doesn't need it.
