import Link from "next/link";
import { PageHead } from "@/components/PageHead";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <PageHead
        title="Page not found"
        dek="This page doesn’t exist or has moved. Try the list of posts or search."
      />
      <section className="grid">
        <p className="main links">
          <Link href="/">See all writing</Link>
          <Link href="/search/">Search posts</Link>
        </p>
      </section>
    </>
  );
}
