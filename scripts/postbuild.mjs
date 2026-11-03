// Runs after `next build`: indexes the exported site with Pagefind for search,
// then copies the index into public/ so search also works under `pnpm dev`.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";

if (!existsSync("out")) {
  console.error("postbuild: out/ not found. Did `next build` run?");
  process.exit(1);
}

execFileSync("pnpm", ["exec", "pagefind", "--site", "out"], {
  stdio: "inherit",
});

rmSync("public/pagefind", { recursive: true, force: true });
cpSync("out/pagefind", "public/pagefind", { recursive: true });
