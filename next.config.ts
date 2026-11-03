import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: `pnpm build` writes the whole site to `out/`.
  output: "export",
  // Every page is a folder with index.html, e.g. `/posts/my-post/`.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
