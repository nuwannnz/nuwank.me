import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/posts";
import { PageHead } from "@/components/PageHead";
import { YearArchive } from "@/components/PostList";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, grouped by year.",
  alternates: { canonical: "/archives/" },
};

export default function Archives() {
  if (!siteConfig.features.showArchives) notFound();
  return (
    <>
      <PageHead title="Archive" dek="Every post, grouped by year." />
      <YearArchive posts={getAllPosts()} />
    </>
  );
}
