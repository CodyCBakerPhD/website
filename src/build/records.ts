// Build-time rendering of the sections of the site that come from JSON
// records (one file per record, validated against a JSON Schema generated from
// the LinkML schema in schemas/records.yaml).
//
// Any problem fails the build, or shows an error in the dev server, instead of
// rendering a broken page: malformed JSON, a schema violation, a repeated
// tag, a failed section-specific check, a mismatch between the records on
// disk and the section's display order, or a link to a record that does not
// exist (see references.ts). Each section's markup replaces its
// <!-- build:NAME --> placeholder on its page, so the published pages are
// static HTML.

import { readdirSync, readFileSync } from "node:fs";
import { basename, relative, resolve, sep } from "node:path";
import type { ErrorObject } from "ajv";
import Ajv2019 from "ajv/dist/2019.js";
import addFormats from "ajv-formats";
import type { Plugin } from "vite";
import type { BaseRecord } from "./generated/records.ts";
import { GITHUB_ACTIVITY_FILE, loadGitHubActivity } from "./github.ts";
import type { CardGrid } from "./grid.ts";
import { fillPlaceholder, hasPlaceholder } from "./html.ts";
import { pageRoute } from "./layout.ts";
import { linkRecords, type RecordNode } from "./references.ts";
import { checkTags } from "./tags.ts";

/** A record, with what its card shows beyond the record itself. */
export interface RecordEntry<T> {
  /** File name without .json, which its card takes as its ID, so other cards can link to it. */
  id: string;
  record: T;
  /** Lines listing its links to and from other records and its evidence (see references.ts). */
  references: readonly string[];
}

export interface SectionOptions<T extends BaseRecord> {
  /** Names the section's <!-- build:NAME --> placeholder. */
  name: string;
  /** The page under src/ holding the placeholder, where links to the section's records point. */
  page: string;
  /** Directory holding one JSON file per record, relative to the repository root. */
  recordsDir: string;
  /** JSON Schema that every record must satisfy, relative to the repository root. */
  schemaFile: string;
  /** Record IDs (file names without .json) in display order. Every record must be listed once. */
  order: readonly string[];
  /** Font Awesome icon marking links to the section's records from other cards. */
  icon: string;
  /** Heading over links to the section's records from a record about them, e.g. "Featured software". */
  related: string;
  /** Text of a link to a record from another card. Defaults to its name. */
  label?: (record: T) => string;
  /** The grid the section lays its cards out in (see grid.ts). */
  grid: CardGrid;
  /** Renders the section's records, in display order, as lines of HTML, laying their cards out in its grid. */
  render: (entries: readonly RecordEntry<T>[], grid: CardGrid) => string[];
  /** Checks a schema cannot express. Returns a description of each problem found. */
  check?: (record: T, context: { publicDir: string }) => string[];
}

/** A section's records, loaded and validated, waiting for their links to other records. */
interface LoadedSection {
  readonly nodes: readonly RecordNode[];
  render(references: ReadonlyMap<string, readonly string[]>): string[];
}

/** A section with its record type erased, so sections of different types can share a list. */
export interface Section {
  readonly name: string;
  readonly page: string;
  /** Paths relative to the repository root whose changes should reload the dev server. */
  readonly watchPaths: readonly string[];
  load(root: string, publicDir: string): LoadedSection;
}

export function defineSection<T extends BaseRecord>(options: SectionOptions<T>): Section {
  const label = options.label ?? ((record: T) => record.name);
  return {
    name: options.name,
    page: options.page,
    watchPaths: [options.recordsDir, options.schemaFile],
    load(root, publicDir) {
      const records = loadRecords(options, root, publicDir);
      const nodes = records.map(({ id, record }) => ({
        path: `${options.recordsDir}/${id}`,
        href: `${pageRoute(options.page)}#${id}`,
        label: label(record),
        icon: options.icon,
        related: options.related,
        record,
      }));
      return {
        nodes,
        render: (references) =>
          options.render(
            records.map(({ id, record }) => ({ id, record, references: references.get(`${options.recordsDir}/${id}`) ?? [] })),
            options.grid,
          ),
      };
    },
  };
}

