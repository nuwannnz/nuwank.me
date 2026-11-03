import type { Metadata } from "next";
import { getTags } from "@/lib/posts";
import { TopicList } from "@/components/PostList";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every post on the blog.",
  alternates: { canonical: "/search/" },
};

/** The search band above stays open on this page; topics give another way in. */
export default function SearchPage() {
  return (
    <section className="section grid" aria-labelledby="browse-label">
      <div className="margin">
        <h1 className="section-label" id="browse-label">
          Topics
        </h1>
      </div>
      <div className="main">
        <TopicList tags={getTags()} />
      </div>
    </section>
  );
}
