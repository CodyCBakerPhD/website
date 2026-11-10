// Rendering of education/*.json for the Education section of the home page.
// The CVs render their Education rubric from the same records.

import type { Education } from "./generated/records.ts";
import { escapeHtml, indent, joinItems, proseList, renderLinkedName } from "./html.ts";

/** "Doctoral research", or "Research" when the record does not say what kind. */
function researchKind(kind?: string): string {
  return kind ? `${kind} research` : "Research";
}

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
    ...(education.research
      ? [`<div class="card-line">${escapeHtml(researchKind(education.research.kind))} with the ${renderLinkedName(education.research.group)}</div>`]
      : []),
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
