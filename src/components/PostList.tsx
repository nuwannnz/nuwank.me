import Link from "next/link";
import type { PostMeta, Tag } from "@/lib/posts";
import { groupByYear } from "@/lib/posts";
import { formatShortDate } from "@/lib/dates";

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <li className="post-row">
      <h3>
        <Link href={post.url}>{post.title}</Link>
      </h3>
      <time dateTime={post.pubDatetime.toISOString()}>
        {formatShortDate(post.pubDatetime, post.timezone)}
      </time>
      <p>{post.description}</p>
    </li>
  );
}

/** Posts grouped under their year, with the year in the margin. */
export function YearArchive({ posts }: { posts: PostMeta[] }) {
  if (!posts.length) {
    return (
      <section className="section grid">
        <p className="main empty-note">No posts yet.</p>
      </section>
    );
  }
  return groupByYear(posts).map(({ year, posts: items }) => (
    <section className="section grid" key={year} aria-labelledby={`y${year}`}>
      <div className="margin">
        <h2 className="section-label" id={`y${year}`}>
          {year}
        </h2>
      </div>
      <ol className="posts main">
        {items.map(post => (
          <PostRow key={post.slug} post={post} />
        ))}
      </ol>
    </section>
  ));
}

export function TopicList({ tags }: { tags: Tag[] }) {
  return (
    <ul className="topic-list">
      {tags.map(tag => (
        <li key={tag.slug}>
          <Link href={`/tags/${tag.slug}/`}>{tag.name}</Link>
          {tag.count > 1 && (
            <span>
              {tag.count}
              <span className="sr-only"> posts</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
