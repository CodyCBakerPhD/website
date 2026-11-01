import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recordSections } from "../src/build/records.ts";
import { sections } from "../src/build/sections.ts";
import { versionStamp } from "../src/build/version.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as { version: string };

export default defineConfig({
  root: resolve(repoRoot, "src"),
  plugins: [recordSections(sections, { root: repoRoot }), versionStamp(version)],
  // Relative so the build works whether it's served from the domain root
  // (production) or a nested path (e.g. GitHub Pages PR previews).
  base: "./",
  build: {
    outDir: resolve(repoRoot, "dist"),
    emptyOutDir: true,
  },
});
