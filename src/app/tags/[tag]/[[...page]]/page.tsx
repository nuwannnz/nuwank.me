import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByTag, getTags, pageCount } from "@/lib/posts";
import { findTag, TagIndex } from "@/components/TagIndex";

// `/tags/<tag>/` is page 1; `/tags/<tag>/2/`, `/3/`… follow.
type Params = { params: Promise<{ tag: string; page?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getTags().flatMap(tag => {
    const pages = pageCount(getPostsByTag(tag.slug).length);
    return [
      { tag: tag.slug, page: [] },
      ...Array.from({ length: pages - 1 }, (_, i) => ({
        tag: tag.slug,
        page: [String(i + 2)],
      })),
    ];
  });
}

async function resolve(params: Params["params"]) {
  const { tag: slug, page } = await params;
  return { tag: findTag(slug), page: page?.[0] ? Number(page[0]) : 1 };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag, page } = await resolve(params);
  if (!tag) return {};
  const path = page > 1 ? `/tags/${tag.slug}/${page}/` : `/tags/${tag.slug}/`;
  return {
    title: page > 1 ? `${tag.name}, page ${page}` : tag.name,
    description: `Posts about ${tag.name}.`,
    alternates: { canonical: path },
  };
}

export default async function TagPage({ params }: Params) {
  const { tag, page } = await resolve(params);
  if (!tag) notFound();
  return <TagIndex tagSlug={tag.slug} page={page} />;
}
