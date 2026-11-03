import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

const fontDir = path.join(process.cwd(), "src/assets/fonts");
let fonts: Promise<{ light: Buffer; medium: Buffer }> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    fs.readFile(path.join(fontDir, "HankenGrotesk-300.ttf")),
    fs.readFile(path.join(fontDir, "HankenGrotesk-500.ttf")),
  ]).then(([light, medium]) => ({ light, medium })));

const host = new URL(siteConfig.site.url).hostname.replace(/^www\./, "");

/** 1200×630 social image in the Margin style: stone ground, light title, name in the margin. */
export async function renderOgImage({
  title,
  kicker,
}: {
  title: string;
  kicker?: string;
}) {
  const { light, medium } = await loadFonts();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f5f6f3",
        color: "#1f2421",
        fontFamily: "Hanken Grotesk",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          width: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontSize: 26,
          color: "#646b67",
          fontWeight: 300,
        }}
      >
        <span>{kicker ?? ""}</span>
        <span style={{ color: "#22604b", fontWeight: 500 }}>{host}</span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderLeft: "1px solid #daddd8",
          paddingLeft: 56,
        }}
      >
        <div
          style={{
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 500 }}>
          {siteConfig.site.author}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Hanken Grotesk", data: light, weight: 300, style: "normal" },
        { name: "Hanken Grotesk", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
