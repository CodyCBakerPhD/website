// Rendering of projects/*.json for the "Highlighted Projects" section.

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { distributionName } from "./distributions.ts";
import type { Project } from "./generated/records.ts";
import { escapeHtml, joinItems, renderCard, renderParagraphs } from "./html.ts";
import type { RecordEntry } from "./records.ts";
import { searchAttribute, yearOf, type SearchConfig } from "./search.ts";
import { renderTags } from "./tags.ts";

/** Displayed logo width as a percentage of the content column. */
const LOGO_WIDTH_PERCENT = 50;

/** Logos near-square in shape, which look oversized at the default width. */
const LOGO_WIDTH_PERCENT_OVERRIDES: Readonly<Record<string, number>> = {
  "img/dandi_cache_logo.svg": 25,
  "img/dandi_compute_logo.png": 25,
  "img/dandi_logo.svg": 25,
  "img/ember_logo.png": 25,
  "img/hdmf_logo.png": 25,
  "img/hearth_logo.svg": 25,
  "img/historia_logo.svg": 25,
  "img/neurosift_logo.png": 25,
  "img/nwbwidgets_logo.png": 25,
};

/**
 * Logos drawn in dark blues for light backgrounds, with no dark version of
 * their own, so they sit on a light tile in the dark theme.
 */
const LOGOS_ON_LIGHT_TILE: ReadonlySet<string> = new Set([
  "img/guide_logo.png",
  "img/hdmf_logo.png",
  "img/inspector_logo.png",
  "img/neuroconv_logo.png",
  "img/nwb_benchmarks_logo.png",
  "img/nwbwidgets_logo.png",
  "img/stamped_logo.svg",
]);

/** Years of involvement in the style of the Experience section: "2020-2024", "2025-Present" or "2015". */
function formatYears(startDate: string, endDate?: string): string {
  const start = startDate.slice(0, 4);
  const end = endDate ? endDate.slice(0, 4) : "Present";
  return start === end ? start : `${start}-${end}`;
}

export const projectSearch: SearchConfig<Project> = {
  noun: "projects",
  filters: [
    { key: "name", description: "Name of the project", values: (project) => [project.name] },
    { key: "role", description: "Role on the project", values: (project) => [project.role] },
    { key: "distributed", description: "Where the project is distributed", values: (project) => (project.distributions ?? []).map(distributionName) },
  ],
  years: (project) => [yearOf(project.start_date), project.end_date ? yearOf(project.end_date) : null],
  sorts: [
    // Ongoing projects first, then by when they ended, then by when they started.
    { id: "recent", label: "Most recent", value: (project) => `${project.end_date ?? "9999"} ${project.start_date}`, descending: true },
    { id: "oldest", label: "Oldest", value: (project) => project.start_date },
    { id: "name", label: "Name (A–Z)", value: (project) => project.name },
  ],
};

export function renderProject({ id, record: project, references }: RecordEntry<Project>): string[] {
  const lines: string[] = [];

  if (project.logo) {
    const width = LOGO_WIDTH_PERCENT_OVERRIDES[project.logo] ?? LOGO_WIDTH_PERCENT;
    const logo = (src: string, classes: string[]) =>
      `<img class="${["project-logo", ...classes].join(" ")}" src="${escapeHtml(src)}"` +
      ` alt="${escapeHtml(project.name)} logo" style="width: ${width}%;" />`;
    if (project.logo_dark) {
      // Both are in the page, and the theme shows one, so switching theme needs no reload.
      lines.push(logo(project.logo, ["logo-light"]), logo(project.logo_dark, ["logo-dark"]));
    } else {
      lines.push(logo(project.logo, LOGOS_ON_LIGHT_TILE.has(project.logo) ? ["logo-on-tile"] : []));
    }
    lines.push("<br>");
  }

  const details = [project.role, formatYears(project.start_date, project.end_date)].map(escapeHtml);
  lines.push(`<li>${joinItems([`<a href="${escapeHtml(project.url)}">${escapeHtml(project.name)}</a>`, ...details])}</li>`);
  if (project.contribution) {
    lines.push(`<li>Contribution: ${escapeHtml(project.contribution)}</li>`);
  }
  lines.push("<br>", ...renderParagraphs(project.description), ...references, ...renderTags(project.tags));

  return renderCard(lines, searchAttribute(projectSearch, project), id, project.name);
}

export function checkProject(project: Project, { publicDir }: { publicDir: string }): string[] {
  const problems: string[] = [];
  const logos = [
    { slot: "/logo", logo: project.logo },
    { slot: "/logo_dark", logo: project.logo_dark },
    ...(project.repositories ?? []).map(({ logo }, index) => ({ slot: `/repositories/${index}/logo`, logo })),
  ];
  for (const { slot, logo } of logos) {
    if (logo && !existsSync(resolve(publicDir, logo))) {
      problems.push(`${slot} "${logo}" does not exist in ${publicDir}`);
    }
  }
  if (project.logo_dark && !project.logo) {
    problems.push("/logo_dark is set without /logo, which the light theme needs");
  }
  (project.repositories ?? []).forEach(({ homepage, title }, index) => {
    if (homepage && !title) {
      problems.push(`/repositories/${index} has a homepage, so it is listed as a website and needs a title`);
    }
  });
  // ISO 8601 dates compare correctly as strings, even at mixed precision.
  if (project.end_date && project.end_date < project.start_date) {
    problems.push(`/end_date ${project.end_date} is before /start_date ${project.start_date}`);
  }
  return problems;
}
