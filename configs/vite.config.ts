import { defineConfig } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pageLayout } from "../src/build/layout.ts";
import { recordSections } from "../src/build/records.ts";
import { sections } from "../src/build/sections.ts";
import { versionStamp } from "../src/build/version.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = resolve(repoRoot, "src");
const { version } = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as { version: string };

// Every HTML file directly under src/ is a page of the site.
const pages = readdirSync(srcDir)
  .filter((file) => file.endsWith(".html"))
  .map((file) => resolve(srcDir, file));

export default defineConfig({
  root: srcDir,
  appType: "mpa",
  // The layout goes first: the other two fill placeholders inside the parts it adds.
  plugins: [
    pageLayout({ partialsDir: resolve(srcDir, "partials") }),
    recordSections(sections, { root: repoRoot }),
    versionStamp(version),
  ],
  // Relative so the build works whether it's served from the domain root
  // (production) or a nested path (e.g. GitHub Pages PR previews).
  base: "./",
  build: {
    outDir: resolve(repoRoot, "dist"),
    // dist/ is outside root (src/), which Vite only empties when told to.
    emptyOutDir: true,
    rolldownOptions: {
      input: pages,
    },
  },
});
