import Link from "next/link";
import { Icon } from "./Icon";

/** Newer/older page links. `base` is the first page's URL, e.g. `/posts/`. */
export function Pagination({
  page,
  totalPages,
  base,
}: {
  page: number;
  totalPages: number;
  base: string;
}) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}${n}/`);
  return (
    <section className="section grid">
      <nav className="main pagination" aria-label="Pages">
        {page > 1 ? (
          <Link href={href(page - 1)}>
            <Icon name="arrow-left" />
            Newer posts
          </Link>
        ) : (
          <span aria-disabled="true">Newer posts</span>
        )}
        <span>
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={href(page + 1)}>
            Older posts
            <Icon name="arrow-right" />
          </Link>
        ) : (
          <span aria-disabled="true">Older posts</span>
        )}
      </nav>
    </section>
  );
}
