"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SearchRecord } from "@/lib/posts";

type SearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** True on `/search/`, where the band stays open. */
  pinned: boolean;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const value = useContext(SearchContext);
  if (!value) throw new Error("useSearch must be used inside <SearchProvider>");
  return value;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pinned = pathname === "/search/" || pathname === "/search";
  const [openState, setOpenState] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = pinned || openState;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!next && !pinned) toggleRef.current?.focus();
    },
    [pinned]
  );

  // Close the band when navigating to another page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenState(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test(
        (e.target as HTMLElement)?.tagName ?? ""
      );
      if (e.key === "/" && !open && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpenState(true);
      } else if (e.key === "Escape" && open && !pinned) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pinned, setOpen]);

  const value = useMemo(
    () => ({ open, setOpen, toggleRef, pinned }),
    [open, setOpen, pinned]
  );
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function SearchToggle() {
  const { open, setOpen, toggleRef, pinned } = useSearch();
  return (
    <button
      ref={toggleRef}
      type="button"
      aria-expanded={open}
      aria-controls="search"
      onClick={() =>
        pinned ? document.getElementById("q")?.focus() : setOpen(!open)
      }
    >
      Search
    </button>
  );
}

type Result = {
  url: string;
  title: string;
  /** Trusted HTML from Pagefind (escaped text with <mark>), or escaped text from the fallback. */
  excerpt: string;
  date?: string;
};

type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  debouncedSearch: (
    q: string,
    o?: Record<string, unknown>,
    ms?: number
  ) => Promise<{
    results: {
      data: () => Promise<{
        url: string;
        excerpt: string;
        meta: Record<string, string>;
      }>;
    }[];
  } | null>;
};

let pagefindPromise: Promise<Pagefind | null> | null = null;

/** Loads the Pagefind index built by `pnpm build`. Resolves to null when it isn't there (e.g. before the first build). */
function loadPagefind() {
  pagefindPromise ??= import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ `${"/pagefind/pagefind.js"}`
  )
    .then(async (mod: Pagefind) => {
      await mod.options({ excerptLength: 24 });
      return mod;
    })
    .catch(() => null);
  return pagefindPromise;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function highlight(text: string, query: string) {
  const safe = escapeHtml(text);
  const q = escapeHtml(query.trim()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return q ? safe.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>") : safe;
}

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function SearchBand({ records }: { records: SearchRecord[] }) {
  const { open } = useSearch();
  // Mounted only while open, so closing the band clears the query and results.
  return open ? <SearchPanel records={records} /> : null;
}

const noSubscribe = () => () => {};

function SearchPanel({ records }: { records: SearchRecord[] }) {
  const { pinned } = useSearch();
  // On /search/, `?q=` pre-fills the box (read after hydration, so server and client HTML match).
  const urlQuery = useSyncExternalStore(
    noSubscribe,
    () =>
      pinned
        ? (new URLSearchParams(window.location.search).get("q") ?? "")
        : "",
    () => ""
  );
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? urlQuery;
  const q = query.trim();
  const [found, setFound] = useState<{ q: string; results: Result[] }>({
    q: "",
    results: [],
  });
  const results = found.q === q ? found.results : [];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pinned) window.scrollTo({ top: 0 });
    inputRef.current?.focus();
    void loadPagefind();
  }, [pinned]);

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    (async () => {
      const pagefind = await loadPagefind();
      let next: Result[];
      if (pagefind) {
        const search = await pagefind.debouncedSearch(q, {}, 150);
        if (!search || cancelled) return;
        const data = await Promise.all(
          search.results.slice(0, 10).map(r => r.data())
        );
        next = data.map(d => ({
          url: d.url,
          title: escapeHtml(d.meta.title ?? d.url),
          excerpt: d.excerpt,
          date: d.meta.date,
        }));
      } else {
        // No index yet (dev server before a build): search titles, summaries and topics.
        const needle = q.toLowerCase();
        next = records
          .filter(r =>
            [r.title, r.description, ...r.tags]
              .join(" ")
              .toLowerCase()
              .includes(needle)
          )
          .map(r => ({
            url: r.url,
            title: highlight(r.title, q),
            excerpt: highlight(r.description, q),
            date: r.date,
          }));
      }
      if (!cancelled) setFound({ q, results: next });
    })();
    return () => {
      cancelled = true;
    };
  }, [q, records]);

  const status = !q
    ? `Search ${records.length} posts.${pinned ? "" : " Press Esc to close."}`
    : found.q !== q
      ? "Searching…"
      : results.length
        ? `${results.length} ${results.length === 1 ? "post matches" : "posts match"} “${q}”.`
        : `No posts match “${q}”. Try a shorter word, or browse the topics.`;

  return (
    <section className="search grid" id="search" role="search">
      <div className="margin">
        <label htmlFor="q">Search</label>
      </div>
      <div className="main">
        <input
          ref={inputRef}
          id="q"
          type="search"
          placeholder="grep, React, agents…"
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={e => setTyped(e.target.value)}
        />
        <p className="search-status" aria-live="polite">
          {status}
        </p>
        <ol className="results">
          {results.map(r => (
            <li className="post-row" key={r.url}>
              <h3>
                <Link
                  href={r.url}
                  dangerouslySetInnerHTML={{ __html: r.title }}
                />
              </h3>
              {r.date && (
                <time dateTime={r.date}>
                  {dateFormat.format(new Date(r.date))}
                </time>
              )}
              <p dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
