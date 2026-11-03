import { getAllPosts, getPost } from "@/lib/posts";
import { formatDate } from "@/lib/dates";
import { renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;

// Generated for every post (static export needs at least one); pages only point
// at it when `features.dynamicOgImage` is on and the post has no `ogImage`.
export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return new Response("Not found", { status: 404 });
  return renderOgImage({
    title: post.title,
    kicker: formatDate(post.pubDatetime, post.timezone),
  });
}
