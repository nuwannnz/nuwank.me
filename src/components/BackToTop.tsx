"use client";

import { Icon } from "./Icon";

export function BackToTop() {
  return (
    <a
      className="to-top"
      href="#top"
      onClick={e => {
        e.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }}
    >
      Back to top
      <Icon name="arrow-up" />
    </a>
  );
}
