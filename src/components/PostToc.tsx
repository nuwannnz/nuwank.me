"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";

/** "On this page" list that follows the reader. */
export function PostToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const els = headings
      .map(h => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p>On this page</p>
      <ol>
        {headings.map(h => (
          <li key={h.id} className={`depth-${h.depth}`}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "true" : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
