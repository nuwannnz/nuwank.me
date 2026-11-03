import { siteConfig } from "@/site.config";
import { getAllPosts, getTags } from "@/lib/posts";
import { TopicList, YearArchive } from "@/components/PostList";
import { Icon } from "@/components/Icon";

export default function Home() {
  const { intro, socials } = siteConfig;
  return (
    <>
      <section className="hero grid">
        <h1>
          {intro.greeting}
          <br />
          {intro.name}
        </h1>
        <p className="bio">{intro.bio}</p>
        <p className="links">
          {socials.map(s => (
            <a key={s.name} href={s.url}>
              <Icon name={s.name} />
              {s.label}
            </a>
          ))}
          <a href="/rss.xml">
            <Icon name="rss" />
            RSS feed
          </a>
        </p>
      </section>

      <YearArchive posts={getAllPosts()} />

      <section
        className="section grid"
        id="topics"
        aria-labelledby="topics-label"
      >
        <div className="margin">
          <h2 className="section-label" id="topics-label">
            Topics
          </h2>
        </div>
        <div className="main">
          <TopicList tags={getTags()} />
        </div>
      </section>
    </>
  );
}
