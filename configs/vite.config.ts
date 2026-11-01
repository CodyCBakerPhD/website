import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recordSections } from "../src/build/records.ts";
import { sections } from "../src/build/sections.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  root: resolve(repoRoot, "src"),
  plugins: [recordSections(sections, { root: repoRoot })],
  // Relative so the build works whether it's served from the domain root
  // (production) or a nested path (e.g. GitHub Pages PR previews).
  base: "./",
  build: {
    outDir: resolve(repoRoot, "dist"),
    emptyOutDir: true,
  },
});
