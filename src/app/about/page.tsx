import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/posts";
import { renderContent } from "@/lib/markdown";
import { PageHead } from "@/components/PageHead";
import { Prose } from "@/components/Prose";

export function generateMetadata(): Metadata {
  const page = getPage("about");
  return {
    title: page?.title ?? "About",
    description: page?.description,
    alternates: { canonical: page?.canonicalURL ?? "/about/" },
  };
}

export default async function About() {
  const page = getPage("about");
  if (!page) notFound();
  const rendered = await renderContent(page.body, page.format);
  return (
    <>
      <PageHead title={page.title} dek={page.description} />
      <div className="grid">
        <div className="main">
          <Prose rendered={rendered} />
        </div>
      </div>
    </>
  );
}
