import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slug as githubSlug } from "github-slugger";
import { siteConfig } from "@/site.config";
import { slugifyStr } from "./slugify";
import { yearOf } from "./dates";

export const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
export const PAGES_DIR = path.join(process.cwd(), "src/content/pages");

export type PostMeta = {
  /** URL segment after `/posts/`, e.g. `using-claude-as-a-learning-partner`. */
  slug: string;
  url: string;
  title: string;
  description: string;
  author: string;
  pubDatetime: Date;
  modDatetime: Date | null;
  tags: { name: string; slug: string }[];
  featured: boolean;
  draft: boolean;
  ogImage: string | null;
  canonicalURL: string | null;
  hideEditPost: boolean;
  timezone: string;
  readingMinutes: number;
  /** Path relative to the repo root, e.g. `src/content/posts/foo.md`. */
  filePath: string;
  format: "md" | "mdx";
};

export type Post = PostMeta & { body: string };

export type Tag = { name: string; slug: string; count: number };

const isDev = process.env.NODE_ENV === "development";

function asDate(value: unknown, field: string, file: string): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${file}: "${field}" must be a valid date.`);
  }
  return date;
}

function requireString(
  data: Record<string, unknown>,
  field: string,
  file: string
) {
  const value = data[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${file}: frontmatter needs a "${field}".`);
  }
  return value;
}

function listContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listContentFiles(full);
    return /\.mdx?$/.test(entry.name) ? [full] : [];
  });
}

function countWords(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function readPost(file: string): Post {
  const rel = path.relative(process.cwd(), file);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));

  // Sub-folders are for organising files only; the URL is always /posts/<slug>/.
  const baseName = path.basename(file).replace(/\.mdx?$/, "");
  const slug =
    typeof data.slug === "string" && data.slug.trim()
      ? slugifyStr(data.slug.trim())
      : githubSlug(baseName);
  if (/^\d+$/.test(slug)) {
    throw new Error(
      `${rel}: slug "${slug}" is reserved for page numbers; pick a word.`
    );
  }

  const tagNames: string[] =
    Array.isArray(data.tags) && data.tags.length
      ? data.tags.map(String)
      : ["others"];

  return {
    slug,
    url: `/posts/${slug}/`,
    title: requireString(data, "title", rel),
    description: requireString(data, "description", rel),
    author:
      typeof data.author === "string" ? data.author : siteConfig.site.author,
    pubDatetime: asDate(data.pubDatetime, "pubDatetime", rel),
    modDatetime: data.modDatetime
      ? asDate(data.modDatetime, "modDatetime", rel)
      : null,
    tags: tagNames.map(name => ({ name, slug: slugifyStr(name) })),
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
    ogImage: typeof data.ogImage === "string" ? data.ogImage : null,
    canonicalURL:
      typeof data.canonicalURL === "string" ? data.canonicalURL : null,
    hideEditPost: Boolean(data.hideEditPost),
    timezone:
      typeof data.timezone === "string"
        ? data.timezone
        : siteConfig.site.timezone,
    readingMinutes: Math.max(
      1,
      Math.ceil(countWords(content) / siteConfig.posts.wordsPerMinute)
    ),
    filePath: rel,
    format: file.endsWith(".mdx") ? "mdx" : "md",
    body: content,
  };
}

/** Drafts never show. Scheduled posts show once their time (minus the margin) has passed, or always in dev. */
function isPublished(post: PostMeta) {
  const due =
    Date.now() >
    post.pubDatetime.getTime() - siteConfig.posts.scheduledPostMargin;
  return !post.draft && (isDev || due);
}

let cache: Post[] | null = null;

/** All published posts, newest first. */
export function getAllPosts(): Post[] {
  if (cache && !isDev) return cache;
  const posts = listContentFiles(POSTS_DIR).map(readPost).filter(isPublished);

  const seen = new Map<string, string>();
  for (const post of posts) {
    const clash = seen.get(post.slug);
    if (clash)
      throw new Error(
        `Two posts share the slug "${post.slug}": ${clash} and ${post.filePath}`
      );
    seen.set(post.slug, post.filePath);
  }

  posts.sort((a, b) => b.pubDatetime.getTime() - a.pubDatetime.getTime());
  cache = posts;
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find(post => post.slug === slug);
}

/** Older and newer neighbours of a post in publish order. */
export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const i = posts.findIndex(post => post.slug === slug);
  return { newer: i > 0 ? posts[i - 1] : undefined, older: posts[i + 1] };
}

/** Posts grouped by year, newest year first. */
export function groupByYear<T extends PostMeta>(posts: T[]) {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const year = yearOf(post.pubDatetime, post.timezone);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups].map(([year, items]) => ({ year, posts: items }));
}

/** Every tag with its post count, most used first. */
export function getTags(): Tag[] {
  const tags = new Map<string, Tag>();
  for (const post of getAllPosts()) {
    for (const { name, slug } of post.tags) {
      const tag = tags.get(slug) ?? { name, slug, count: 0 };
      tag.count += 1;
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export function getPostsByTag(tagSlug: string) {
  return getAllPosts().filter(post =>
    post.tags.some(tag => tag.slug === tagSlug)
  );
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage = siteConfig.posts.perPage
) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    page,
    totalPages,
  };
}

export function pageCount(total: number, perPage = siteConfig.posts.perPage) {
  return Math.max(1, Math.ceil(total / perPage));
}

/** A Markdown page from `src/content/pages`, e.g. `about`. */
export function getPage(name: string) {
  const file = [".md", ".mdx"]
    .map(ext => path.join(PAGES_DIR, name + ext))
    .find(fs.existsSync);
  if (!file) return undefined;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    title: String(data.title ?? name),
    description:
      typeof data.description === "string" ? data.description : undefined,
    canonicalURL:
      typeof data.canonicalURL === "string" ? data.canonicalURL : undefined,
    format: file.endsWith(".mdx") ? ("mdx" as const) : ("md" as const),
    body: content,
  };
}

/** Lightweight records for the in-page search fallback. */
export function getSearchRecords() {
  return getAllPosts().map(post => ({
    url: post.url,
    title: post.title,
    description: post.description,
    tags: post.tags.map(tag => tag.name),
    date: post.pubDatetime.toISOString(),
    timezone: post.timezone,
  }));
}
export type SearchRecord = ReturnType<typeof getSearchRecords>[number];
