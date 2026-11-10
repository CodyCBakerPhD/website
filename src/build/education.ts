// Rendering of education/*.json for the Education section of the home page.
// The CVs render their Education rubric from the same records.

import type { Education } from "./generated/records.ts";
import { escapeHtml, indent, joinItems, proseList, renderLinkedName } from "./html.ts";

export function renderEducation(education: Education): string[] {
  const lines = [
    `<h4>${joinItems([escapeHtml(education.degree), education.majors.map(renderLinkedName).join(" &amp; ")])}</h4>`,
    // The year the degree was awarded.
    `<div class="card-line">${joinItems([escapeHtml(education.institution), education.end_date.slice(0, 4)])}</div>`,
  ];
  if (education.minors) {
    lines.push(`<div class="card-line">Minors: ${escapeHtml(proseList(education.minors))}</div>`);
  }
  const research = [
    ...(education.research_group ? [`<div class="card-line">Research with the ${renderLinkedName(education.research_group)}</div>`] : []),
    ...(education.theses ?? []).map(({ kind, title, url }) => {
      const quoted = `“${escapeHtml(title)}”`;
      return `<div class="card-line">${escapeHtml(kind)} thesis: ${url ? `<a href="${escapeHtml(url)}">${quoted}</a>` : quoted}</div>`;
    }),
  ];
  if (research.length > 0) {
    lines.push("<br>", ...research);
  }
  if (education.coursework) {
    lines.push("<br>", `<p>Relevant coursework: ${escapeHtml(education.coursework.join(", "))}</p>`);
  }
  return ['<article class="work-list">', ...indent(lines), "</article>"];
}
