// Assembles the deployable site into dist/:
//   1. copies the static assets from docs/ (excluding source-only files),
//   2. adds .nojekyll so GitHub Pages serves the files verbatim (no Jekyll),
//   3. compiles the TypeScript in src/ to dist/js/ via tsc.
//
// Run with `npm run build` (requires Node >= 22.18 for native type stripping).

import { execSync } from "node:child_process";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const docsDir = join(repoRoot, "docs");
const distDir = join(repoRoot, "dist");

// Source-only content that should not ship to the deployed site.
const excludedPaths = new Set(["README.md", "scss", join("js", "site.js")]);
const excludedBasenames = new Set(["convert_jpg_to_favicon.py"]);

function isIncluded(source: string): boolean {
  const relativePath = relative(docsDir, source);
  if (relativePath === "") {
    return true;
  }
  const topLevel = relativePath.split(sep)[0];
  return (
    !excludedPaths.has(relativePath) &&
    !excludedPaths.has(topLevel) &&
    !excludedBasenames.has(basename(source))
  );
}

rmSync(distDir, { recursive: true, force: true });
cpSync(docsDir, distDir, { recursive: true, filter: isIncluded });

// An empty .nojekyll file tells GitHub Pages to skip Jekyll entirely.
writeFileSync(join(distDir, ".nojekyll"), "");

execSync("npx tsc", { cwd: repoRoot, stdio: "inherit" });

console.log(`Site built into ${relative(repoRoot, distDir)}/`);
