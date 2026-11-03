import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

const escape = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    c =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!
  );

export function GET() {
  const { site } = siteConfig;
  const items = getAllPosts()
    .map(post => {
      const link = new URL(post.url, site.url).href;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${(post.modDatetime ?? post.pubDatetime).toUTCString()}</pubDate>
${post.tags.map(t => `      <category>${escape(t.name)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.title)}</title>
    <link>${site.url}/</link>
    <description>${escape(site.description)}</description>
    <language>${site.lang}</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
