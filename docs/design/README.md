# Margin: the nuwank.me design

Margin is the design for nuwank.me, the personal blog of Nuwan Karunarathna. It replaced the stock AstroPaper theme in November 2026.

- **Design system** (tokens, type, grid, components, rules): [design-system.md](./design-system.md)
- **Approved mockup** (open in a browser; home and post page, light and dark): [mockup.html](./mockup.html)
- **Implementation**: `src/app/globals.css` holds every token and style; components live in `src/components/`.

## The brief

> A minimalistic, elegant, clean personal blog.

- **Subject:** a software engineer's practical writing, from UWP controls in 2017 to AI coding agents in 2026. Mostly how-tos with code, plus a few longer essays.
- **Audience:** developers arriving from search or a shared link, and peers who want to see what Nuwan has written.
- **Primary job:** make one post comfortable to read. The secondary job is to make the whole body of writing easy to scan.

Several earlier directions were shown and set aside: a minimal indigo design, a colourful one, an "elegant" serif-on-cream one, Bento and Terminal. Margin was chosen because it is quiet without looking like a template.

## The idea

Every page sits on one asymmetric grid. A narrow **left margin** holds time and context. On the home page that's years. On a post it's the date, reading time, topics and the contents list. A single **reading column** holds everything you read. Apart from images in posts, nothing is centred, and there are no cards.

```
┌──────────────────────────────────────────────────────────────┐
│ Nuwan Karunarathna            Writing  Topics  About  Search ☾│
├───────────┬──────────────────────────────────────────────────┤
│           │ Hello,                                           │
│           │ I’m Nuwan Karunarathna        (large, light)     │
│           │ Bio paragraph                                    │
│           │ ○ GitHub  ○ LinkedIn  ○ Email  ○ RSS feed        │
├───────────┼──────────────────────────────────────────────────┤
│ 2026      │ Using Claude as a Learning Partner        Nov 3  │
│           │ Build a consistent learning habit…               │
│           │ Understanding the Harness…                Aug 4  │
├───────────┼──────────────────────────────────────────────────┤
│ 2020      │ grep command [ Linux tips ]               Jan 4  │
├───────────┼──────────────────────────────────────────────────┤
│ Topics    │ UWP 2  Windows 10 2  AI  Animation  Bash  …      │
└───────────┴──────────────────────────────────────────────────┘
```

The margin is where the design gets its character. It turns the archive into a timeline you can scan. On a post, it keeps the details beside the text instead of stacking them above it.

## Decisions and why

| Decision                                                               | Why                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cool stone ground (`#f5f6f3`) with green-black ink and one pine accent | Calm and paper-like without the warm cream used by many generated designs. One accent keeps links obvious.                                                                           |
| Hanken Grotesk for UI and headings, Source Serif 4 for article text    | A light, open sans gives the large headings their elegance. An optical-size serif reads well at length. Sans headings over serif body is the reverse of the usual "elegant" pairing. |
| Large light heading as the one bold element                            | Spend boldness in one place. Everything else (rules, labels, dates) stays small and quiet.                                                                                           |
| Years in the margin, not on every post                                 | The year is real information that groups posts. Each row only needs month and day.                                                                                                   |
| Hairline rules only between year groups and sections                   | Structure that carries meaning. No borders around posts, no shadows.                                                                                                                 |
| Search opens as a band under the header                                | It sits where people look for it, works from any page, and shows results in the same row style as the archive.                                                                       |
| Icons only where they help recognition                                 | Social links, the theme toggle, and arrows on back, previous/next and back-to-top links. Nowhere else.                                                                               |
| Motion only in response to an action                                   | The search band fades in when opened. No scroll or entrance animations. Respects reduced motion.                                                                                     |

## Pages

| URL                               | What it shows                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/`                               | Intro, every post grouped by year, topics                                                                       |
| `/posts/` `/posts/2/` …           | All writing, paginated (10 per page), grouped by year                                                           |
| `/posts/<slug>/`                  | A post: title and summary, details and contents in the margin, article, share links, back to top, previous/next |
| `/tags/`                          | All topics with post counts                                                                                     |
| `/tags/<tag>/` `/tags/<tag>/2/` … | Posts on one topic                                                                                              |
| `/archives/`                      | Every post grouped by year (kept so old links work)                                                             |
| `/about/`                         | The About page from `src/content/pages/about.md`                                                                |
| `/search/`                        | Search band pinned open, with topics below. `?q=` pre-fills it                                                  |
| 404                               | "Page not found" with links to writing and search                                                               |

Feeds and machine files: `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og.png` and `/posts/<slug>/index.png` (generated social images in the Margin style).

## Changing the design

Change tokens in `src/app/globals.css`, never as one-off values in components. Read [design-system.md](./design-system.md) first. Its "Rules" section lists what keeps the design coherent. If you change the system itself, update that document in the same change.
