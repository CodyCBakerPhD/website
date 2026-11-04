// Fails when a versioned file changed in a pull request without its version
// increasing. Three things carry versions, each independent of the others:
//   - the LinkML schema, schemas/records.yaml (its top-level `version`), which
//     also covers the tag vocabulary it imports, schemas/tags.yaml,
//   - each record under projects/, datasets/, publications/ or summaries/ (its `record_version`),
//   - the site itself, package.json (its `version`), whenever any file that
//     shapes the built site changed.
// Files that are new in the pull request only need a valid version.
//
// Usage: BASE_REF=main node .github/scripts/check-version-bump.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SCHEMA_FILE = "schemas/records.yaml";
const SCHEMA_PARTS = [SCHEMA_FILE, "schemas/tags.yaml"];
const RECORD_FILE = /^(projects|datasets|publications|summaries)\/[^/]+\.json$/;
const SITE_PATHS = ["src/", "configs/", "projects/", "datasets/", "publications/", "summaries/", "schemas/", "package.json", "package-lock.json"];

const base = `origin/${process.env.BASE_REF || "main"}`;

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/** The file's contents on the base branch, or null if it does not exist there. */
function atBase(path) {
  try {
    return git("show", `${base}:${path}`);
  } catch {
    return null;
  }
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? "");
  return match ? match.slice(1).map(Number) : null;
}

function isGreater(next, previous) {
  for (let i = 0; i < 3; i++) {
    if (next[i] !== previous[i]) return next[i] > previous[i];
  }
  return false;
}

const yamlVersion = (text) => /^version:\s*["']?([^"'\s]+)/m.exec(text)?.[1];
const jsonField = (field) => (text) => JSON.parse(text)[field];

const changed = git("diff", "--name-only", `${base}...HEAD`)
  .split("\n")
  .filter((path) => path && existsSync(path));

const checks = [];
if (SCHEMA_PARTS.some((path) => changed.includes(path))) {
  checks.push({ file: SCHEMA_FILE, label: "version", extract: yamlVersion });
}
for (const file of changed.filter((path) => RECORD_FILE.test(path))) {
  checks.push({ file, label: "record_version", extract: jsonField("record_version") });
}
if (changed.some((path) => SITE_PATHS.some((prefix) => path === prefix || path.startsWith(prefix)))) {
  checks.push({ file: "package.json", label: "version", extract: jsonField("version") });
}

let failed = false;
for (const { file, label, extract } of checks) {
  const next = extract(readFileSync(file, "utf8"));
  const previousText = atBase(file);
  const previous = previousText === null ? undefined : extract(previousText);

  if (!parseVersion(next)) {
    console.log(`::error file=${file}::${file} has no valid ${label} (found ${JSON.stringify(next)}).`);
    failed = true;
  } else if (previousText === null || !parseVersion(previous)) {
    console.log(`${file}: ${label} introduced as ${next}`);
  } else if (!isGreater(parseVersion(next), parseVersion(previous))) {
    console.log(`::error file=${file}::${file} changed, but its ${label} did not increase (${previous} -> ${next}).`);
    failed = true;
  } else {
    console.log(`${file}: ${label} bumped from ${previous} to ${next}`);
  }
}

if (checks.length === 0) {
  console.log("No versioned files changed.");
}
process.exit(failed ? 1 : 0);
