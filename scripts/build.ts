// Assembles the deployable site into dist/:
//   1. copies the static assets from src/ (excluding TypeScript sources and
//      the Sass sources compiled ahead of time into src/css/),
//   2. adds .nojekyll so GitHub Pages serves the files verbatim (no Jekyll),
//   3. compiles the TypeScript in src/ts/ to dist/js/ via tsc.
//
// Run with `npm run build` (requires Node >= 22.18 for native type stripping).

import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(repoRoot, "src");
const distDir = join(repoRoot, "dist");

// Source-only content that should not ship to the deployed site.
const excludedPaths = new Set(["ts", "scss"]);

function isIncluded(source: string): boolean {
  const relativePath = relative(srcDir, source);
  if (relativePath === "") {
    return true;
  }
  const topLevel = relativePath.split(sep)[0];
  return !excludedPaths.has(topLevel);
}

rmSync(distDir, { recursive: true, force: true });
cpSync(srcDir, distDir, { recursive: true, filter: isIncluded });

// An empty .nojekyll file tells GitHub Pages to skip Jekyll entirely.
writeFileSync(join(distDir, ".nojekyll"), "");

execSync("npx tsc --project configs/tsconfig.json", { cwd: repoRoot, stdio: "inherit" });

console.log(`Site built into ${relative(repoRoot, distDir)}/`);
