// Build-time rendering of the "Highlighted Projects" section of index.html
// from the JSON records in projects/ (one file per project).
//
// Every record is validated against schemas/project.schema.json, and any
// problem (malformed JSON, a schema violation, a missing logo file) fails the
// build — or shows an error in the dev server — instead of silently rendering
// a broken page. The rendered markup replaces the PROJECTS_MARKER comment in
// index.html, so the published page is plain static HTML.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { Plugin } from "vite";

/** The shape of a record in projects/; mirrors schemas/project.schema.json. */
export interface Project {
  name: string;
  url: string;
  role: string;
  priority: number;
  logo?: {
    src: string;
    widthPercent?: number;
  };
  description: string[];
}

export interface ProjectRecordsOptions {
  /** Directory holding one JSON record per project. */
  recordsDir: string;
  /** JSON Schema that every record must satisfy. */
  schemaFile: string;
}

/** Placeholder in index.html that the rendered projects replace. */
export const PROJECTS_MARKER = "<!-- build:projects -->";

/** Matches the schema's default for logo.widthPercent. */
const DEFAULT_LOGO_WIDTH_PERCENT = 50;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Reads and validates every record in `recordsDir`, returning them in display
 * order. Throws one error listing every problem found across all records.
 */
export function loadProjects(
  { recordsDir, schemaFile }: ProjectRecordsOptions,
  publicDir: string,
): Project[] {
  // A fresh Ajv instance per load: the dev server calls this on every page
  // request, and Ajv refuses to compile a second schema with the same $id.
  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile<Project>(JSON.parse(readFileSync(schemaFile, "utf8")));

  const files = readdirSync(recordsDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    throw new Error(`No project records (*.json) found in ${recordsDir}`);
  }

  const projects: Project[] = [];
  const problems: string[] = [];
  for (const file of files) {
    let record: unknown;
    try {
      record = JSON.parse(readFileSync(join(recordsDir, file), "utf8"));
    } catch (error) {
      problems.push(`${file}: invalid JSON (${(error as Error).message})`);
      continue;
    }

    if (!validate(record)) {
      for (const error of validate.errors ?? []) {
        const unexpected =
          error.keyword === "additionalProperties"
            ? ` ("${(error.params as { additionalProperty: string }).additionalProperty}")`
            : "";
        problems.push(
          `${file}: ${error.instancePath || "(root)"} ${error.message}${unexpected}`,
        );
      }
      continue;
    }

    if (record.logo && !existsSync(resolve(publicDir, record.logo.src))) {
      problems.push(`${file}: /logo/src "${record.logo.src}" does not exist in ${publicDir}`);
      continue;
    }

    projects.push(record);
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid project records in ${recordsDir} (schema: ${basename(schemaFile)}):\n` +
        problems.map((problem) => `  - ${problem}`).join("\n"),
    );
  }

  return projects.sort(
    (a, b) => a.priority - b.priority || a.name.localeCompare(b.name, "en"),
  );
}

/** Renders one project as the markup the site's .work-list styles expect. */
function renderProject(project: Project): string[] {
  const lines = ['<ul class="work-list">'];

  if (project.logo) {
    const width = project.logo.widthPercent ?? DEFAULT_LOGO_WIDTH_PERCENT;
    lines.push(
      `\t<img src="${escapeHtml(project.logo.src)}" alt="${escapeHtml(project.name)} logo"` +
        ` style="display: block; margin-left: auto; margin-right: auto; width: ${width}%;" />`,
      "\t<br>",
    );
  }

  lines.push(
    `\t<li><a href="${escapeHtml(project.url)}">${escapeHtml(project.name)}</a>` +
      ` &nbsp; | &nbsp; ${escapeHtml(project.role)}</li>`,
    "\t<br>",
    "\t<p>",
    project.description
      .map((paragraph) => `\t\t${escapeHtml(paragraph)}`)
      .join("\n\t\t<br><br>\n"),
    "\t</p>",
    "</ul>",
  );

  return lines;
}

/** Replaces PROJECTS_MARKER in `html`, keeping the marker's indentation. */
export function injectProjects(html: string, projects: Project[]): string {
  const markerLine = new RegExp(`^([ \\t]*)${PROJECTS_MARKER}[ \\t]*$`, "m");
  const match = markerLine.exec(html);
  if (!match) {
    throw new Error(`index.html is missing the ${PROJECTS_MARKER} placeholder`);
  }

  const indent = match[1];
  const rendered = projects
    .flatMap(renderProject)
    .join("\n")
    .split("\n")
    .map((line) => indent + line)
    .join("\n");
  // A replacer function, so "$" sequences in the content are not special.
  return html.replace(markerLine, () => rendered);
}

/**
 * Vite plugin that renders projects/*.json into index.html, in both
 * `vite build` and the dev server (which reloads when a record changes).
 */
export function projectRecords(options: ProjectRecordsOptions): Plugin {
  const recordsDir = resolve(options.recordsDir);
  const schemaFile = resolve(options.schemaFile);
  let publicDir = "";

  return {
    name: "project-records",

    configResolved(config) {
      publicDir = config.publicDir;
    },

    configureServer(server) {
      server.watcher.add([recordsDir, schemaFile]);
      const reloadIfRecord = (file: string): void => {
        if (file.startsWith(recordsDir + sep) || file === schemaFile) {
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher.on("add", reloadIfRecord);
      server.watcher.on("change", reloadIfRecord);
      server.watcher.on("unlink", reloadIfRecord);
    },

    transformIndexHtml: {
      // Run before Vite's own HTML processing, so the generated markup is
      // handled exactly as if it had been written in index.html by hand.
      order: "pre",
      handler(html) {
        const projects = loadProjects({ recordsDir, schemaFile }, publicDir);
        return injectProjects(html, projects);
      },
    },
  };
}
