// Build-time rendering of the sections of index.html that come from JSON
// records (one file per record, validated against a JSON Schema generated from
// the LinkML schema in schemas/records.yaml).
//
// Any problem fails the build, or shows an error in the dev server, instead of
// rendering a broken page: malformed JSON, a schema violation, a repeated
// tag, a failed section-specific check, or a mismatch between the records on
// disk and the section's display order. Each section's markup replaces its
// <!-- build:NAME --> placeholder, so the published page is static HTML.

import { readdirSync, readFileSync } from "node:fs";
import { basename, resolve, sep } from "node:path";
import type { ErrorObject } from "ajv";
import Ajv2019 from "ajv/dist/2019.js";
import addFormats from "ajv-formats";
import type { Plugin } from "vite";
import type { BaseRecord } from "./generated/records.ts";
import { checkTags } from "./tags.ts";

export interface SectionOptions<T extends BaseRecord> {
  /** Names the section's <!-- build:NAME --> placeholder in index.html. */
  name: string;
  /** Directory holding one JSON file per record, relative to the repository root. */
  recordsDir: string;
  /** JSON Schema that every record must satisfy, relative to the repository root. */
  schemaFile: string;
  /** Record IDs (file names without .json) in display order. Every record must be listed once. */
  order: readonly string[];
  /** Renders the section's records, in display order, as lines of HTML. */
  render: (records: readonly T[]) => string[];
  /** Checks a schema cannot express. Returns a description of each problem found. */
  check?: (record: T, context: { publicDir: string }) => string[];
}

/** A section with its record type erased, so sections of different types can share a list. */
export interface Section {
  readonly name: string;
  /** Paths relative to the repository root whose changes should reload the dev server. */
  readonly watchPaths: readonly string[];
  render(root: string, publicDir: string): string[];
}

export function defineSection<T extends BaseRecord>(options: SectionOptions<T>): Section {
  return {
    name: options.name,
    watchPaths: [options.recordsDir, options.schemaFile],
    render: (root, publicDir) => options.render(loadRecords(options, root, publicDir)),
  };
}

function describeError(error: ErrorObject): string {
  // The tag vocabulary is long, so name the file to look in instead of listing it.
  if (error.keyword === "enum" && /^\/tags\/\d+$/.test(error.instancePath)) {
    return `${error.instancePath} ${JSON.stringify(error.data)} is not one of the theme:tag pairs listed in schemas/tags.yaml`;
  }
  const detail =
    error.keyword === "additionalProperties"
      ? ` ("${error.params.additionalProperty}")`
      : error.keyword === "const"
        ? ` (${JSON.stringify(error.params.allowedValue)})`
        : "";
  return `${error.instancePath || "(root)"} ${error.message}${detail}`;
}

/** Reads, validates and orders a section's records, or throws listing every problem. */
function loadRecords<T extends BaseRecord>(options: SectionOptions<T>, root: string, publicDir: string): T[] {
  const recordsDir = resolve(root, options.recordsDir);
  const schemaFile = resolve(root, options.schemaFile);

  // A fresh Ajv per load: the dev server reloads on every request, and Ajv
  // refuses to compile a second schema with the same $id.
  // LinkML's JSON Schema generator targets draft 2019-09 and adds its own
  // top-level annotations, which strict mode would otherwise reject.
  // verbose, so each error carries the offending value.
  const ajv = new Ajv2019({ allErrors: true, verbose: true });
  ajv.addVocabulary(["version", "metamodel_version"]);
  addFormats(ajv);
  const validate = ajv.compile<T>(JSON.parse(readFileSync(schemaFile, "utf8")));

  const files = readdirSync(recordsDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  const records = new Map<string, T>();
  const problems: string[] = [];

  for (const file of files) {
    let record: unknown;
    try {
      record = JSON.parse(readFileSync(resolve(recordsDir, file), "utf8"));
    } catch (error) {
      problems.push(`${file}: invalid JSON (${(error as Error).message})`);
      continue;
    }

    if (!validate(record)) {
      // An unmet if/then also reports a generic "must match then schema"; the
      // specific error beside it is the useful one.
      for (const error of (validate.errors ?? []).filter((error) => error.keyword !== "if")) {
        problems.push(`${file}: ${describeError(error)}`);
      }
      continue;
    }

    const checkProblems = [...checkTags(record.tags), ...(options.check?.(record, { publicDir }) ?? [])];
    problems.push(...checkProblems.map((problem) => `${file}: ${problem}`));
    if (checkProblems.length === 0) {
      records.set(basename(file, ".json"), record);
    }
  }

  const listed = new Set<string>();
  for (const id of options.order) {
    if (listed.has(id)) {
      problems.push(`"${id}" appears more than once in the display order`);
    } else if (!files.includes(`${id}.json`)) {
      problems.push(`"${id}" is in the display order, but ${id}.json does not exist`);
    }
    listed.add(id);
  }
  for (const file of files) {
    if (!listed.has(basename(file, ".json"))) {
      problems.push(`${file}: missing from the "${options.name}" display order in src/build/sections.ts`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid records for the "${options.name}" section (${options.recordsDir}/, schema ${options.schemaFile}):\n` +
        problems.map((problem) => `  - ${problem}`).join("\n"),
    );
  }

  // Every listed ID now names a file that passed validation.
  return options.order.map((id) => records.get(id) as T);
}

/** Replaces the section's placeholder in `html` with `lines`, keeping its indentation. */
function injectSection(html: string, name: string, lines: readonly string[]): string {
  const marker = `<!-- build:${name} -->`;
  const markerLine = new RegExp(`^([ \\t]*)${marker}[ \\t]*$`, "m");
  const match = markerLine.exec(html);
  if (!match) {
    throw new Error(`index.html is missing the ${marker} placeholder`);
  }
  const rendered = lines
    .flatMap((line) => line.split("\n"))
    .map((line) => match[1] + line)
    .join("\n");
  // A replacer function, so "$" sequences in the content are not special.
  return html.replace(markerLine, () => rendered);
}

/**
 * Vite plugin that renders every section into index.html, in both `vite build`
 * and the dev server (which reloads when a record or schema changes).
 */
export function recordSections(sections: readonly Section[], { root }: { root: string }): Plugin {
  const watched = sections.flatMap((section) => section.watchPaths.map((path) => resolve(root, path)));
  let publicDir = "";

  return {
    name: "record-sections",

    configResolved(config) {
      publicDir = config.publicDir;
    },

    configureServer(server) {
      server.watcher.add(watched);
      const reloadIfWatched = (file: string): void => {
        if (watched.some((path) => file === path || file.startsWith(path + sep))) {
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher.on("add", reloadIfWatched);
      server.watcher.on("change", reloadIfWatched);
      server.watcher.on("unlink", reloadIfWatched);
    },

    transformIndexHtml: {
      // Before Vite's own HTML processing, so the generated markup is handled
      // exactly as if it had been written in index.html by hand.
      order: "pre",
      handler(html) {
        // Render every section before failing, so one build reports all problems.
        const failures: string[] = [];
        let page = html;
        for (const section of sections) {
          try {
            page = injectSection(page, section.name, section.render(root, publicDir));
          } catch (error) {
            failures.push((error as Error).message);
          }
        }
        if (failures.length > 0) {
          throw new Error(failures.join("\n"));
        }
        return page;
      },
    },
  };
}
