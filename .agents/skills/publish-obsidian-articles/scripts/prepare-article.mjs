#!/usr/bin/env node
// prepare-article.mjs: turn an Obsidian article (proofread.md) into a nuwank.me post.
// Dependency-free (Node 22+, built-in modules only). Run with --help for usage.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseArgs } from "node:util";

const DEFAULT_VAULT = "/Users/nuwan-swivel/Documents/notes-obsidian";
const ARTICLES_SUBDIR = "Personal/Articles";
const DEFAULT_REPO = "/Users/nuwan-swivel/projects/test-apps/nuwank.me";
const AUTHOR = "Nuwan Karunarathna";
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".bmp"]);
const PASSTHROUGH = ["modDatetime", "featured", "ogImage", "canonicalURL", "hideEditPost", "timezone"];
const SKIP_DIRS = new Set([".obsidian", ".trash", ".git", "node_modules"]);
const GITHUB_CALLOUTS = new Set(["note", "tip", "important", "warning", "caution"]);
const ASSET_DIR_RE = /(^|[\\/])(attachments?|assets|images|media|files|_resources)([\\/]|$)/i;

const USAGE = `Usage: node prepare-article.mjs "<Article Name | article folder | proofread.md>" [options]
  --repo <path>         nuwank.me checkout (default: cwd if it has src/content/posts, else ${DEFAULT_REPO})
  --vault <path>        Obsidian vault root (default: nearest folder with .obsidian, else ${DEFAULT_VAULT})
  --slug <slug>         post slug (default: kebab-case title)
  --date <date>         pubDatetime, YYYY-MM-DD or ISO 8601 (omitted and reported if not given)
  --tags <a,b>          comma-separated tags (default: Obsidian frontmatter tags)
  --description <text>  post description (default: Obsidian frontmatter description)
  --dry-run             write nothing; print the same JSON summary`;

const fail = (msg) => { console.error(`prepare-article: ${msg}`); process.exit(1); };
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const kebab = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "")
  .toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// ---------- arguments ----------
let opt, positionals;
try {
  ({ values: opt, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      repo: { type: "string" }, vault: { type: "string" }, slug: { type: "string" },
      date: { type: "string" }, tags: { type: "string" }, description: { type: "string" },
      "dry-run": { type: "boolean", default: false }, help: { type: "boolean", short: "h" },
    },
  }));
} catch (e) { fail(`${e.message}\n${USAGE}`); }
if (opt.help) { console.log(USAGE); process.exit(0); }
if (positionals.length !== 1) fail(`expected exactly one article name or path\n${USAGE}`);
const dryRun = opt["dry-run"];

// ---------- locate article, vault and repo ----------
function findVaultRoot(dir) {
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) if (isDir(path.join(d, ".obsidian"))) return d;
  return null;
}
const arg = positionals[0];
const articlesRoot = path.join(opt.vault ?? DEFAULT_VAULT, ARTICLES_SUBDIR);
let articleDir = isDir(arg) ? arg : path.basename(arg) === "proofread.md" && isFile(arg) ? path.dirname(arg) : path.join(articlesRoot, arg);
if (!isFile(path.join(articleDir, "proofread.md"))) {
  const available = isDir(articlesRoot)
    ? fs.readdirSync(articlesRoot).filter((n) => isFile(path.join(articlesRoot, n, "proofread.md"))) : [];
  fail(`no proofread.md in ${articleDir} (article.md is only the draft).` +
    (available.length ? `\nArticles with proofread.md:\n  ${available.join("\n  ")}` : ""));
}
articleDir = fs.realpathSync(articleDir);
const source = path.join(articleDir, "proofread.md");
const vault = fs.realpathSync(opt.vault ?? findVaultRoot(articleDir) ?? (isDir(DEFAULT_VAULT) ? DEFAULT_VAULT : articleDir));

const repo = path.resolve(opt.repo ?? (isDir(path.join(process.cwd(), "src/content/posts")) ? process.cwd() : DEFAULT_REPO));
const postsDir = path.join(repo, "src/content/posts");
if (!isDir(postsDir)) fail(`${repo} has no src/content/posts; pass --repo <path to a nuwank.me checkout>`);

