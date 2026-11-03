import { siteConfig } from "@/site.config";
import { Icon } from "./Icon";

export function SiteFooter() {
  return (
    <footer className="site-footer grid">
      <div className="main">
        <span>
          © {new Date().getFullYear()} {siteConfig.site.author}
        </span>
        <nav aria-label="Elsewhere">
          {siteConfig.socials.map(s => (
            <a key={s.name} href={s.url} aria-label={s.label} title={s.label}>
              <Icon name={s.name} />
            </a>
          ))}
          <a href="/rss.xml" aria-label="RSS feed" title="RSS feed">
            <Icon name="rss" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
