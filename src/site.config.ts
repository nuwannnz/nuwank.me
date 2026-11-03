/**
 * Site-wide settings. Edit this file to change the blog's name, intro,
 * social links, share links and feature switches.
 */

export type SocialName = "github" | "linkedin" | "mail" | "x" | "rss";
export type ShareName =
  "whatsapp" | "facebook" | "x" | "telegram" | "pinterest" | "mail";

export const siteConfig = {
  site: {
    url: "https://www.nuwank.me",
    title: "Nuwan Karunarathna",
    description:
      "Personal blog of Nuwan Karunarathna, a software engineer and tech enthusiast.",
    author: "Nuwan Karunarathna",
    lang: "en",
    dir: "ltr" as const,
    /** IANA time zone used to show post dates. A post can override it with `timezone`. */
    timezone: "UTC",
    /** Social image used when `features.dynamicOgImage` is off. */
    ogImage: "/og.png",
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  intro: {
    greeting: "Hello,",
    name: "I’m Nuwan Karunarathna",
    bio: "Software engineer by profession, builder by nature. I’m passionate about web/backend engineering, AI-assisted development, and creating thoughtful products that solve real-world problems.",
  },
  posts: {
    /** Posts per page on `/posts/` and `/tags/<tag>/`. */
    perPage: 10,
    /** Scheduled posts appear this long before their `pubDatetime`. */
    scheduledPostMargin: 15 * 60 * 1000,
    /** Words per minute used for reading time. */
    wordsPerMinute: 220,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
      /**
       * Base URL the post's repo-relative path is appended to, e.g.
       * "https://github.com/<user>/<repo>/edit/main/".
       */
      url: "",
      text: "Suggest an edit",
    },
    search: "pagefind" as "pagefind" | false,
  },
  socials: [
    { name: "github", label: "GitHub", url: "https://github.com/nuwannnz" },
    {
      name: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/nuwan-nk",
    },
    {
      name: "mail",
      label: "Email",
      url: "mailto:nuwankarunarathna504@gmail.com",
    },
  ] satisfies { name: SocialName; label: string; url: string }[],
  shareLinks: [
    { name: "x", label: "X", url: "https://x.com/intent/post?url=" },
    { name: "whatsapp", label: "WhatsApp", url: "https://wa.me/?text=" },
    { name: "telegram", label: "Telegram", url: "https://t.me/share/url?url=" },
    {
      name: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/sharer.php?u=",
    },
    {
      name: "pinterest",
      label: "Pinterest",
      url: "https://pinterest.com/pin/create/button/?url=",
    },
    {
      name: "mail",
      label: "Email",
      url: "mailto:?subject=See%20this%20post&body=",
    },
  ] satisfies { name: ShareName; label: string; url: string }[],
};

export type SiteConfig = typeof siteConfig;
