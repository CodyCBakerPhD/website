import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  root: resolve(repoRoot, "src"),
  // Relative so the build works whether it's served from the domain root
  // (production) or a nested path (e.g. GitHub Pages PR previews).
  base: "./",
  build: {
    outDir: resolve(repoRoot, "dist"),
    emptyOutDir: true,
  },
});
