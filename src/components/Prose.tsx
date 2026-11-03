import type { Rendered } from "@/lib/markdown";

/** Rendered Markdown (trusted, from the repo) or MDX content. */
export function Prose({
  rendered,
  searchable = false,
}: {
  rendered: Rendered;
  searchable?: boolean;
}) {
  const pagefind = searchable ? { "data-pagefind-body": "" } : {};
  return rendered.kind === "html" ? (
    <div
      className="prose"
      {...pagefind}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  ) : (
    <div className="prose" {...pagefind}>
      {rendered.content}
    </div>
  );
}
