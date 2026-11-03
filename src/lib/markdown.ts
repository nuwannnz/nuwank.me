import "server-only";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { unified, type PluggableList } from "unified";
import type { Root as HastRoot, Element, ElementContent } from "hast";
import type { ShikiTransformer } from "shiki";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeCallouts from "rehype-callouts";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import rehypeStringify from "rehype-stringify";
import { compile, run } from "@mdx-js/mdx";
import { siteConfig } from "@/site.config";

export type Heading = { depth: 2 | 3; id: string; text: string };

/** Code blocks with `file="name.ts"` in their meta get a file name above them. */
const transformerFileName = (): ShikiTransformer => ({
  name: "file-name",
  root(root) {
    const file = this.options.meta?.__raw?.match(/file=["'`]?([^"'`\s]+)/)?.[1];
    if (!file) return;
    const pre = root.children.find(
      (n): n is Element => n.type === "element" && n.tagName === "pre"
    );
    if (!pre) return;
    root.children = [
      {
        type: "element",
        tagName: "figure",
        properties: { className: ["code"] },
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["code-name"] },
            children: [{ type: "text", value: file }],
          },
          pre,
        ],
      },
    ];
  },
});

/** A paragraph holding only an image becomes a figure; the image's title (not alt) becomes its caption. */
function rehypeFigures() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || index === undefined || !parent) return;
      const kids = node.children.filter(
        c => !(c.type === "text" && !c.value.trim())
      );
      const img = kids[0];
      if (kids.length !== 1 || img.type !== "element" || img.tagName !== "img")
        return;
      img.properties.loading = "lazy";
      img.properties.decoding = "async";
      const caption = img.properties.title
        ? String(img.properties.title)
        : null;
      const children: ElementContent[] = [img];
      if (caption) {
        delete img.properties.title;
        children.push({
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: caption }],
        });
      }
      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: {},
        children,
      };
    });
  };
}

/** Links to other sites open in a new tab. */
function rehypeExternalLinks() {
  const own = new URL(siteConfig.site.url).hostname.replace(/^www\./, "");
  return (tree: HastRoot) => {
    visit(tree, "element", node => {
      const href =
        node.tagName === "a" ? String(node.properties.href ?? "") : "";
      if (!/^https?:\/\//.test(href)) return;
      if (new URL(href).hostname.replace(/^www\./, "") === own) return;
      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer"];
    });
  };
}

/** Collects h2/h3 headings for the "On this page" list. */
function rehypeCollectHeadings() {
  return (tree: HastRoot, file: { data: Record<string, unknown> }) => {
    const headings: Heading[] = [];
    visit(tree, "element", node => {
      if (
        (node.tagName === "h2" || node.tagName === "h3") &&
        node.properties.id
      ) {
        headings.push({
          depth: node.tagName === "h2" ? 2 : 3,
          id: String(node.properties.id),
          text: toString(node),
        });
      }
    });
    file.data.headings = headings;
  };
}

const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkToc,
  [remarkCollapse, { test: "Table of contents" }],
];

const rehypeAfterRaw: PluggableList = [
  rehypeSlug,
  rehypeCallouts,
  [
    rehypeShiki,
    {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      lazy: true,
      fallbackLanguage: "text",
      transformers: [
        transformerFileName(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  ],
  rehypeFigures,
  rehypeExternalLinks,
  rehypeCollectHeadings,
];

export type Rendered =
  | { kind: "html"; html: string; headings: Heading[] }
  | { kind: "react"; content: ReactNode; headings: Heading[] };

const cache = new Map<string, Promise<Rendered>>();

async function renderUncached(
  source: string,
  format: "md" | "mdx"
): Promise<Rendered> {
  if (format === "mdx") {
    const file = await compile(source, {
      outputFormat: "function-body",
      remarkPlugins,
      rehypePlugins: rehypeAfterRaw,
    });
    const { default: Content } = await run(String(file), {
      ...runtime,
      baseUrl: import.meta.url,
    });
    return {
      kind: "react",
      content: Content({}),
      headings: (file.data.headings as Heading[]) ?? [],
    };
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeAfterRaw)
    .use(rehypeStringify)
    .process(source);
  return {
    kind: "html",
    html: String(file),
    headings: (file.data.headings as Heading[]) ?? [],
  };
}

/** Renders Markdown or MDX with the blog's plugins. Results are cached per source. */
export function renderContent(source: string, format: "md" | "mdx") {
  const key = `${format}:${source}`;
  let result = cache.get(key);
  if (!result) {
    result = renderUncached(source, format);
    cache.set(key, result);
  }
  return result;
}
