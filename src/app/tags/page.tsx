import type { Metadata } from "next";
import { getTags } from "@/lib/posts";
import { PageHead } from "@/components/PageHead";
import { TopicList } from "@/components/PostList";

export const metadata: Metadata = {
  title: "Topics",
  description: "All the topics I’ve written about.",
  alternates: { canonical: "/tags/" },
};

export default function Tags() {
  return (
    <>
      <PageHead
        title="Topics"
        dek="All the topics I’ve written about. Numbers show topics with more than one post."
      />
      <section className="section grid">
        <div className="main">
          <TopicList tags={getTags()} />
        </div>
      </section>
    </>
  );
}