function describeError(error: ErrorObject): string {
  // The tag vocabulary is long, so name the file to look in instead of listing it.
  if (error.keyword === "anyOf" && /^\/tags\/\d+$/.test(error.instancePath)) {
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

/**
 * Reads every record in `recordsDir` and validates it against the JSON Schema
 * in `schemaFile`. Returns the valid records by ID, and a description of each
 * problem found in the others.
 */
export function readRecords<T>(recordsDir: string, schemaFile: string): { files: string[]; records: Map<string, T>; problems: string[] } {
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
      // specific error beside it is the useful one. An unmet anyOf is the
      // reverse: it also reports why its alternative failed, and the anyOf
      // error alone is the useful one.
      const errors = (validate.errors ?? []).filter((error) => error.keyword !== "if");
      const anyOfPaths = new Set(errors.filter((error) => error.keyword === "anyOf").map((error) => error.instancePath));
      for (const error of errors.filter((error) => error.keyword === "anyOf" || !anyOfPaths.has(error.instancePath))) {
        problems.push(`${file}: ${describeError(error)}`);
      }
      continue;
    }
    records.set(basename(file, ".json"), record);
  }
  return { files, records, problems };
}

/** Reads, validates and orders a section's records, or throws listing every problem. */
function loadRecords<T extends BaseRecord>(options: SectionOptions<T>, root: string, publicDir: string): { id: string; record: T }[] {
  const { files, records: valid, problems } = readRecords<T>(resolve(root, options.recordsDir), resolve(root, options.schemaFile));
  const records = new Map<string, T>();

  for (const [id, record] of valid) {
    const checkProblems = [...checkTags(record.tags), ...(options.check?.(record, { publicDir }) ?? [])];
    problems.push(...checkProblems.map((problem) => `${id}.json: ${problem}`));
    if (checkProblems.length === 0) {
      records.set(id, record);
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
  return options.order.map((id) => ({ id, record: records.get(id) as T }));
}

/** Loads every section, since cards link to records of other sections, or throws listing every problem. */
function loadSections(sections: readonly Section[], root: string, publicDir: string): Map<Section, LoadedSection> {
  const loaded = new Map<Section, LoadedSection>();
  const failures: string[] = [];
  for (const section of sections) {
    try {
      loaded.set(section, section.load(root, publicDir));
    } catch (error) {
      failures.push((error as Error).message);
    }
  }
  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
  return loaded;
}

/** IDs given to more than one element of a page, which would break links to its cards. */
function duplicateIds(html: string): string[] {
  const ids = Array.from(html.matchAll(/\sid="([^"]*)"/g), (match) => match[1]);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

/**
 * Vite plugin that renders each section into its page, in both `vite build`
 * and the dev server (which reloads when a record or schema changes). A build
 * fails if a section's page does not exist or lacks its placeholder.
 */
export function recordSections(sections: readonly Section[], { root }: { root: string }): Plugin {
  const watched = [
    ...sections.flatMap((section) => section.watchPaths.map((path) => resolve(root, path))),
    resolve(root, GITHUB_ACTIVITY_FILE),
  ];
  const placed = new Set<string>();
  let publicDir = "";
  let isBuild = false;

  return {
    name: "record-sections",

    configResolved(config) {
      publicDir = config.publicDir;
      isBuild = config.command === "build";
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
      // exactly as if it had been written in the page by hand.
      order: "pre",
      handler(html, { filename }) {
        const pageName = relative(root, filename);
        const misplaced = sections.filter((section) => section.page !== basename(filename) && hasPlaceholder(html, section.name));
        if (misplaced.length > 0) {
          throw new Error(
            misplaced
              .map((section) => `${pageName} has the <!-- build:${section.name} --> placeholder, but src/build/sections.ts puts that section on ${section.page}`)
              .join("\n"),
          );
        }
        const onPage = sections.filter((section) => section.page === basename(filename));
        if (onPage.length === 0) {
          return html;
        }

        const loaded = loadSections(sections, root, publicDir);
        const { problems, references } = linkRecords(
          [...loaded.values()].flatMap((section) => section.nodes),
          loadGitHubActivity(root),
        );
        if (problems.length > 0) {
          throw new Error(`Invalid links between records, or GitHub activity missing for them:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
        }

        let page = html;
        for (const section of onPage) {
          page = fillPlaceholder(page, section.name, loaded.get(section)!.render(references), pageName);
          placed.add(section.name);
        }
        const duplicates = duplicateIds(page);
        if (duplicates.length > 0) {
          throw new Error(`${pageName} gives more than one element each of these IDs: ${duplicates.join(", ")}`);
        }
        return page;
      },
    },

    // By now every page has been transformed. The dev server transforms pages
    // only as they are requested, so this check is for builds alone.
    buildEnd(error) {
      const missing = sections.filter((section) => !placed.has(section.name));
      if (isBuild && !error && missing.length > 0) {
        this.error(missing.map((section) => `The "${section.name}" section's page, src/${section.page}, does not exist`).join("\n"));
      }
    },
  };
}
