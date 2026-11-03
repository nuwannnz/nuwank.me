import { getPostsByTag, getTags, paginate } from "@/lib/posts";
import { PageHead } from "./PageHead";
import { Pagination } from "./Pagination";
import { YearArchive } from "./PostList";

export function findTag(slug: string) {
  return getTags().find(tag => tag.slug === slug);
}

/** One page of `/tags/<tag>/`. */
export function TagIndex({ tagSlug, page }: { tagSlug: string; page: number }) {
  const tag = findTag(tagSlug);
  if (!tag) return null;
  const { items, totalPages } = paginate(getPostsByTag(tagSlug), page);
  const count = `${tag.count} ${tag.count === 1 ? "post" : "posts"}`;
  return (
    <>
      <PageHead
        title={tag.name}
        dek={
          totalPages > 1
            ? `${count}. Page ${page} of ${totalPages}.`
            : `${count} on this topic.`
        }
        back={{ href: "/tags/", label: "All topics" }}
      />
      <YearArchive posts={items} />
      <Pagination
        page={page}
        totalPages={totalPages}
        base={`/tags/${tag.slug}/`}
      />
    </>
  );
}
