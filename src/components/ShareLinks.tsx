import { siteConfig } from "@/site.config";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const target = encodeURIComponent(url);
  return (
    <div className="share">
      Share on
      {siteConfig.shareLinks.map(s => (
        <a
          key={s.name}
          href={`${s.url}${target}`}
          target={s.name === "mail" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={`Share “${title}” on ${s.label}`}
        >
          {s.label}
        </a>
      ))}
    </div>
  );
}