// ---------- frontmatter ----------
const scalar = (v) => {
  const s = v.trim().replace(/^(['"])(.*)\1$/, "$2");
  return s === "true" ? true : s === "false" ? false : s;
};
function parseYaml(src) { // flat keys, inline [a, b] lists and "- item" block lists are enough for Obsidian
  const data = {}; let key = null;
  for (const line of src.split("\n")) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && key) { if (!Array.isArray(data[key])) data[key] = []; data[key].push(scalar(item[1])); continue; }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1]; const v = kv[2].trim();
    data[key] = v === "" ? null : v.startsWith("[") && v.endsWith("]")
      ? v.slice(1, -1).split(",").map(scalar).filter((s) => s !== "") : scalar(v);
  }
  return data;
}
let raw = fs.readFileSync(source, "utf8").replace(/\r\n?/g, "\n").replace(/^﻿/, "");
let fmIn = {};
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
if (fmMatch) { fmIn = parseYaml(fmMatch[1]); raw = raw.slice(fmMatch[0].length); }

// ---------- body helpers: only touch prose, never fenced or inline code ----------
function mapProse(body, fn) {
  const out = []; let buf = []; let fence = null;
  const flush = () => {
    if (!buf.length) return;
    const codes = [];
    const masked = buf.join("\n").replace(/(`+)[^\n]*?\1/g, (m) => `\u0000${codes.push(m) - 1}\u0000`);
    out.push(fn(masked).replace(/\u0000(\d+)\u0000/g, (_, i) => codes[i]));
    buf = [];
  };
  for (const line of body.split("\n")) {
    const m = line.match(/^(?:\s*>)*\s*(`{3,}|~{3,})/);
    if (fence) {
      out.push(line);
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && /^(?:\s*>)*\s*[`~]+\s*$/.test(line)) fence = null;
    } else if (m) { flush(); fence = m[1]; out.push(line); } else buf.push(line);
  }
  flush();
  return out.join("\n");
}

// Pass 1: drop %%comments%% and take the first H1 as the title.
let h1 = null;
raw = mapProse(raw, (t) => t.replace(/%%[\s\S]*?%%/g, "").replace(/^#[ \t]+(.+?)[ \t#]*$/m, (m, title) => {
  if (h1 !== null) return m;
  h1 = title; return "";
}));
const cleanInline = (s) => s.replace(/\[\[([^\]|]+)(?:\\?\|([^\]]+))?\]\]/g, (_, a, b) => b ?? a).replace(/==([^=]+)==/g, "$1").trim();
const title = cleanInline(String(fmIn.title ?? h1 ?? path.basename(articleDir)));
const slug = opt.slug ?? (typeof fmIn.slug === "string" ? fmIn.slug : kebab(title));
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`invalid slug "${slug}" (lowercase kebab-case only)`);

// ---------- asset resolution ----------
const unresolvedEmbeds = [], flattenedWikilinks = [], warnings = [], altFromFilename = [];
const assets = new Map(); // absolute source path -> safe file name
let index = null;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); continue; }
    const k = e.name.toLowerCase();
    if (!index.has(k)) index.set(k, []);
    if (!index.get(k).includes(p)) index.get(k).push(p);
  }
}
function resolveFile(ref) {
  const clean = ref.replace(/^\.\//, "");
  for (const base of [articleDir, vault]) if (isFile(path.resolve(base, clean))) return path.resolve(base, clean);
  if (!index) { index = new Map(); walk(articleDir); walk(vault); }
  const matches = index.get(path.basename(clean).toLowerCase()) ?? [];
  const rank = (p) => [p.startsWith(articleDir + path.sep) ? 0 : 1, ASSET_DIR_RE.test(path.relative(vault, p)) ? 0 : 1, p.length];
  matches.sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  if (matches.length > 1) warnings.push(`"${ref}" matched ${matches.length} vault files; used ${matches[0]}`);
  return matches[0] ?? null;
}
function useAsset(ref, original) {
  const file = resolveFile(ref);
  if (!file) { unresolvedEmbeds.push({ embed: original, reason: "image not found in article folder or vault" }); return null; }
  if (!assets.has(file)) {
    const ext = path.extname(file).toLowerCase();
    const base = kebab(path.basename(file, path.extname(file))) || "image";
    const taken = new Set(assets.values());
    let name = base + ext;
    for (let i = 2; taken.has(name); i++) name = `${base}-${i}${ext}`;
    assets.set(file, name);
  }
  return `/images/${slug}/${assets.get(file)}`;
}
function defaultAlt(file, original) {
  altFromFilename.push(original);
  return path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").trim();
}
function embed(original, inner) {
  const [target, ...opts] = inner.split(/\\?\|/).map((s) => s.trim());
  const file = target.split("#")[0];
  if (!IMAGE_EXT.has(path.extname(file).toLowerCase())) {
    unresolvedEmbeds.push({ embed: original, reason: "not an image; note/PDF/media embeds cannot be transcluded" });
    return original;
  }
  let alt = "", width, height;
  for (const o of opts) { const s = o.match(/^(\d+)(?:x(\d+))?$/); if (s) [, width, height] = s; else if (o) alt = o; }
  const src = useAsset(file, original);
  if (!src) return original;
  alt ||= defaultAlt(file, original);
  if (!width) return `![${alt}](${src})`;
  return `<img src="${src}" alt="${escAttr(alt)}" width="${width}"${height ? ` height="${height}"` : ""} />`;
}
function mdImage(original, alt, src) {
  let file = src;
  try { file = decodeURIComponent(src); } catch { /* keep as written */ }
  if (!IMAGE_EXT.has(path.extname(file).toLowerCase())) return original;
  const url = useAsset(file, original);
  return url ? `![${alt || defaultAlt(file, original)}](${url})` : original;
}

// Pass 2: Obsidian syntax -> Markdown the site renders.
const calloutTypes = new Set();
let body = mapProse(raw, (t) => t
  .replace(/!\[\[([^\]]+)\]\]/g, (m, inner) => embed(m, inner))
  .replace(/!\[([^\]]*)\]\((?!https?:|data:|\/|#)(?:<([^>]+)>|([^)\s]+))(?:\s+"[^"]*")?\)/g, (m, alt, a, b) => mdImage(m, alt, a ?? b))
  .replace(/(?<!!)\[\[([^\]]+)\]\]/g, (m, inner) => {
    const [target, label] = inner.split(/\\?\|/).map((s) => s.trim());
    const text = label || (target.startsWith("#") ? target.slice(1).replace(/^\^/, "") : path.basename(target.split("#")[0], ".md"));
    flattenedWikilinks.push({ link: m, text });
    return text;
  })
  .replace(/==(?=\S)([^=\n]+?)==/g, "<mark>$1</mark>")
  .replace(/^((?:[ \t]*>)+[ \t]*)\[!([A-Za-z-]+)\]([+-]?)/gm, (m, q, type, fold) => {
    calloutTypes.add(type.toLowerCase());
    return `${q}[!${type.toUpperCase()}]${fold}`;
  })
  .replace(/[ \t]+\^[A-Za-z0-9-]+[ \t]*$/gm, "") // block ids: "text ^abc123"
  .replace(/^\^[A-Za-z0-9-]+[ \t]*$/gm, "")
  .replace(/\n{3,}/g, "\n\n").replace(/^\n{2,}/, "\n").replace(/\n{2,}$/, "\n"));
body = body.replace(/^\s*\n/, "").trimEnd() + "\n";
for (const t of calloutTypes) if (!GITHUB_CALLOUTS.has(t)) warnings.push(`callout type "${t}" is not one of the GitHub five (${[...GITHUB_CALLOUTS].join(", ")}); check it renders`);

// ---------- frontmatter out ----------
const needsInput = [], hints = {};
const toIso = (v) => {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};
let pubDatetime = toIso(opt.date);
if (pubDatetime === undefined) fail(`invalid --date "${opt.date}" (use YYYY-MM-DD or ISO 8601)`);
pubDatetime ??= toIso(fmIn.pubDatetime ?? fmIn.publishDate ?? fmIn.published) ?? null;
if (!pubDatetime) {
  needsInput.push("pubDatetime");
  const guess = ["date", "created"].find((k) => fmIn[k]);
  if (guess) hints.pubDatetime = `Obsidian frontmatter has ${guess}: ${fmIn[guess]} (may be the note's creation date); confirm with the user`;
}
const description = opt.description ?? fmIn.description ?? fmIn.summary ?? fmIn.excerpt;
if (!description) needsInput.push("description");
const rawTags = opt.tags !== undefined ? opt.tags.split(",") : Array.isArray(fmIn.tags) ? fmIn.tags : String(fmIn.tags ?? "").split(/[,\s]+/);
const tags = [...new Set(rawTags.map((t) => String(t).trim().replace(/^#/, "").split("/").pop()).filter(Boolean))];
if (!tags.length) needsInput.push("tags");
const dropped = Object.keys(fmIn).filter((k) => !["title", "slug", "description", "summary", "excerpt", "tags", "author",
  "pubDatetime", "publishDate", "published", "draft", ...PASSTHROUGH].includes(k));
if (dropped.length) warnings.push(`dropped Obsidian-only frontmatter: ${dropped.join(", ")}`);

const fm = { pubDatetime: pubDatetime ?? undefined, modDatetime: toIso(fmIn.modDatetime) ?? undefined, title, description,
  slug, featured: fmIn.featured, tags: tags.length ? tags : undefined, author: fmIn.author ?? AUTHOR, draft: false };
for (const k of PASSTHROUGH.slice(2)) fm[k] = fmIn[k] ?? undefined;
const yv = (v) => typeof v === "boolean" ? String(v)
  : /^[A-Za-z0-9(][^\n]*$/.test(v) && !/: | #|:$/.test(v) && v === v.trim()
    && !/^(true|false|yes|no|null|on|off|[-+.\d][\d.eE+-]*)$/i.test(v) ? v : JSON.stringify(v);
const yaml = ["---"];
for (const [k, v] of Object.entries(fm)) {
  if (v === undefined || v === null) continue;
  if (Array.isArray(v)) yaml.push(`${k}:`, ...v.map((t) => `  - ${yv(t)}`));
  else yaml.push(`${k}: ${yv(v)}`);
}
yaml.push("---", "");

// ---------- collision checks (all before any write) ----------
const postPath = path.join(postsDir, `${slug}.md`);
for (const ext of [".md", ".mdx"]) {
  const p = path.join(postsDir, slug + ext);
  if (fs.existsSync(p)) fail(`post already exists: ${p}\nRefusing to overwrite. Pick another --slug or edit the existing post by hand.`);
}
for (const f of fs.readdirSync(postsDir).filter((n) => /\.mdx?$/.test(n))) {
  const head = fs.readFileSync(path.join(postsDir, f), "utf8").slice(0, 2000);
  if (new RegExp(`^slug:\\s*["']?${slug}["']?\\s*$`, "m").test(head)) fail(`slug "${slug}" is already used by ${f}; pick another --slug`);
}
const imgDir = path.join(repo, "public/images", slug);
const plan = [...assets].map(([from, name]) => {
  const to = path.join(imgDir, name);
  if (!fs.existsSync(to)) return { from, to, status: "copy" };
  if (sha(from) === sha(to)) return { from, to, status: "reuse" };
  return fail(`asset already exists with different content: ${to} (source ${from})\nRefusing to overwrite; move it aside or pick another --slug.`);
});

// ---------- write ----------
if (!dryRun) {
  if (plan.length) fs.mkdirSync(imgDir, { recursive: true });
  for (const a of plan) if (a.status === "copy") fs.copyFileSync(a.from, a.to, fs.constants.COPYFILE_EXCL);
  fs.writeFileSync(postPath, yaml.join("\n") + "\n" + body, { flag: "wx" });
}
const verb = { copy: dryRun ? "would-copy" : "copied", reuse: dryRun ? "would-reuse" : "reused-identical" };
console.log(JSON.stringify({
  dryRun, source, post: postPath, url: `/posts/${slug}/`, title, slug,
  frontmatter: Object.fromEntries(Object.entries(fm).filter(([, v]) => v != null)),
  assets: plan.map((a) => ({ from: a.from, to: a.to, status: verb[a.status] })),
  unresolvedEmbeds, flattenedWikilinks, altFromFilename, needsInput, hints, warnings,
}, null, 2));
