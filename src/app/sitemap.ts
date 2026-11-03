import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { getAllPosts, getTags } from "@/lib/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.site.url).href;
  const posts = getAllPosts();
  return [
    { url: url("/"), lastModified: posts[0]?.pubDatetime },
    { url: url("/posts/") },
    { url: url("/tags/") },
    { url: url("/about/") },
    ...(siteConfig.features.showArchives ? [{ url: url("/archives/") }] : []),
    ...posts.map(post => ({
      url: url(post.url),
      lastModified: post.modDatetime ?? post.pubDatetime,
    })),
    ...getTags().map(tag => ({ url: url(`/tags/${tag.slug}/`) })),
  ];
}
