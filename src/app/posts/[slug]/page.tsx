import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/site.config";
import {
  getAdjacentPosts,
  getAllPosts,
  getPost,
  pageCount,
  type Post,
} from "@/lib/posts";
import { renderContent } from "@/lib/markdown";
import { formatDate } from "@/lib/dates";
import { BackToTop } from "@/components/BackToTop";
import { Icon } from "@/components/Icon";
import { PostToc } from "@/components/PostToc";
import { PostsIndex } from "@/components/PostsIndex";
import { Prose } from "@/components/Prose";
import { ShareLinks } from "@/components/ShareLinks";

type Params = { params: Promise<{ slug: string }> };

// `/posts/<slug>/` is a post; `/posts/2/`, `/posts/3/`… are pages of the list.
const pageNumber = (slug: string) => (/^\d+$/.test(slug) ? Number(slug) : null);

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts();
  const pages = Array.from({ length: pageCount(posts.length) - 1 }, (_, i) =>
    String(i + 2)
  );
  return [...posts.map(p => p.slug), ...pages].map(slug => ({ slug }));
}

const ogImageFor = (post: Post) =>
  post.ogImage ??
  (siteConfig.features.dynamicOgImage
    ? `/posts/${post.slug}/index.png`
    : siteConfig.site.ogImage);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const n = pageNumber(slug);
  if (n)
    return {
      title: `All writing, page ${n}`,
      alternates: { canonical: `/posts/${n}/` },
    };
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags.map(t => t.name),
    alternates: { canonical: post.canonicalURL ?? post.url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: post.url,
      publishedTime: post.pubDatetime.toISOString(),
      modifiedTime: post.modDatetime?.toISOString(),
      authors: [post.author],
      tags: post.tags.map(t => t.name),
      images: [ogImageFor(post)],
    },
  };
}

function hostLabel(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return host.includes("medium.com") ? "Medium" : host;
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const n = pageNumber(slug);
  if (n) return <PostsIndex page={n} />;

  const post = getPost(slug);
  if (!post) notFound();
  const rendered = await renderContent(post.body, post.format);
  const { older, newer } = getAdjacentPosts(post.slug);
  const absoluteUrl = new URL(post.url, siteConfig.site.url).href;
  const { features } = siteConfig;
  const editUrl =
    features.editPost.enabled && features.editPost.url && !post.hideEditPost
      ? features.editPost.url + post.filePath
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: new URL(ogImageFor(post), siteConfig.site.url).href,
    datePublished: post.pubDatetime.toISOString(),
    ...(post.modDatetime && { dateModified: post.modDatetime.toISOString() }),
    author: [
      { "@type": "Person", name: post.author, url: siteConfig.site.url },
    ],
    mainEntityOfPage: absoluteUrl,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="page-head grid">
        <div className="margin">
          {features.showBackButton && (
            <Link className="back" href="/">
              <Icon name="arrow-left" />
              All writing
            </Link>
          )}
        </div>
        <div className="main">
          <h1 data-pagefind-meta="title">{post.title}</h1>
          <p className="dek">{post.description}</p>
          <span
            hidden
            data-pagefind-meta={`date:${post.pubDatetime.toISOString()}`}
          />
        </div>
      </div>

      <div className="grid">
        <aside className="margin meta">
          <dl>
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={post.pubDatetime.toISOString()}>
                  {formatDate(post.pubDatetime, post.timezone)}
                </time>
              </dd>
            </div>
            {post.modDatetime && (
              <div>
                <dt>Updated</dt>
                <dd>
                  <time dateTime={post.modDatetime.toISOString()}>
                    {formatDate(post.modDatetime, post.timezone)}
                  </time>
                </dd>
              </div>
            )}
            <div>
              <dt>Reading time</dt>
              <dd>
                {post.readingMinutes}{" "}
                {post.readingMinutes === 1 ? "minute" : "minutes"}
              </dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd>
                {post.tags.map((tag, i) => (
                  <span key={tag.slug}>
                    {i > 0 && ", "}
                    <Link href={`/tags/${tag.slug}/`}>{tag.name}</Link>
                  </span>
                ))}
              </dd>
            </div>
            {post.canonicalURL && (
              <div>
                <dt>First published on</dt>
                <dd>
                  <a
                    href={post.canonicalURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hostLabel(post.canonicalURL)}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <PostToc headings={rendered.headings} />
        </aside>

        <div className="main">
          <Prose rendered={rendered} searchable />

          <footer className="post-foot">
            <div className="foot-row">
              <ShareLinks url={absoluteUrl} title={post.title} />
              <BackToTop />
            </div>
            {editUrl && (
              <a
                className="edit-link"
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="edit" />
                {features.editPost.text}
              </a>
            )}
            {(older || newer) && (
              <nav className="adjacent" aria-label="More posts">
                {older && (
                  <Link className="next" href={older.url}>
                    <span>
                      <Icon name="arrow-left" />
                      Previous post
                    </span>
                    <strong>{older.title}</strong>
                  </Link>
                )}
                {newer && (
                  <Link className="next newer" href={newer.url}>
                    <span>
                      Next post
                      <Icon name="arrow-right" />
                    </span>
                    <strong>{newer.title}</strong>
                  </Link>
                )}
              </nav>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}
