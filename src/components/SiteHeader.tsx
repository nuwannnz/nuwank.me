"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/site.config";
import { SearchToggle } from "./Search";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  {
    href: "/",
    label: "Writing",
    match: (p: string) => p === "/" || /^\/(posts|archives)\//.test(p),
  },
  {
    href: "/tags/",
    label: "Topics",
    match: (p: string) => p.startsWith("/tags/"),
  },
  {
    href: "/about/",
    label: "About",
    match: (p: string) => p.startsWith("/about/"),
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="site-header">
      <Link className="site-name" href="/">
        {siteConfig.site.title}
      </Link>
      <nav className="site-nav" aria-label="Site">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.match(pathname) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        {siteConfig.features.search && <SearchToggle />}
        {siteConfig.features.lightAndDarkMode && <ThemeToggle />}
      </nav>
    </header>
  );
}
