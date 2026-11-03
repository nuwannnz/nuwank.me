import { getAllPosts, paginate } from "@/lib/posts";
import { PageHead } from "./PageHead";
import { Pagination } from "./Pagination";
import { YearArchive } from "./PostList";

/** One page of `/posts/`. */
export function PostsIndex({ page }: { page: number }) {
  const { items, totalPages } = paginate(getAllPosts(), page);
  return (
    <>
      <PageHead
        title="All writing"
        dek={
          totalPages > 1
            ? `Page ${page} of ${totalPages}, newest first.`
            : "Every post, newest first."
        }
      />
      <YearArchive posts={items} />
      <Pagination page={page} totalPages={totalPages} base="/posts/" />
    </>
  );
}
