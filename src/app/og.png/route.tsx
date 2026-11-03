import { siteConfig } from "@/site.config";
import { renderOgImage } from "@/lib/og";

export const dynamic = "force-static";

export function GET() {
  return renderOgImage({
    title: siteConfig.site.description,
    kicker: "Writing",
  });
}
