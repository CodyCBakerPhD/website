import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  root: resolve(repoRoot, "src"),
  build: {
    outDir: resolve(repoRoot, "dist"),
    emptyOutDir: true,
  },
});
