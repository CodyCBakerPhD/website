// Rendering of projects/*.json for the "Highlighted Projects" section.

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Project } from "./generated/records.ts";
import { escapeHtml, indent, renderLinks, renderParagraphs, SEPARATOR } from "./html.ts";
import { renderTags } from "./tags.ts";

/** Link labels, in the order the links are shown. */
const LINK_LABELS = {
  packages: "Packages",
} as const;

/** Displayed logo width as a percentage of the content column. */
const LOGO_WIDTH_PERCENT = 50;

/** Logos near-square in shape, which look oversized at the default width. */
const LOGO_WIDTH_PERCENT_OVERRIDES: Readonly<Record<string, number>> = {
  "img/dandi_compute_logo.png": 25,
  "img/hearth_logo.svg": 25,
  "img/historia_logo.svg": 25,
  "img/neurosift_logo.png": 25,
  "img/nwbwidgets_logo.png": 25,
};

/** Years of involvement in the style of the Experience section: "2020-2024", "2025-Present" or "2015". */
function formatYears(startDate: string, endDate?: string): string {
  const start = startDate.slice(0, 4);
  const end = endDate ? endDate.slice(0, 4) : "Present";
  return start === end ? start : `${start}-${end}`;
}

export function renderProject(project: Project): string[] {
  const lines: string[] = [];

  if (project.logo) {
    const width = LOGO_WIDTH_PERCENT_OVERRIDES[project.logo] ?? LOGO_WIDTH_PERCENT;
    lines.push(
      `<img src="${escapeHtml(project.logo)}" alt="${escapeHtml(project.name)} logo"` +
        ` style="display: block; margin-left: auto; margin-right: auto; width: ${width}%;" />`,
      "<br>",
    );
  }

  const details = [project.role, formatYears(project.start_date, project.end_date)].map(escapeHtml);
  lines.push(`<li><a href="${escapeHtml(project.url)}">${escapeHtml(project.name)}</a>${SEPARATOR}${details.join(SEPARATOR)}</li>`);
  if (project.contribution) {
    lines.push(`<li>Contribution: ${escapeHtml(project.contribution)}</li>`);
  }
  const links = renderLinks(project.links, LINK_LABELS);
  if (links.length > 0) {
    lines.push(...links, "<br>");
  }
  lines.push("<br>", ...renderParagraphs(project.description), ...renderTags(project.tags));

  return ['<ul class="work-list">', ...indent(lines), "</ul>"];
}

export function checkProject(project: Project, { publicDir }: { publicDir: string }): string[] {
  const problems: string[] = [];
  if (project.logo && !existsSync(resolve(publicDir, project.logo))) {
    problems.push(`/logo "${project.logo}" does not exist in ${publicDir}`);
  }
  // ISO 8601 dates compare correctly as strings, even at mixed precision.
  if (project.end_date && project.end_date < project.start_date) {
    problems.push(`/end_date ${project.end_date} is before /start_date ${project.start_date}`);
  }
  return problems;
}
