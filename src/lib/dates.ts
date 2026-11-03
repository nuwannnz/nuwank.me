import { siteConfig } from "@/site.config";

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string, withYear: boolean) {
  const key = `${timeZone}:${withYear}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(siteConfig.site.lang, {
      month: "short",
      day: "numeric",
      ...(withYear ? { year: "numeric" } : {}),
      timeZone,
    });
    formatters.set(key, f);
  }
  return f;
}

/** "Nov 3" */
export const formatShortDate = (
  date: Date,
  timeZone = siteConfig.site.timezone
) => formatter(timeZone, false).format(date);

/** "Nov 3, 2026" */
export const formatDate = (date: Date, timeZone = siteConfig.site.timezone) =>
  formatter(timeZone, true).format(date);

/** Four-digit year in the given time zone. */
export const yearOf = (date: Date, timeZone = siteConfig.site.timezone) =>
  new Intl.DateTimeFormat("en", { year: "numeric", timeZone }).format(date);
